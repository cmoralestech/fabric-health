import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createPatientSchema,
  calculateAge,
  sanitizePatientData,
} from "@/lib/validations";
import {
  getSecurityContext,
  hasEnhancedPermission,
  logAuditEvent,
  sanitizePHI,
  validatePHIInput,
  addSecurityHeaders,
  checkAdvancedRateLimit,
  maskPHI,
  hasPermission,
  checkRateLimit,
} from "@/lib/security";
import {
  handleSecureError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
} from "@/lib/secure-errors";

// GET /api/patients - Get all patients with advanced search and filtering
export async function GET(request: NextRequest) {
  // HIPAA Security: Get security context
  const securityContext = await getSecurityContext(request);

  try {
    if (!securityContext) {
      throw new AuthenticationError();
    }

    // HIPAA Security: Check enhanced permissions
    if (!hasEnhancedPermission(securityContext.userRole, "patients", "read")) {
      await logAuditEvent(
        "UNAUTHORIZED_ACCESS",
        "patients",
        "all",
        securityContext,
        false,
        "Insufficient permissions to read patients"
      );
      throw new AuthorizationError();
    }

    // HIPAA Security: Advanced rate limiting for read operations
    if (
      !checkAdvancedRateLimit(
        securityContext.userId,
        "api_read",
        securityContext.ipAddress
      )
    ) {
      await logAuditEvent(
        "RATE_LIMIT_EXCEEDED",
        "patients",
        "all",
        securityContext,
        false,
        "Read rate limit exceeded"
      );
      throw new RateLimitError();
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const ageMin = searchParams.get("ageMin");
    const ageMax = searchParams.get("ageMax");
    const birthYear = searchParams.get("birthYear");
    const birthDate = searchParams.get("birthDate");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as
      | "asc"
      | "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause for advanced search
    const where: Record<string, unknown> = {};
    const conditions: Record<string, unknown>[] = [];

    // Text search across multiple fields
    if (search && search.trim()) {
      const searchTerm = search.trim();
      conditions.push({
        OR: [
          { name: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phone: { contains: searchTerm } },
        ],
      });
    }

    // Age range filtering
    if (ageMin || ageMax) {
      const ageFilter: { gte?: number; lte?: number } = {};
      if (ageMin) ageFilter.gte = parseInt(ageMin);
      if (ageMax) ageFilter.lte = parseInt(ageMax);
      conditions.push({ age: ageFilter });
    }

    // Birth year filtering
    if (birthYear) {
      const year = parseInt(birthYear);
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      conditions.push({
        birthDate: {
          gte: startOfYear,
          lte: endOfYear,
        },
      });
    }

    // Exact birth date filtering
    if (birthDate) {
      const targetDate = new Date(birthDate);
      const startOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );
      const endOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        23,
        59,
        59
      );
      conditions.push({
        birthDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Build order by clause
    const orderBy: Record<string, "asc" | "desc"> = {};
    if (sortBy === "age") {
      orderBy.age = sortOrder;
    } else if (sortBy === "birthDate") {
      orderBy.birthDate = sortOrder;
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.name = sortOrder;
    }

    // Execute queries
    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { surgeries: true },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    // Add surgery count to each patient
    const patientsWithCounts = patients.map((patient) => ({
      ...patient,
      surgeryCount: patient._count.surgeries,
    }));

    // HIPAA Security: Apply data masking based on user permissions
    const maskedPatients = patientsWithCounts.map((patient) =>
      maskPHI(sanitizePHI(patient), securityContext.userRole)
    );

    // HIPAA Security: Log successful access
    await logAuditEvent(
      "READ",
      "patients",
      `collection_${patients.length}_records`,
      securityContext,
      true,
      `Retrieved ${patients.length} patients with filters: ${JSON.stringify({
        search,
        ageMin,
        ageMax,
        birthYear,
        birthDate,
      })}`
    );

    const response = NextResponse.json({
      patients: maskedPatients,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    return handleSecureError(
      error,
      {
        resource: "patients",
        action: "read",
        userId: securityContext?.userId,
        ipAddress: securityContext?.ipAddress,
        userAgent: securityContext?.userAgent,
      },
      securityContext || undefined
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    // HIPAA Security: Get security context
    const securityContext = await getSecurityContext(request);
    if (!securityContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // HIPAA Security: Check permissions
    if (!hasPermission(securityContext.userRole, "write")) {
      await logAuditEvent(
        "unauthorized_create",
        "patients",
        "new",
        securityContext,
        false,
        "Insufficient permissions"
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // HIPAA Security: Rate limiting
    if (!checkRateLimit(securityContext.ipAddress, 50, 15 * 60 * 1000)) {
      // 50 requests per 15 minutes
      await logAuditEvent(
        "rate_limit_exceeded",
        "patients",
        "new",
        securityContext,
        false,
        "Rate limit exceeded"
      );
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const body = await request.json();

    // HIPAA Security: Validate PHI input
    const phiValidation = validatePHIInput(body, ["name", "birthDate"]);
    if (!phiValidation.valid) {
      await logAuditEvent(
        "invalid_phi_input",
        "patients",
        "new",
        securityContext,
        false,
        phiValidation.errors.join(", ")
      );
      return NextResponse.json(
        { error: "Invalid PHI data", details: phiValidation.errors },
        { status: 400 }
      );
    }

    // Validate the request body
    const validationResult = createPatientSchema.safeParse(body);

    if (!validationResult.success) {
      await logAuditEvent(
        "validation_failed",
        "patients",
        "new",
        securityContext,
        false,
        "Schema validation failed"
      );
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error },
        { status: 400 }
      );
    }

    const { name, birthDate, email, phone } = validationResult.data;

    // HIPAA Security: Sanitize PHI data
    const sanitizedData = sanitizePHI(
      sanitizePatientData({ name, email, phone })
    ) as Record<string, unknown>;

    // Parse birth date and calculate age
    const parsedBirthDate = new Date(birthDate);
    const calculatedAge = calculateAge(parsedBirthDate);

    // Create the patient
    const patient = await prisma.patient.create({
      data: {
        name: sanitizedData.name as string,
        birthDate: parsedBirthDate,
        age: calculatedAge,
        email: sanitizedData.email as string,
        phone: sanitizedData.phone as string,
      },
    });

    // HIPAA Security: Log successful creation
    await logAuditEvent(
      "CREATE",
      "patient",
      patient.id,
      securityContext,
      true,
      `Created patient: ${patient.name}`
    );

    const response = NextResponse.json(sanitizePHI(patient), { status: 201 });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error("Create patient error:", error);

    // HIPAA Security: Log error
    const securityContext = await getSecurityContext(request);
    if (securityContext) {
      await logAuditEvent(
        "CREATE",
        "patient",
        "failed",
        securityContext,
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

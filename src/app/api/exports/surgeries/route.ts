import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  hasPermission,
  logAuditEvent,
  getSecurityContext,
} from "@/lib/security";

// Secure export endpoint for surgery data
export async function POST(request: NextRequest) {
  
  const session = await getServerSession(authOptions);

  try {

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has export permissions
    if (!hasPermission(session.user.role, "export", "surgery")) {
      const securityContext = await getSecurityContext(request);
      if (securityContext) {
        await logAuditEvent(
          "EXPORT_DENIED",
          "surgery",
          "bulk",
          securityContext,
          false,
          "Insufficient permissions for export"
        );
      }
      return NextResponse.json(
        { error: "Insufficient permissions for export" },
        { status: 403 }
      );
    }

    const { format, scope, surgeryIds } = await request.json();

    // Validate export parameters
    if (!["csv", "pdf"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid export format" },
        { status: 400 }
      );
    }

    if (!["all", "selected"].includes(scope)) {
      return NextResponse.json(
        { error: "Invalid export scope" },
        { status: 400 }
      );
    }

    // Build query based on scope and user permissions
    let whereClause: any = {};

    if (scope === "selected" && surgeryIds?.length) {
      whereClause.id = { in: surgeryIds };
    }

    // Role-based data filtering
    if (session.user.role === "SURGEON") {
      // Surgeons can only export their own surgeries
      whereClause.surgeonId = session.user.id;
    } else if (session.user.role === "STAFF") {
      // Staff can only export limited data
      return NextResponse.json(
        { error: "Staff role cannot export surgery data" },
        { status: 403 }
      );
    }

    // Fetch surgery data with role-based field selection
    const surgeries = await prisma.surgery.findMany({
      where: whereClause,
      include: {
        patient: {
          select: getRoleBasedPatientFields(session.user.role),
        },
        surgeon: {
          select: {
            id: true,
            name: true,
            email: session.user.role === "ADMIN", // Only admin sees surgeon email
          },
        },
        scheduledBy: {
          select: {
            id: true,
            name: true,
            email: session.user.role === "ADMIN",
          },
        },
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    // Log the export activity
    const securityContext = await getSecurityContext(request);
    if (securityContext) {
      await logAuditEvent(
        "EXPORT_SUCCESS",
        "surgery",
        `${surgeries.length}_records`,
        securityContext,
        true,
        `Exported ${
          surgeries.length
        } surgery records as ${format.toUpperCase()}`
      );
    }

    // Apply data masking based on user role
    const maskedSurgeries = surgeries.map((surgery) =>
      maskSurgeryData(surgery, session.user.role)
    );

    // Generate export token for secure download
    const exportToken = await generateExportToken({
      userId: session.user.id,
      format,
      recordCount: surgeries.length,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute expiry
    });

    return NextResponse.json({
      success: true,
      exportToken,
      recordCount: surgeries.length,
      format,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Export error:", error);

    if (session) {
      const securityContext = await getSecurityContext(request);
      if (securityContext) {
        await logAuditEvent(
          "EXPORT_ERROR",
          "surgery",
          "unknown",
          securityContext,
          false,
          error instanceof Error ? error.message : "Unknown export error"
        );
      }
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

// Role-based patient field selection
function getRoleBasedPatientFields(role: string) {
  switch (role) {
    case "ADMIN":
      return {
        id: true,
        name: true,
        age: true,
        email: true,
        phone: true,
        address: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        insuranceProvider: true,
        allergies: true,
        medicalConditions: true,
      };
    case "SURGEON":
      return {
        id: true,
        name: true,
        age: true,
        allergies: true,
        medicalConditions: true,
      };
    case "STAFF":
      return {
        id: true,
        name: true,
        age: true,
      };
    default:
      return {
        id: true,
        name: true,
      };
  }
}

// Data masking based on user role
function maskSurgeryData(surgery: any, role: string) {
  const masked = { ...surgery };

  if (role !== "ADMIN") {
    // Mask sensitive fields for non-admin users
    if (masked.patient.email) {
      masked.patient.email = maskEmail(masked.patient.email);
    }
    if (masked.patient.phone) {
      masked.patient.phone = maskPhone(masked.patient.phone);
    }
    if (masked.patient.address) {
      masked.patient.address = "Address on file";
    }
  }

  if (role === "STAFF") {
    // Further restrictions for staff
    delete masked.notes;
    delete masked.patient.allergies;
    delete masked.patient.medicalConditions;
  }

  return masked;
}

function maskEmail(email: string): string {
  const [username, domain] = email.split("@");
  const maskedUsername = username.substring(0, 2) + "***";
  return `${maskedUsername}@${domain}`;
}

function maskPhone(phone: string): string {
  return phone.replace(/\d(?=\d{4})/g, "*");
}

// Generate secure export token
async function generateExportToken(data: any): Promise<string> {
  // In production, use proper JWT or encrypted token
  const tokenData = {
    ...data,
    timestamp: Date.now(),
    nonce: Math.random().toString(36),
  };

  return Buffer.from(JSON.stringify(tokenData)).toString("base64");
}

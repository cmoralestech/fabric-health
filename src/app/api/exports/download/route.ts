import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { logAuditEvent, getSecurityContext } from "@/lib/security";

// Secure download endpoint with token validation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const format = searchParams.get("format");

    if (!token) {
      return NextResponse.json(
        { error: "Export token required" },
        { status: 400 }
      );
    }

    // Validate and decode export token
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, "base64").toString());
    } catch {
      const securityContext = await getSecurityContext(request);
      if (securityContext) {
        await logAuditEvent(
          "DOWNLOAD_INVALID_TOKEN",
          "surgery",
          "unknown",
          securityContext,
          false,
          "Invalid export token provided"
        );
      }
      return NextResponse.json(
        { error: "Invalid export token" },
        { status: 400 }
      );
    }

    // Check token expiry
    if (new Date(tokenData.expiresAt) < new Date()) {
      const securityContext = await getSecurityContext(request);
      if (securityContext) {
        await logAuditEvent(
          "DOWNLOAD_EXPIRED_TOKEN",
          "surgery",
          "unknown",
          securityContext,
          false,
          "Expired export token used"
        );
      }
      return NextResponse.json(
        { error: "Export token expired" },
        { status: 400 }
      );
    }

    // Verify token belongs to current user
    if (tokenData.userId !== session.user.id) {
      const securityContext = await getSecurityContext(request);
      if (securityContext) {
        await logAuditEvent(
          "DOWNLOAD_UNAUTHORIZED_TOKEN",
          "surgery",
          "unknown",
          securityContext,
          false,
          "Attempt to use another user's export token"
        );
      }
      return NextResponse.json(
        { error: "Invalid export token" },
        { status: 403 }
      );
    }

    // Re-fetch data with same permissions (security double-check)
    const surgeries = await fetchSurgeriesForExport(session.user);

    if (surgeries.length === 0) {
      return NextResponse.json(
        { error: "No data available for export" },
        { status: 404 }
      );
    }

    // Generate file based on format
    let fileContent: string | Buffer;
    let mimeType: string;
    let fileName: string;

    if (format === "csv") {
      const csvData = generateCSV(surgeries, session.user.role);
      fileContent = csvData;
      mimeType = "text/csv";
      fileName = `surgery-report-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (format === "pdf") {
      // For PDF, we'll return a JSON response with data for client-side generation
      // This is more secure than generating PDF server-side with user data
      return NextResponse.json({
        success: true,
        data: surgeries.map((surgery) =>
          maskSurgeryForExport(surgery, session.user.role)
        ),
        format: "pdf",
        fileName: `surgery-report-${
          new Date().toISOString().split("T")[0]
        }.pdf`,
      });
    } else {
      return NextResponse.json(
        { error: "Unsupported format" },
        { status: 400 }
      );
    }

    // Log successful download
    const securityContext = await getSecurityContext(request);
    if (securityContext) {
      await logAuditEvent(
        "DOWNLOAD_SUCCESS",
        "surgery",
        `${surgeries.length}_records`,
        securityContext,
        true,
        `Downloaded ${
          surgeries.length
        } surgery records as ${format?.toUpperCase()}`
      );
    }

    // Return file with security headers
    const response = new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });

    return response;
  } catch (error) {
    console.error("Download error:", error);

    if (session) {
      const securityContext = await getSecurityContext(request);
      if (securityContext) {
        await logAuditEvent(
          "DOWNLOAD_ERROR",
          "surgery",
          "unknown",
          securityContext,
          false,
          error instanceof Error ? error.message : "Unknown download error"
        );
      }
    }

    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

async function fetchSurgeriesForExport(user: any) {
  let whereClause: any = {};

  if (user.role === "SURGEON") {
    whereClause.surgeonId = user.id;
  } else if (user.role === "STAFF") {
    return []; // Staff cannot export
  }

  return await prisma.surgery.findMany({
    where: whereClause,
    include: {
      patient: {
        select: getRoleBasedPatientFields(user.role),
      },
      surgeon: {
        select: {
          id: true,
          name: true,
          email: user.role === "ADMIN",
        },
      },
      scheduledBy: {
        select: {
          id: true,
          name: true,
          email: user.role === "ADMIN",
        },
      },
    },
    orderBy: {
      scheduledAt: "desc",
    },
  });
}

function getRoleBasedPatientFields(role: string) {
  switch (role) {
    case "ADMIN":
      return {
        id: true,
        name: true,
        age: true,
        email: true,
        phone: true,
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
    default:
      return {
        id: true,
        name: true,
      };
  }
}

function maskSurgeryForExport(surgery: any, role: string) {
  const masked = { ...surgery };

  if (role !== "ADMIN") {
    if (masked.patient.email) {
      masked.patient.email = maskEmail(masked.patient.email);
    }
    if (masked.patient.phone) {
      masked.patient.phone = maskPhone(masked.patient.phone);
    }
  }

  return masked;
}

function generateCSV(surgeries: any[], role: string): string {
  const headers = getCSVHeaders(role);

  const csvContent = [
    headers.join(","),
    ...surgeries.map((surgery) =>
      getCSVRow(surgery, role)
        .map((field) =>
          typeof field === "string" && field.includes(",")
            ? `"${field.replace(/"/g, '""')}"`
            : field
        )
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}

function getCSVHeaders(role: string): string[] {
  const baseHeaders = [
    "Surgery Type",
    "Status",
    "Scheduled Date",
    "Patient Name",
    "Patient Age",
    "Surgeon",
  ];

  if (role === "ADMIN") {
    return [
      ...baseHeaders,
      "Operating Room",
      "Patient Email",
      "Patient Phone",
      "Allergies",
      "Medical Conditions",
      "Notes",
      "Scheduled By",
    ];
  } else if (role === "SURGEON") {
    return [...baseHeaders, "Allergies", "Medical Conditions", "Notes"];
  }

  return baseHeaders;
}

function getCSVRow(surgery: any, role: string): string[] {
  const baseRow = [
    surgery.type,
    surgery.status,
    new Date(surgery.scheduledAt).toLocaleDateString(),
    surgery.patient.name,
    surgery.patient.age.toString(),
    surgery.surgeon.name,
  ];

  if (role === "ADMIN") {
    return [
      ...baseRow,
      surgery.operatingRoom || "",
      surgery.patient.email || "",
      surgery.patient.phone || "",
      surgery.patient.allergies || "",
      surgery.patient.medicalConditions || "",
      surgery.notes || "",
      surgery.scheduledBy.name,
    ];
  } else if (role === "SURGEON") {
    return [
      ...baseRow,
      surgery.patient.allergies || "",
      surgery.patient.medicalConditions || "",
      surgery.notes || "",
    ];
  }

  return baseRow;
}

function maskEmail(email: string): string {
  const [username, domain] = email.split("@");
  const maskedUsername = username.substring(0, 2) + "***";
  return `${maskedUsername}@${domain}`;
}

function maskPhone(phone: string): string {
  return phone.replace(/\d(?=\d{4})/g, "*");
}

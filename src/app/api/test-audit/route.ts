import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logAuditEvent, getSecurityContext } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can generate test audit logs
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions. Admin access required." },
        { status: 403 }
      );
    }

    // Get security context
    const securityContext = await getSecurityContext(request);
    if (!securityContext) {
      return NextResponse.json(
        { error: "Could not establish security context" },
        { status: 500 }
      );
    }

    // Generate some sample audit logs
    const sampleEvents = [
      {
        action: "LOGIN",
        resource: "user",
        resourceId: session.user.id,
        success: true,
      },
      {
        action: "READ",
        resource: "patient",
        resourceId: "test-patient-001",
        success: true,
      },
      {
        action: "VIEW",
        resource: "surgery",
        resourceId: "test-surgery-001",
        success: true,
      },
      {
        action: "EXPORT",
        resource: "surgery",
        resourceId: "bulk-export",
        success: true,
      },
      {
        action: "CREATE",
        resource: "patient",
        resourceId: "new-patient-001",
        success: true,
      },
      {
        action: "UPDATE",
        resource: "surgery",
        resourceId: "surgery-update-001",
        success: true,
      },
      {
        action: "DELETE",
        resource: "patient",
        resourceId: "deleted-patient-001",
        success: false,
        errorMessage:
          "Insufficient permissions to delete patient with active surgeries",
      },
      {
        action: "EXPORT",
        resource: "patient",
        resourceId: "failed-export",
        success: false,
        errorMessage: "Export token expired",
      },
    ];

    // Create audit logs
    for (const event of sampleEvents) {
      await logAuditEvent(
        event.action,
        event.resource,
        event.resourceId,
        securityContext,
        event.success,
        event.errorMessage
      );
    }

    // Log this test generation itself
    await logAuditEvent(
      "SYSTEM_TEST",
      "audit_logs",
      "test_data_generation",
      securityContext,
      true,
      `Generated ${sampleEvents.length} test audit log entries`
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${sampleEvents.length + 1} test audit log entries`,
      count: sampleEvents.length + 1,
    });
  } catch (error) {
    console.error("Test audit generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate test audit logs" },
      { status: 500 }
    );
  }
}

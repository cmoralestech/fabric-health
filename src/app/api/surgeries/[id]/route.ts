import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { updateSurgerySchema } from "@/lib/validations";
import {
  getSecurityContext,
  logAuditEvent,
  hasPermission,
} from "@/lib/security";

// GET /api/surgeries/[id] - Get single surgery
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get security context for audit logging
    const securityContext = await getSecurityContext(request);
    if (!securityContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions for surgery reading
    if (!hasPermission(securityContext.userRole, "read", "surgery")) {
      await logAuditEvent(
        "VIEW",
        "surgery",
        "unauthorized",
        securityContext,
        false,
        "Insufficient permissions to view surgery details"
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const surgery = await prisma.surgery.findUnique({
      where: { id: id },
      include: {
        patient: true,
        surgeon: {
          select: { id: true, name: true, email: true },
        },
        scheduledBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!surgery) {
      return NextResponse.json({ error: "Surgery not found" }, { status: 404 });
    }

    // Apply role-based access control
    if (
      securityContext.userRole === "SURGEON" &&
      surgery.surgeonId !== securityContext.userId
    ) {
      await logAuditEvent(
        "VIEW",
        "surgery",
        id,
        securityContext,
        false,
        "Attempted to view surgery not assigned to user"
      );
      return NextResponse.json(
        { error: "Forbidden - can only view your own surgeries" },
        { status: 403 }
      );
    }

    // Log successful surgery view
    if (securityContext) {
      await logAuditEvent(
        "VIEW",
        "surgery",
        id,
        securityContext,
        true,
        `Viewed surgery details for ${surgery.type} surgery`
      );
    }

    return NextResponse.json(surgery);
  } catch (error) {
    console.error("Get surgery error:", error);

    // Log failed surgery view attempt
    const securityContext = await getSecurityContext(request);
    if (securityContext) {
      await logAuditEvent(
        "VIEW",
        "surgery",
        "failed",
        securityContext,
        false,
        error instanceof Error ? error.message : "Unknown error viewing surgery"
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/surgeries/[id] - Update surgery
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get security context for audit logging
    const securityContext = await getSecurityContext(request);
    if (!securityContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions for surgery updating
    if (!hasPermission(securityContext.userRole, "write", "surgery")) {
      await logAuditEvent(
        "UPDATE",
        "surgery",
        "unauthorized",
        securityContext,
        false,
        "Insufficient permissions to update surgery"
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSurgerySchema.parse(body);

    // Check if surgery exists
    const existingSurgery = await prisma.surgery.findUnique({
      where: { id: id },
    });

    if (!existingSurgery) {
      return NextResponse.json({ error: "Surgery not found" }, { status: 404 });
    }

    // Apply role-based access control for updates
    if (
      securityContext.userRole === "SURGEON" &&
      existingSurgery.surgeonId !== securityContext.userId
    ) {
      await logAuditEvent(
        "UPDATE",
        "surgery",
        id,
        securityContext,
        false,
        "Attempted to update surgery not assigned to user"
      );
      return NextResponse.json(
        { error: "Forbidden - can only update your own surgeries" },
        { status: 403 }
      );
    } else if (securityContext.userRole === "STAFF") {
      await logAuditEvent(
        "UPDATE",
        "surgery",
        id,
        securityContext,
        false,
        "Staff role cannot update surgeries"
      );
      return NextResponse.json(
        { error: "Forbidden - staff cannot update surgeries" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = { ...validatedData };

    if (validatedData.scheduledAt) {
      updateData.scheduledAt = new Date(validatedData.scheduledAt);
    }

    const surgery = await prisma.surgery.update({
      where: { id: id },
      data: updateData,
      include: {
        patient: true,
        surgeon: {
          select: { id: true, name: true, email: true },
        },
        scheduledBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log successful surgery update
    if (securityContext) {
      await logAuditEvent(
        "UPDATE",
        "surgery",
        id,
        securityContext,
        true,
        `Updated ${surgery.type} surgery details`
      );
    }

    return NextResponse.json({
      message: "Surgery updated successfully",
      surgery,
    });
  } catch (error) {
    console.error("Update surgery error:", error);

    // Log failed surgery update attempt
    const securityContext = await getSecurityContext(request);
    if (securityContext) {
      await logAuditEvent(
        "UPDATE",
        "surgery",
        "failed",
        securityContext,
        false,
        error instanceof Error
          ? error.message
          : "Unknown error updating surgery"
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/surgeries/[id] - Cancel/Delete surgery
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get security context for audit logging
    const securityContext = await getSecurityContext(request);
    if (!securityContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions for surgery deletion/cancellation
    if (!hasPermission(securityContext.userRole, "delete", "surgery")) {
      await logAuditEvent(
        "DELETE",
        "surgery",
        "unauthorized",
        securityContext,
        false,
        "Insufficient permissions to cancel surgery"
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if surgery exists
    const existingSurgery = await prisma.surgery.findUnique({
      where: { id: id },
    });

    if (!existingSurgery) {
      return NextResponse.json({ error: "Surgery not found" }, { status: 404 });
    }

    // Apply role-based access control for cancellation
    if (
      securityContext.userRole === "SURGEON" &&
      existingSurgery.surgeonId !== securityContext.userId
    ) {
      await logAuditEvent(
        "DELETE",
        "surgery",
        id,
        securityContext,
        false,
        "Attempted to cancel surgery not assigned to user"
      );
      return NextResponse.json(
        { error: "Forbidden - can only cancel your own surgeries" },
        { status: 403 }
      );
    } else if (securityContext.userRole === "STAFF") {
      await logAuditEvent(
        "DELETE",
        "surgery",
        id,
        securityContext,
        false,
        "Staff role cannot cancel surgeries"
      );
      return NextResponse.json(
        { error: "Forbidden - staff cannot cancel surgeries" },
        { status: 403 }
      );
    }

    // Update status to CANCELLED instead of deleting
    const surgery = await prisma.surgery.update({
      where: { id: id },
      data: { status: "CANCELLED" },
      include: {
        patient: true,
        surgeon: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log successful surgery cancellation
    if (securityContext) {
      await logAuditEvent(
        "DELETE",
        "surgery",
        id,
        securityContext,
        true,
        `Cancelled ${surgery.type} surgery for patient ${surgery.patient.name}`
      );
    }

    return NextResponse.json({
      message: "Surgery cancelled successfully",
      surgery,
    });
  } catch (error) {
    console.error("Cancel surgery error:", error);

    // Log failed surgery cancellation attempt
    const securityContext = await getSecurityContext(request);
    if (securityContext) {
      await logAuditEvent(
        "DELETE",
        "surgery",
        "failed",
        securityContext,
        false,
        error instanceof Error
          ? error.message
          : "Unknown error cancelling surgery"
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

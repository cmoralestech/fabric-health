import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can view audit logs
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action");
    const resource = searchParams.get("resource");
    const userId = searchParams.get("userId");
    const success = searchParams.get("success");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause for filtering
    const where: any = {};

    if (action && action !== "ALL") {
      where.action = action;
    }

    if (resource && resource !== "ALL") {
      where.resource = resource;
    }

    if (userId) {
      where.userId = userId;
    }

    if (success !== null && success !== "ALL") {
      where.success = success === "true";
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.auditLog.count({ where });

    // Fetch audit logs with pagination
    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get summary statistics
    const summaryStats = await prisma.auditLog.groupBy({
      by: ["action"],
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      _count: {
        action: true,
      },
    });

    const failureStats = await prisma.auditLog.groupBy({
      by: ["success"],
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      _count: {
        success: true,
      },
    });

    return NextResponse.json({
      auditLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1,
      },
      summaryStats,
      failureStats,
    });
  } catch (error) {
    console.error("Audit log fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

// Export actions and resources for filtering
export async function OPTIONS() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get distinct actions and resources for filter options
    const actions = await prisma.auditLog.findMany({
      select: {
        action: true,
      },
      distinct: ["action"],
      orderBy: {
        action: "asc",
      },
    });

    const resources = await prisma.auditLog.findMany({
      select: {
        resource: true,
      },
      distinct: ["resource"],
      orderBy: {
        resource: "asc",
      },
    });

    return NextResponse.json({
      actions: actions.map((a) => a.action),
      resources: resources.map((r) => r.resource),
    });
  } catch (error) {
    console.error("Audit log options error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}

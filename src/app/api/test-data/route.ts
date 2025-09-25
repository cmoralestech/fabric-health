import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/test-data - Get all data without authentication for testing
export async function GET() {
  try {
    const [users, patients, surgeries] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.patient.findMany(),
      prisma.surgery.findMany({
        include: {
          patient: true,
          surgeon: {
            select: { id: true, name: true, email: true },
          },
          scheduledBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      users,
      patients,
      surgeries,
      counts: {
        users: users.length,
        patients: patients.length,
        surgeries: surgeries.length,
      },
    });
  } catch (error) {
    console.error("Test data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test data", details: error },
      { status: 500 }
    );
  }
}

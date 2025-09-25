import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createUserSchema, INVITATION_CODES } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createUserSchema.parse(body);

    // Additional invitation code validation (redundant but explicit)
    const expectedRole =
      INVITATION_CODES[
        validatedData.invitationCode as keyof typeof INVITATION_CODES
      ];
    if (!expectedRole || expectedRole !== validatedData.role) {
      return NextResponse.json(
        { error: "Invalid invitation code for the selected role" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user (exclude invitationCode and hipaaAcknowledgment from stored data)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { invitationCode, hipaaAcknowledgment, ...userData } = validatedData;
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Handle Zod validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      const zodError = error as {
        issues?: Array<{ path: string[]; message: string }>;
        message?: string;
      };
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: zodError.issues
            ? zodError.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              }))
            : zodError.message,
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

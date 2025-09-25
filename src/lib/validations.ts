import { z } from "zod";

// Valid invitation codes for assessment
export const INVITATION_CODES = {
  "ADMIN-2024": "ADMIN",
  "SURGEON-2024": "SURGEON",
  "STAFF-2024": "STAFF",
  "DEMO-ADMIN": "ADMIN",
  "DEMO-SURGEON": "SURGEON",
  "DEMO-STAFF": "STAFF",
} as const;

// User validation schemas
// Enhanced password validation for healthcare systems
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const createUserSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["ADMIN", "SURGEON", "STAFF"]).default("STAFF"),
    invitationCode: z.string().min(1, "Invitation code is required"),
    medicalLicense: z.string().optional(),
    hipaaAcknowledgment: z.boolean().refine((val) => val === true, {
      message: "You must acknowledge HIPAA compliance requirements",
    }),
  })
  .refine(
    (data) => {
      const validCode =
        INVITATION_CODES[data.invitationCode as keyof typeof INVITATION_CODES];
      return validCode === data.role;
    },
    {
      message: "Invalid invitation code for the selected role",
      path: ["invitationCode"],
    }
  )
  .refine(
    (data) => {
      // Require medical license for surgeons
      if (
        data.role === "SURGEON" &&
        (!data.medicalLicense || data.medicalLicense.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Medical license number is required for surgeons",
      path: ["medicalLicense"],
    }
  );

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Patient validation schemas
export const createPatientSchema = z.object({
  name: z.string().min(2, "Patient name must be at least 2 characters"),
  birthDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    return parsedDate <= today && parsedDate >= new Date("1900-01-01");
  }, "Invalid birth date"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

// Surgery validation schemas
export const surgeryTypes = [
  "Appendectomy",
  "Cholecystectomy",
  "Hernia Repair",
  "Knee Replacement",
  "Hip Replacement",
  "Cataract Surgery",
  "Coronary Bypass",
  "Gallbladder Removal",
  "Tonsillectomy",
  "Other",
] as const;

export const createSurgerySchema = z.object({
  scheduledAt: z.string().refine((date) => {
    const scheduledDate = new Date(date);
    const now = new Date();
    return scheduledDate > now;
  }, "Surgery must be scheduled for a future date and time"),
  type: z.enum(surgeryTypes, { error: "Please select a valid surgery type" }),
  /* patientId: z.string().min(1, 'Patient is required'), */
  patientId: z.string().optional(),
  surgeonId: z.string().min(1, "Surgeon is required"),
  notes: z.string().optional(),
});

export const updateSurgerySchema = z.object({
  scheduledAt: z.string().optional(),
  type: z.enum(surgeryTypes).optional(),
  patientId: z.string().optional(),
  surgeonId: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "POSTPONED"])
    .optional(),
});

// Helper function to calculate age
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, "");
};

export const sanitizePatientData = (data: Record<string, unknown>) => {
  return {
    ...data,
    name: sanitizeString(data.name as string),
    email: data.email ? sanitizeString(data.email as string) : null,
    phone: data.phone ? sanitizeString(data.phone as string) : null,
  };
};

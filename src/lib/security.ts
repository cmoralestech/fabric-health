import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

// HIPAA Security Requirements
export interface SecurityContext {
  userId: string;
  userRole: string;
  userEmail: string;
  sessionId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// Audit logging for HIPAA compliance
export interface AuditLog {
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userRole: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

// Security headers for HIPAA compliance
export const HIPAA_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// Get security context from request
export async function getSecurityContext(
  request: NextRequest
): Promise<SecurityContext | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "Unknown";

    return {
      userId: session.user.id,
      userRole: session.user.role,
      userEmail: session.user.email,
      sessionId: session.user.id, // In production, use actual session ID
      timestamp: new Date(),
      ipAddress,
      userAgent,
    };
  } catch (error) {
    console.error("Security context error:", error);
    return null;
  }
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "Unknown";
}

// Role-based access control for HIPAA
export function hasPermission(
  userRole: string,
  action: string,
  resource: string
): boolean {
  const permissions = {
    ADMIN: ["read", "write", "delete", "audit", "export"],
    SURGEON: ["read", "write", "export"], // Surgeons can export their own data
    STAFF: ["read"], // Staff cannot export PHI
  };

  const userPermissions =
    permissions[userRole as keyof typeof permissions] || [];
  return userPermissions.includes(action);
}

// Audit logging for HIPAA compliance
export async function logAuditEvent(
  action: string,
  resource: string,
  resourceId: string,
  context: SecurityContext,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const auditLog: AuditLog = {
    action,
    resource,
    resourceId,
    userId: context.userId,
    userRole: context.userRole,
    timestamp: context.timestamp,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    success,
    errorMessage,
  };

  // In production, this should be sent to a secure audit logging service
  console.log("AUDIT_LOG:", JSON.stringify(auditLog));

  // TODO: Implement secure audit logging to HIPAA-compliant storage
  // This could be AWS CloudTrail, Azure Monitor, or similar
}

// Data sanitization for PHI
export function sanitizePHI(data: any): any {
  if (typeof data === "string") {
    // Remove potential XSS and injection attempts
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePHI(item));
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizePHI(value);
    }
    return sanitized;
  }

  return data;
}

// Rate limiting for API protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  ipAddress: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const key = ipAddress;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

// Clean up expired rate limit entries periodically
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Input validation for HIPAA compliance
export function validatePHIInput(
  data: any,
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  for (const field of requiredFields) {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format");
  }

  // Validate phone format (basic)
  if (
    data.phone &&
    !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ""))
  ) {
    errors.push("Invalid phone format");
  }

  // Validate age is reasonable
  if (data.age && (data.age < 0 || data.age > 150)) {
    errors.push("Invalid age range");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Secure response headers
export function addSecurityHeaders(response: Response): Response {
  Object.entries(HIPAA_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

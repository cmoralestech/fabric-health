import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import crypto from "crypto";

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

// Enhanced HIPAA-compliant audit logging with database storage
export async function logAuditEventToDatabase(
  action: string,
  resource: string,
  resourceId: string,
  context: SecurityContext,
  success: boolean,
  errorMessage?: string,
  additionalData?: Record<string, any>
): Promise<void> {
  try {
    // Create comprehensive audit record
    const auditRecord = {
      action,
      resource,
      resourceId,
      userId: context.userId,
      userRole: context.userRole,
      userEmail: context.userEmail,
      timestamp: context.timestamp,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      success,
      errorMessage: errorMessage || null,
      sessionId: context.sessionId,
      additionalData: additionalData ? JSON.stringify(additionalData) : null
    }

    // Store in audit log table using type-safe Prisma client
    // Calculate retention date (6 years from now for HIPAA compliance)
    const retentionDate = new Date()
    retentionDate.setFullYear(retentionDate.getFullYear() + 6)

    await prisma.auditLog.create({
      data: {
        action: auditRecord.action,
        resource: auditRecord.resource,
        resourceId: auditRecord.resourceId,
        userId: auditRecord.userId,
        userRole: auditRecord.userRole,
        userEmail: auditRecord.userEmail,
        timestamp: auditRecord.timestamp,
        ipAddress: auditRecord.ipAddress,
        userAgent: auditRecord.userAgent,
        success: auditRecord.success,
        errorMessage: auditRecord.errorMessage,
        sessionId: auditRecord.sessionId,
        additionalData: auditRecord.additionalData,
        retentionDate
      }
    })

    // Also log to console for immediate visibility (in production, send to SIEM)
    console.log('HIPAA_AUDIT:', JSON.stringify(auditRecord))
  } catch (error) {
    // Critical: Audit logging must never fail silently
    console.error('CRITICAL: Audit logging failed:', error)
    // In production, this should trigger alerts
  }
}

// Enhanced role-based access control with granular permissions
export interface EnhancedPermissions {
  patients: {
    read: 'none' | 'own' | 'assigned' | 'department' | 'all'
    write: 'none' | 'own' | 'assigned' | 'department' | 'all'
    delete: boolean
    export: boolean
    viewPHI: boolean
    viewSensitive: boolean
  }
  surgeries: {
    read: 'none' | 'own' | 'assigned' | 'department' | 'all'
    schedule: boolean
    modify: 'none' | 'own' | 'assigned' | 'all'
    cancel: boolean
    export: boolean
  }
  system: {
    userManagement: boolean
    auditAccess: boolean
    systemConfig: boolean
    dataExport: boolean
  }
}

const ROLE_PERMISSIONS: Record<string, EnhancedPermissions> = {
  ADMIN: {
    patients: {
      read: 'all',
      write: 'all',
      delete: true,
      export: true,
      viewPHI: true,
      viewSensitive: true
    },
    surgeries: {
      read: 'all',
      schedule: true,
      modify: 'all',
      cancel: true,
      export: true
    },
    system: {
      userManagement: true,
      auditAccess: true,
      systemConfig: true,
      dataExport: true
    }
  },
  SURGEON: {
    patients: {
      read: 'assigned',
      write: 'assigned',
      delete: false,
      export: true,
      viewPHI: true,
      viewSensitive: true
    },
    surgeries: {
      read: 'assigned',
      schedule: true,
      modify: 'own',
      cancel: false,
      export: true
    },
    system: {
      userManagement: false,
      auditAccess: false,
      systemConfig: false,
      dataExport: false
    }
  },
  STAFF: {
    patients: {
      read: 'department',
      write: 'none',
      delete: false,
      export: false,
      viewPHI: false,
      viewSensitive: false
    },
    surgeries: {
      read: 'department',
      schedule: false,
      modify: 'none',
      cancel: false,
      export: false
    },
    system: {
      userManagement: false,
      auditAccess: false,
      systemConfig: false,
      dataExport: false
    }
  }
}

export function hasEnhancedPermission(
  userRole: string,
  resource: keyof EnhancedPermissions,
  action: string,
  scope?: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole]
  if (!permissions) return false

  const resourcePermissions = permissions[resource] as any
  if (!resourcePermissions) return false

  const permission = resourcePermissions[action]
  
  // Boolean permissions
  if (typeof permission === 'boolean') {
    return permission
  }
  
  // Scope-based permissions
  if (typeof permission === 'string') {
    if (permission === 'none') return false
    if (permission === 'all') return true
    if (scope && permission === scope) return true
    
    // Hierarchical permissions
    const hierarchy = ['own', 'assigned', 'department', 'all']
    const permissionIndex = hierarchy.indexOf(permission)
    const scopeIndex = scope ? hierarchy.indexOf(scope) : -1
    
    return permissionIndex >= scopeIndex
  }
  
  return false
}

// Data encryption for PHI (HIPAA requirement)
const ENCRYPTION_KEY = process.env.PHI_ENCRYPTION_KEY || 'dev-key-32-chars-long-for-aes-256'
const ALGORITHM = 'aes-256-gcm'

export function encryptPHI(data: string): { encrypted: string; iv: string; tag: string } {
  // Generate random IV for each encryption (security best practice)
  const iv = crypto.randomBytes(16)
  
  // Create cipher with proper key derivation for AES-256-GCM
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32) // Derive 256-bit key
  const cipher = crypto.createCipherGCM(ALGORITHM, key, iv)
  
  // Set Additional Authenticated Data (AAD) for integrity
  cipher.setAAD(Buffer.from('PHI-DATA', 'utf8'))
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  }
}

export function decryptPHI(encryptedData: { encrypted: string; iv: string; tag: string }): string {
  // Derive the same key used for encryption
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32) // Derive 256-bit key
  const iv = Buffer.from(encryptedData.iv, 'hex')
  
  const decipher = crypto.createDecipherGCM(ALGORITHM, key, iv)
  
  // Set Additional Authenticated Data (AAD) - must match encryption
  decipher.setAAD(Buffer.from('PHI-DATA', 'utf8'))
  
  // Set authentication tag for integrity verification
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Data masking for non-production environments
export function maskPHI(data: any, userRole: string): any {
  const permissions = ROLE_PERMISSIONS[userRole]
  if (!permissions?.patients.viewPHI) {
    return maskSensitiveFields(data)
  }
  return data
}

function maskSensitiveFields(data: any): any {
  if (typeof data === 'string') {
    // Mask email addresses
    if (data.includes('@')) {
      const [local, domain] = data.split('@')
      return `${local.charAt(0)}***@${domain}`
    }
    // Mask phone numbers
    if (/^\d{10,15}$/.test(data.replace(/\D/g, ''))) {
      return `***-***-${data.slice(-4)}`
    }
    return data
  }
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveFields(item))
  }
  
  if (typeof data === 'object' && data !== null) {
    const masked: any = {}
    for (const [key, value] of Object.entries(data)) {
      // Mask specific PHI fields
      if (['email', 'phone', 'ssn', 'address'].includes(key.toLowerCase())) {
        masked[key] = maskSensitiveFields(value)
      } else if (key.toLowerCase().includes('name') && typeof value === 'string') {
        // Mask names partially
        const parts = value.split(' ')
        masked[key] = parts.map((part, index) => 
          index === 0 ? part : part.charAt(0) + '***'
        ).join(' ')
      } else {
        masked[key] = value
      }
    }
    return masked
  }
  
  return data
}

// Session security enhancements
export interface SecureSession {
  id: string
  userId: string
  createdAt: Date
  lastAccessedAt: Date
  expiresAt: Date
  ipAddress: string
  userAgent: string
  isActive: boolean
  deviceFingerprint?: string
}

export async function createSecureSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<SecureSession> {
  const sessionId = crypto.randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + (30 * 60 * 1000)) // 30 minutes
  
  const session: SecureSession = {
    id: sessionId,
    userId,
    createdAt: now,
    lastAccessedAt: now,
    expiresAt,
    ipAddress,
    userAgent,
    isActive: true,
    deviceFingerprint: generateDeviceFingerprint(userAgent, ipAddress)
  }
  
  // Store session in database or cache
  // Implementation depends on your session storage strategy
  
  return session
}

function generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
  const data = `${userAgent}${ipAddress}`
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

// Advanced rate limiting with different limits for different operations
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // NOTE: Login attempts increased for assessment/demo purposes
  // Production should use 5 attempts per 15 minutes for security
  login: { windowMs: 15 * 60 * 1000, maxRequests: 20 }, // 20 attempts per 15 min (ASSESSMENT MODE)
  api_read: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 reads per minute
  api_write: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 writes per minute
  export: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 exports per hour
  search: { windowMs: 60 * 1000, maxRequests: 50 } // 50 searches per minute
}

export function checkAdvancedRateLimit(
  key: string,
  operation: keyof typeof RATE_LIMIT_CONFIGS,
  ipAddress: string
): boolean {
  const config = RATE_LIMIT_CONFIGS[operation]
  if (!config) return true
  
  const rateLimitKey = `${operation}_${ipAddress}_${key}`
  return checkRateLimit(rateLimitKey, config.maxRequests, config.windowMs)
}

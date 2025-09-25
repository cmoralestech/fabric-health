import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import { logAuditEvent, SecurityContext } from './security'

// Security-first error handling for medical applications
// Never expose sensitive information or system internals

export interface SecureErrorResponse {
  error: string
  code?: string
  timestamp: string
  requestId: string
}

export interface ErrorContext {
  userId?: string
  resource?: string
  action?: string
  ipAddress?: string
  userAgent?: string
}

// Generate secure request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Log detailed error for internal use while returning sanitized version to client
export async function handleSecureError(
  error: unknown,
  context: ErrorContext = {},
  securityContext?: SecurityContext
): Promise<NextResponse> {
  const requestId = generateRequestId()
  const timestamp = new Date().toISOString()
  
  // Log the full error details for internal debugging (never sent to client)
  const fullErrorDetails = {
    requestId,
    timestamp,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    securityContext: securityContext ? {
      userId: securityContext.userId,
      userRole: securityContext.userRole,
      ipAddress: securityContext.ipAddress
    } : undefined
  }
  
  // Log to secure audit system (in production, this goes to SIEM/log aggregation)
  console.error('SECURE_ERROR_LOG:', JSON.stringify(fullErrorDetails, null, 2))
  
  // Audit security-related failures
  if (securityContext) {
    await logAuditEvent(
      'ERROR_OCCURRED',
      context.resource || 'unknown',
      'system',
      securityContext,
      false,
      `Request ${requestId} failed`
    )
  }

  // Return sanitized error response based on error type
  return createSanitizedErrorResponse(error, requestId, timestamp)
}

function createSanitizedErrorResponse(
  error: unknown,
  requestId: string,
  timestamp: string
): NextResponse {
  // Handle different error types with appropriate sanitization
  
  // Validation errors (safe to show field-level issues)
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: sanitizeValidationMessage(err.message)
    }))
    
    return NextResponse.json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: fieldErrors,
      timestamp,
      requestId
    }, { status: 400 })
  }

  // Database constraint errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint
        return NextResponse.json({
          error: 'A record with this information already exists',
          code: 'DUPLICATE_RECORD',
          timestamp,
          requestId
        }, { status: 409 })
      
      case 'P2025': // Record not found
        return NextResponse.json({
          error: 'The requested resource was not found',
          code: 'RESOURCE_NOT_FOUND',
          timestamp,
          requestId
        }, { status: 404 })
      
      case 'P2003': // Foreign key constraint
        return NextResponse.json({
          error: 'Cannot perform this operation due to related data',
          code: 'CONSTRAINT_VIOLATION',
          timestamp,
          requestId
        }, { status: 400 })
      
      default:
        // Don't expose internal database error codes
        return NextResponse.json({
          error: 'A database error occurred',
          code: 'DATABASE_ERROR',
          timestamp,
          requestId
        }, { status: 500 })
    }
  }

  // Prisma validation errors
  if (error instanceof PrismaClientValidationError) {
    return NextResponse.json({
      error: 'Invalid data format provided',
      code: 'INVALID_DATA',
      timestamp,
      requestId
    }, { status: 400 })
  }

  // Authentication/Authorization errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp,
        requestId
      }, { status: 401 })
    }
    
    if (message.includes('forbidden') || message.includes('permission')) {
      return NextResponse.json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        timestamp,
        requestId
      }, { status: 403 })
    }
    
    if (message.includes('rate limit')) {
      return NextResponse.json({
        error: 'Too many requests. Please try again later',
        code: 'RATE_LIMITED',
        timestamp,
        requestId
      }, { status: 429 })
    }
  }

  // Generic server error (never expose internal details)
  return NextResponse.json({
    error: 'An internal server error occurred',
    code: 'INTERNAL_ERROR',
    timestamp,
    requestId
  }, { status: 500 })
}

// Sanitize validation messages to prevent information leakage
function sanitizeValidationMessage(message: string): string {
  // Remove any potential sensitive information from validation messages
  return message
    .replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[SSN]') // SSN patterns
    .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CARD]') // Credit card patterns
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email patterns
    .replace(/\b\d{10,15}\b/g, '[PHONE]') // Phone patterns
}

// Helper for common API error responses
export class SecureApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'SecureApiError'
  }
}

// Rate limiting error
export class RateLimitError extends SecureApiError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMITED')
  }
}

// Authorization error
export class AuthorizationError extends SecureApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN')
  }
}

// Authentication error
export class AuthenticationError extends SecureApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

// Validation error
export class ValidationError extends SecureApiError {
  constructor(message = 'Validation failed', public details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

// Resource not found error
export class NotFoundError extends SecureApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'RESOURCE_NOT_FOUND')
  }
}

// Conflict error (duplicates, etc.)
export class ConflictError extends SecureApiError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT')
  }
}

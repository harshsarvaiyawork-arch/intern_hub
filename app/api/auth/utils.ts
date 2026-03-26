import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface DecodedToken {
  sub: string;
  'https://hasura.io/jwt/claims': {
    'x-hasura-user-id': string;
    'x-hasura-role': string;
    'x-hasura-department-id'?: string;
  };
}

/**
 * Extract and decode JWT token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  return authHeader?.replace('Bearer ', '') || null;
}

/**
 * Decode JWT token (without verification - for getting claims)
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch (err) {
    return null;
  }
}

/**
 * Get user info from token
 */
export function getUserFromToken(decoded: DecodedToken) {
  return {
    userId: decoded['https://hasura.io/jwt/claims']['x-hasura-user-id'],
    role: decoded['https://hasura.io/jwt/claims']['x-hasura-role'],
    departmentId: decoded['https://hasura.io/jwt/claims']['x-hasura-department-id'],
  };
}

/**
 * Check if user is authenticated
 */
export function checkAuth(request: NextRequest): {
  success: boolean;
  response?: NextResponse;
  decoded?: DecodedToken;
} {
  const token = extractToken(request);
  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
    };
  }

  return { success: true, decoded };
}

/**
 * Check if user has admin role
 */
export function checkAdminRole(decoded: DecodedToken): boolean {
  return decoded['https://hasura.io/jwt/claims']['x-hasura-role'] === 'admin';
}

/**
 * Check if user is admin, return error response if not
 */
export function requireAdmin(decoded: DecodedToken): NextResponse | null {
  if (!checkAdminRole(decoded)) {
    console.warn(`[AUTH] Permission denied: user attempted non-admin operation`);
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }
  return null;
}

/**
 * Log permission denial
 */
export function logPermissionDenial(userId: string, role: string, operation: string): void {
  console.warn(`[AUTH] Permission denied - User: ${userId}, Role: ${role}, Operation: ${operation}`);
}

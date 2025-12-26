import { NextRequest } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { getAccessToken } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const token = await getAccessToken();
  
  if (!token) {
    throw new AuthenticationError('Authentication required');
  }

  try {
    return verifyAccessToken(token);
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
}

export function requireRole(user: JWTPayload, ...allowedRoles: string[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
  }
}

export function requireOwner(user: JWTPayload, resourceUserId: string) {
  if (user.userId !== resourceUserId && user.role !== 'ADMIN') {
    throw new AuthorizationError('Access denied. You do not own this resource.');
  }
}


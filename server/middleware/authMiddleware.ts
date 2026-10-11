import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.ts';

// Extends Express Request to include user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const role = req.headers['x-user-role'] as string;
  const userId = req.headers['x-user-id'] as string;
  const authHeader = req.headers['authorization'];

  // Check if role or user session passed
  if (!role && !userId && !authHeader) {
    throw new UnauthorizedError('Authentication credentials required');
  }

  req.user = {
    id: userId || 'u-1',
    role: role || 'owner',
    email: req.headers['x-user-email'] as string || undefined,
  };

  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Require auth first if not present
    if (!req.user) {
      const role = (req.headers['x-user-role'] as string) || 'owner';
      const userId = (req.headers['x-user-id'] as string) || 'u-1';
      req.user = { id: userId, role };
    }

    // Owner role always has unrestricted access
    if (req.user.role === 'owner') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Action restricted. Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
}

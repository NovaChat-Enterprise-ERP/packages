import type { Request, RequestHandler } from 'express';
import type { AuthContext, Permission } from '@novachat-enterprise-erp/contracts';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';

export type UserContext = AuthContext & { userId: string };
export type MemberContext = UserContext & { workspaceId: string; memberId: string; role: string };

export const requireUser: RequestHandler = (req, _res, next) => {
  if (!req.auth?.userId) return next(new UnauthorizedError());
  next();
};

export const requireService: RequestHandler = (req, _res, next) => {
  if (!req.auth?.service) return next(new ForbiddenError('Internal endpoint'));
  next();
};

export const requireMember: RequestHandler = (req, _res, next) => {
  const auth = req.auth;
  if (!auth?.userId) return next(new UnauthorizedError());
  if (!auth.workspaceId || !auth.memberId) {
    return next(new ForbiddenError('You are not a member of this workspace'));
  }
  if (req.params.workspaceId && req.params.workspaceId !== auth.workspaceId) {
    return next(new ForbiddenError('Workspace mismatch'));
  }
  next();
};

export const requirePermission =
  (...permissions: Permission[]): RequestHandler =>
  (req, _res, next) => {
    const granted = req.auth?.permissions ?? [];
    const missing = permissions.filter((p) => !granted.includes(p));
    if (missing.length > 0) return next(new ForbiddenError(`Missing permission: ${missing.join(', ')}`));
    next();
  };

export const userContext = (req: Request): UserContext => {
  if (!req.auth?.userId) throw new UnauthorizedError();
  return req.auth as UserContext;
};

export const memberContext = (req: Request): MemberContext => {
  const auth = req.auth;
  if (!auth?.userId) throw new UnauthorizedError();
  if (!auth.workspaceId || !auth.memberId || !auth.role) {
    throw new ForbiddenError('You are not a member of this workspace');
  }
  return auth as MemberContext;
};

import { z } from 'zod';
import { ALL_PERMISSIONS } from './permissions.js';

export const workspaceSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes');

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: workspaceSlugSchema,
});
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    slug: workspaceSlugSchema.optional(),
    logoUrl: z.url().nullable().optional(),
    description: z.string().trim().max(280).nullable().optional(),
    allowMemberInvites: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  ownerId: string;
  allowMemberInvites: boolean;
  createdAt: string;
}

export interface WorkspaceSummaryDto extends WorkspaceDto {
  role: string;
  memberId: string;
  permissions: string[];
}

export const memberStatusSchema = z.object({
  emoji: z.string().max(16).nullable().optional(),
  text: z.string().trim().max(100).nullable().optional(),
  expiresAt: z.iso.datetime().nullable().optional(),
});

export const updateMyMembershipSchema = z
  .object({
    status: memberStatusSchema.optional(),
    isAway: z.boolean().optional(),
    notificationsPausedUntil: z.iso.datetime().nullable().optional(),
    title: z.string().trim().max(80).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');
export type UpdateMyMembershipInput = z.infer<typeof updateMyMembershipSchema>;

export interface MemberDto {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
  title: string | null;
  role: { id: string; key: string; name: string };
  status: { emoji: string | null; text: string | null; expiresAt: string | null };
  isAway: boolean;
  notificationsPausedUntil: string | null;
  deactivatedAt: string | null;
  joinedAt: string;
}

export const listMembersQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'deactivated', 'all']).default('active'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;

export const changeMemberRoleSchema = z.object({ roleId: z.string().min(1) });

export const transferOwnershipSchema = z.object({ memberId: z.string().min(1) });

const permissionEnum = z.enum(ALL_PERMISSIONS as [string, ...string[]]);

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(200).nullable().optional(),
  permissions: z.array(permissionEnum).max(ALL_PERMISSIONS.length),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = createRoleSchema.partial();
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export interface RoleDto {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  memberCount: number;
}

export const createInvitesSchema = z.object({
  emails: z.array(z.email().toLowerCase()).min(1).max(50),
  roleId: z.string().min(1).optional(),
});
export type CreateInvitesInput = z.infer<typeof createInvitesSchema>;

export const createInviteLinkSchema = z.object({
  roleId: z.string().min(1).optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
  maxUses: z.number().int().min(1).max(1000).nullable().default(null),
});
export type CreateInviteLinkInput = z.infer<typeof createInviteLinkSchema>;

export interface InviteDto {
  id: string;
  workspaceId: string;
  email: string | null;
  roleId: string;
  roleName: string;
  invitedBy: string;
  expiresAt: string;
  maxUses: number | null;
  uses: number;
  revokedAt: string | null;
  createdAt: string;
  url?: string;
}

export interface InvitePreviewDto {
  workspace: { id: string; name: string; slug: string; logoUrl: string | null };
  inviterName: string | null;
  email: string | null;
  expiresAt: string;
  valid: boolean;
  reason?: 'expired' | 'revoked' | 'exhausted';
}

export interface WorkspaceAccessDto {
  workspaceId: string;
  memberId: string;
  role: string;
  permissions: string[];
  deactivated: boolean;
}

export interface AuditLogDto {
  id: string;
  workspaceId: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export const PERMISSIONS = {
  WORKSPACE_MANAGE: 'workspace:manage',
  WORKSPACE_DELETE: 'workspace:delete',
  MEMBERS_INVITE: 'members:invite',
  MEMBERS_MANAGE: 'members:manage',
  ROLES_MANAGE: 'roles:manage',
  AUDIT_VIEW: 'audit:view',
  CHANNELS_CREATE: 'channels:create',
  CHANNELS_MANAGE: 'channels:manage',
  MESSAGES_DELETE_ANY: 'messages:delete_any',
  FILES_DELETE_ANY: 'files:delete_any',
  MEETINGS_CREATE: 'meetings:create',
  MEETINGS_MANAGE_ANY: 'meetings:manage_any',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

export const SYSTEM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  owner: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.WORKSPACE_DELETE),
  member: [PERMISSIONS.MEMBERS_INVITE, PERMISSIONS.CHANNELS_CREATE, PERMISSIONS.MEETINGS_CREATE],
  guest: [],
};

export const hasPermission = (granted: readonly string[], required: Permission): boolean =>
  granted.includes(required);

export interface AuthContext {
  userId?: string;
  email?: string;
  name?: string;
  service?: string;
  workspaceId?: string;
  memberId?: string;
  role?: string;
  permissions: string[];
}

export const INTERNAL_HEADERS = {
  CONTEXT: 'x-internal-context',
  TIMESTAMP: 'x-internal-ts',
  SIGNATURE: 'x-internal-signature',
  REQUEST_ID: 'x-request-id',
} as const;

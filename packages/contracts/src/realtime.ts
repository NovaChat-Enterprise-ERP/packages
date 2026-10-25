export const SOCKET_EVENTS = {
  MESSAGE_CREATED: 'message:created',
  MESSAGE_UPDATED: 'message:updated',
  MESSAGE_DELETED: 'message:deleted',
  REACTION_UPDATED: 'reaction:updated',
  CONVERSATION_UPSERTED: 'conversation:upserted',
  CONVERSATION_REMOVED: 'conversation:removed',
  CONVERSATION_READ: 'conversation:read',
  MEMBER_UPDATED: 'member:updated',
  PRESENCE_UPDATED: 'presence:updated',
  TYPING: 'typing',
  NOTIFICATION_CREATED: 'notification:created',
  MEETING_UPDATED: 'meeting:updated',
  WORKSPACE_UPDATED: 'workspace:updated',
} as const;

export const CLIENT_EVENTS = {
  TYPING: 'typing',
  PRESENCE_HEARTBEAT: 'presence:heartbeat',
  PRESENCE_QUERY: 'presence:query',
} as const;

export interface TypingPayload {
  conversationId: string;
  parentId?: string | null;
  userId?: string;
}

export interface PresencePayload {
  userId: string;
  online: boolean;
}

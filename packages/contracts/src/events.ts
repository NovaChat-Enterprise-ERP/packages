export const EVENTS = {
  USER_UPDATED: 'user.updated',
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  MEMBER_DEACTIVATED: 'member.deactivated',
  MEMBER_REACTIVATED: 'member.reactivated',
  MEMBER_STATUS_CHANGED: 'member.status_changed',
  ROLE_UPDATED: 'role.updated',
  INVITE_CREATED: 'invite.created',
  INVITE_ACCEPTED: 'invite.accepted',
  CONVERSATION_CREATED: 'conversation.created',
  CONVERSATION_UPDATED: 'conversation.updated',
  CONVERSATION_ARCHIVED: 'conversation.archived',
  CONVERSATION_DELETED: 'conversation.deleted',
  CONVERSATION_MEMBER_ADDED: 'conversation.member_added',
  CONVERSATION_MEMBER_REMOVED: 'conversation.member_removed',
  MESSAGE_CREATED: 'message.created',
  MESSAGE_UPDATED: 'message.updated',
  MESSAGE_DELETED: 'message.deleted',
  REACTION_ADDED: 'reaction.added',
  REACTION_REMOVED: 'reaction.removed',
  FILE_UPLOADED: 'file.uploaded',
  FILE_DELETED: 'file.deleted',
  MEETING_STARTED: 'meeting.started',
  MEETING_ENDED: 'meeting.ended',
  MEETING_PARTICIPANT_JOINED: 'meeting.participant_joined',
  MEETING_PARTICIPANT_LEFT: 'meeting.participant_left',
  MEETING_INVITED: 'meeting.invited',
  NOTIFICATION_CREATED: 'notification.created',
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

export interface DomainEvent<T = unknown> {
  id: string;
  type: EventType;
  source: string;
  occurredAt: string;
  workspaceId?: string;
  actorId?: string;
  data: T;
}

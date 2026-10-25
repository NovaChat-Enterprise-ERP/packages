import { z } from 'zod';

export const NOTIFICATION_TYPES = ['mention', 'channel_mention', 'dm', 'thread_reply', 'meeting_invite', 'reaction'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const notificationLevelSchema = z.enum(['all', 'mentions', 'none']);
export type NotificationLevel = z.infer<typeof notificationLevelSchema>;

export const updateNotificationPreferencesSchema = z.object({
  level: notificationLevelSchema.optional(),
  emailEnabled: z.boolean().optional(),
});

export const listNotificationsQuerySchema = z.object({
  unread: z.enum(['true', 'false']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export interface NotificationDto {
  id: string;
  workspaceId: string;
  userId: string;
  type: NotificationType;
  actorId: string | null;
  title: string;
  body: string | null;
  link: string | null;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreferencesDto {
  level: NotificationLevel;
  emailEnabled: boolean;
}

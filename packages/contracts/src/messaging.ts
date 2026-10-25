import { z } from 'zod';

export const CONVERSATION_TYPES = ['public_channel', 'private_channel', 'dm', 'group_dm'] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export const channelNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9_-]*$/, 'Use lowercase letters, numbers, dashes and underscores');

export const createChannelSchema = z.object({
  name: channelNameSchema,
  description: z.string().trim().max(250).nullable().optional(),
  isPrivate: z.boolean().default(false),
  memberUserIds: z.array(z.string().min(1)).max(500).default([]),
});
export type CreateChannelInput = z.infer<typeof createChannelSchema>;

export const updateConversationSchema = z
  .object({
    name: channelNameSchema.optional(),
    topic: z.string().trim().max(250).nullable().optional(),
    description: z.string().trim().max(250).nullable().optional(),
    isPrivate: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

export const openDirectSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(8),
});

export const addConversationMembersSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(500),
});

export const conversationPreferencesSchema = z.object({ muted: z.boolean() });

export const markReadSchema = z.object({ messageId: z.uuid().optional() });

export const browseChannelsQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  scope: z.enum(['public', 'all']).default('public'),
});

export interface ConversationMembershipDto {
  joinedAt: string;
  lastReadAt: string | null;
  muted: boolean;
  unreadCount: number;
  mentionCount: number;
}

export interface ConversationDto {
  id: string;
  workspaceId: string;
  type: ConversationType;
  name: string | null;
  topic: string | null;
  description: string | null;
  isDefault: boolean;
  createdBy: string;
  archivedAt: string | null;
  lastMessageAt: string | null;
  memberCount: number;
  participantIds: string[];
  createdAt: string;
  membership: ConversationMembershipDto | null;
}

export const attachmentSchema = z.object({
  fileId: z.uuid(),
  name: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(255),
  size: z.number().int().nonnegative(),
});
export type AttachmentDto = z.infer<typeof attachmentSchema>;

const messageBodyFields = {
  body: z.record(z.string(), z.unknown()).nullable().default(null),
  text: z.string().max(40_000),
  mentions: z.array(z.string().min(1)).max(100).default([]),
  mentionsChannel: z.boolean().default(false),
};

export const sendMessageSchema = z
  .object({
    ...messageBodyFields,
    clientMsgId: z.string().min(1).max(64).optional(),
    parentId: z.uuid().optional(),
    attachments: z.array(attachmentSchema).max(10).default([]),
  })
  .refine((v) => v.text.trim().length > 0 || v.attachments.length > 0, 'Message cannot be empty');
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const editMessageSchema = z
  .object(messageBodyFields)
  .refine((v) => v.text.trim().length > 0, 'Message cannot be empty');
export type EditMessageInput = z.infer<typeof editMessageSchema>;

export const reactionSchema = z.object({ emoji: z.string().min(1).max(64) });

export const listMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const searchMessagesQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  conversationId: z.uuid().optional(),
  authorId: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type SearchMessagesQuery = z.infer<typeof searchMessagesQuerySchema>;

export interface ReactionDto {
  emoji: string;
  count: number;
  userIds: string[];
}

export type MessageKind = 'user' | 'system';

export interface MessageDto {
  id: string;
  workspaceId: string;
  conversationId: string;
  authorId: string;
  parentId: string | null;
  kind: MessageKind;
  body: Record<string, unknown> | null;
  text: string;
  attachments: AttachmentDto[];
  mentions: string[];
  mentionsChannel: boolean;
  reactions: ReactionDto[];
  replyCount: number;
  lastReplyAt: string | null;
  replyUserIds: string[];
  isPinned: boolean;
  clientMsgId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface ThreadSummaryDto {
  root: MessageDto;
  conversation: Pick<ConversationDto, 'id' | 'type' | 'name'>;
  unread: boolean;
}

export interface SearchResultDto {
  message: MessageDto;
  conversation: Pick<ConversationDto, 'id' | 'type' | 'name'>;
  highlight: string;
}

export interface ConversationAccessDto {
  conversationId: string;
  workspaceId: string;
  type: ConversationType;
  isMember: boolean;
  memberUserIds?: string[];
}

export interface MessageCreatedEvent {
  message: MessageDto;
  conversation: Pick<ConversationDto, 'id' | 'type' | 'name'>;
  recipientUserIds: string[];
}

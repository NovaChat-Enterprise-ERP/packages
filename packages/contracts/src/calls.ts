import { z } from 'zod';

export const meetingCodeSchema = z.string().regex(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/, 'Invalid meeting code');

export const createMeetingSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  conversationId: z.uuid().optional(),
  scheduledAt: z.iso.datetime().optional(),
  inviteUserIds: z.array(z.string().min(1)).max(100).default([]),
});
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

export const inviteToMeetingSchema = z.object({ userIds: z.array(z.string().min(1)).min(1).max(100) });

export const muteParticipantSchema = z.object({ source: z.enum(['microphone', 'camera', 'screen_share']).default('microphone') });

export const listMeetingsQuerySchema = z.object({
  status: z.enum(['live', 'scheduled', 'ended', 'active']).default('active'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type MeetingStatus = 'scheduled' | 'live' | 'ended';

export interface MeetingDto {
  id: string;
  workspaceId: string;
  code: string;
  title: string | null;
  hostId: string;
  conversationId: string | null;
  status: MeetingStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  activeParticipantIds: string[];
  invitedUserIds: string[];
  joinPath: string;
}

export interface MeetingJoinDto {
  meeting: MeetingDto;
  serverUrl: string;
  token: string;
  identity: string;
  isHost: boolean;
}

export interface LiveParticipantDto {
  identity: string;
  name: string;
  joinedAt: string | null;
  microphoneMuted: boolean | null;
  cameraMuted: boolean | null;
  isScreenSharing: boolean;
}

export const generateMeetingCode = (random: (max: number) => number): string => {
  const letters = 'abcdefghijkmnopqrstuvwxyz';
  const pick = (n: number) => Array.from({ length: n }, () => letters[random(letters.length)]).join('');
  return `${pick(3)}-${pick(4)}-${pick(3)}`;
};

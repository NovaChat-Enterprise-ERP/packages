import { z } from 'zod';

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9_.]+$/, 'Only lowercase letters, numbers, underscores and dots');

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    username: usernameSchema.optional(),
    image: z.url().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const userIdsSchema = z.object({ ids: z.array(z.string().min(1)).min(1).max(200) });

export interface UserDto {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string | null;
  createdAt: string;
}

export interface SessionVerifyResult {
  user: UserDto;
  sessionId: string;
  expiresAt: string;
}

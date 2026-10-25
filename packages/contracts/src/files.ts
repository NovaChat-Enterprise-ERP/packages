import { z } from 'zod';

export const FILE_KINDS = ['image', 'video', 'audio', 'pdf', 'document', 'spreadsheet', 'presentation', 'archive', 'other'] as const;
export type FileKind = (typeof FILE_KINDS)[number];

export const fileNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .refine((v) => !/[\\/\0]/.test(v), 'File names cannot contain slashes');

export const createUploadSchema = z.object({
  name: fileNameSchema,
  mimeType: z.string().trim().min(1).max(255).default('application/octet-stream'),
  size: z.number().int().positive(),
  folderId: z.uuid().nullable().optional(),
  conversationId: z.uuid().nullable().optional(),
});
export type CreateUploadInput = z.infer<typeof createUploadSchema>;

export const listFilesQuerySchema = z.object({
  view: z.enum(['all', 'mine', 'shared', 'deleted']).default('all'),
  q: z.string().trim().max(100).optional(),
  kind: z.enum(FILE_KINDS).optional(),
  uploaderId: z.string().optional(),
  modified: z.enum(['today', '7d', '30d', 'year']).optional(),
  folderId: z.uuid().optional(),
  conversationId: z.uuid().optional(),
  sort: z.enum(['newest', 'oldest', 'name', 'size']).default('newest'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type ListFilesQuery = z.infer<typeof listFilesQuerySchema>;

export const updateFileSchema = z
  .object({ name: fileNameSchema.optional(), folderId: z.uuid().nullable().optional() })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');
export type UpdateFileInput = z.infer<typeof updateFileSchema>;

export const shareFileSchema = z.object({ userIds: z.array(z.string().min(1)).min(1).max(100) });

export const createFolderSchema = z.object({
  name: fileNameSchema,
  parentId: z.uuid().nullable().optional(),
});
export type CreateFolderInput = z.infer<typeof createFolderSchema>;

export const updateFolderSchema = z
  .object({ name: fileNameSchema.optional(), parentId: z.uuid().nullable().optional() })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update');

export const avatarUploadSchema = z.object({
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
  size: z.number().int().positive().max(5 * 1024 * 1024),
});

export interface FileDto {
  id: string;
  workspaceId: string;
  name: string;
  mimeType: string;
  kind: FileKind;
  size: number;
  status: 'pending' | 'ready';
  uploaderId: string;
  folderId: string | null;
  conversationId: string | null;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FolderDto {
  id: string;
  workspaceId: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  fileCount: number;
  createdAt: string;
}

export interface UploadTicketDto {
  file: FileDto;
  uploadUrl: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresAt: string;
}

export interface DownloadUrlDto {
  url: string;
  expiresAt: string;
}

export interface AvatarUploadDto {
  uploadUrl: string;
  headers: Record<string, string>;
  publicUrl: string;
}

export const fileKindOf = (mimeType: string, name = ''): FileKind => {
  const mime = mimeType.toLowerCase();
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (/spreadsheet|excel|csv/.test(mime) || ['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'spreadsheet';
  if (/presentation|powerpoint/.test(mime) || ['ppt', 'pptx', 'key', 'odp'].includes(ext)) return 'presentation';
  if (/zip|tar|gzip|rar|7z|compressed/.test(mime) || ['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) return 'archive';
  if (/word|document|text\/|rtf|markdown/.test(mime) || ['doc', 'docx', 'txt', 'md', 'rtf', 'odt'].includes(ext)) return 'document';
  return 'other';
};

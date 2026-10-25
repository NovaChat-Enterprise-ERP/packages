export const encodeCursor = (value: Record<string, string | number>): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

export const decodeCursor = <T extends object>(
  cursor: string | undefined,
): T | null => {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
};

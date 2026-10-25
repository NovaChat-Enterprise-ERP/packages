const codeOf = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  const direct = (error as { code?: unknown }).code;
  if (typeof direct === 'string') return direct;
  return codeOf((error as { cause?: unknown }).cause);
};

export const isUniqueViolation = (error: unknown): boolean => codeOf(error) === '23505';

export const isForeignKeyViolation = (error: unknown): boolean => codeOf(error) === '23503';

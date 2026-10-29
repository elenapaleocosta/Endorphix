const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export function emailError(email: string): string | undefined {
  if (!email.trim()) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email.trim())) return "That email address doesn't look right.";
  return undefined;
}

export function requiredError(value: string, label: string): string | undefined {
  if (!value.trim()) return `Enter your ${label}.`;
  return undefined;
}

export function errorMessage(err: unknown, fallback: string): string {
  const message = typeof err === "object" && err !== null && "message" in err ? (err as { message: unknown }).message : null;
  return typeof message === "string" && message ? message : fallback;
}

/** Drops undefined entries so `Object.keys(errors).length` reflects real problems. */
export function compactErrors<T extends Record<string, string | undefined>>(errors: T): Partial<T> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v !== undefined)) as Partial<T>;
}

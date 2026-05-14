export const DEMO_READ_ONLY_ERROR = "DEMO_MODE_READ_ONLY";

export function isDemoReadOnlyError(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === "string") {
    return error === DEMO_READ_ONLY_ERROR;
  }

  if (Array.isArray(error)) {
    return error.some((entry) => isDemoReadOnlyError(entry));
  }

  if (typeof error === "object") {
    return Object.values(error as Record<string, unknown>).some((value) =>
      isDemoReadOnlyError(value)
    );
  }

  return false;
}

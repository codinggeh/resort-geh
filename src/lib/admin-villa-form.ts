export function parseAmenitiesInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseImageUrlsInput(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseNumberInput(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function findFirstErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  if ("message" in error && typeof error.message === "string" && error.message) {
    return error.message;
  }

  for (const nested of Object.values(error as Record<string, unknown>)) {
    const message = findFirstErrorMessage(nested);

    if (message) {
      return message;
    }
  }

  return null;
}

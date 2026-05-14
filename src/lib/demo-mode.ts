const TRUTHY = new Set(["1", "true", "yes", "on"]);

function readFlag(value: string | undefined) {
  const raw = value?.trim().toLowerCase();
  return raw ? TRUTHY.has(raw) : false;
}

export function isDemoModeEnabled() {
  return (
    readFlag(process.env.DEMO_MODE) ||
    readFlag(process.env.NEXT_PUBLIC_DEMO_MODE)
  );
}

export function isPublicDemoModeEnabled() {
  return readFlag(process.env.NEXT_PUBLIC_DEMO_MODE);
}


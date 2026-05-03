import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";

export async function getAuthSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session as Session | null;
}

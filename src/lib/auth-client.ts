import { createAuthClient } from "better-auth/react";
import { SITE_URL } from "@/lib/constants/site";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || SITE_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Apply i18n middleware
  const response = intlMiddleware(request);

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /static (static files)
    // - metadata routes that should stay at the root
    // - .*\\..*  (files with extensions)
    "/((?!api|_next|static|apple-icon|opengraph-image|.*\\..*).*)",
  ],
};

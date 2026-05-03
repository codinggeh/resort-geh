import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/routing";

function normalizePath(path: string) {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }

  return path;
}

export function localizePath(path: string, locale: string) {
  const normalizedPath = normalizePath(path);

  if (normalizedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

export function revalidateLocalizedPaths(paths: string[]) {
  const allPaths = new Set<string>();

  for (const path of paths) {
    for (const locale of locales) {
      allPaths.add(localizePath(path, locale));
    }
  }

  for (const path of allPaths) {
    revalidatePath(path);
  }
}

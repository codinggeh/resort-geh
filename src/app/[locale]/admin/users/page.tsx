import { getAllUsersAdmin } from "@/actions/admin";
import { getAuthSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { UsersClient } from "./users-client";
import type { Metadata } from "next";
import { localizePath } from "@/lib/revalidate";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");

  return {
    title: t("users"),
  };
}

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAuthSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect(localizePath("/admin", locale));
  }

  const t = await getTranslations("admin");
  const rawUsers = await getAllUsersAdmin();

  const users = rawUsers.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("users")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("usersDesc")}
        </p>
      </div>

      <UsersClient users={users} />
    </div>
  );
}

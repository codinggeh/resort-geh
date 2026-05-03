import { getAuthSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminCommandMenu } from "./admin-command-menu";
import { localizePath } from "@/lib/revalidate";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAuthSession();

  if (!session) {
    const nextPath = localizePath("/admin", locale);
    redirect(`${localizePath("/login", locale)}?next=${encodeURIComponent(nextPath)}`);
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect(localizePath("/", locale));
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar
        userRole={session.user.role as string}
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
      <AdminCommandMenu />
    </div>
  );
}

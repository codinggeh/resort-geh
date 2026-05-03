"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { promoteUserToAdmin, deleteUser } from "@/actions/admin";
import { AdminTablePagination } from "@/components/admin-table-pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatLongDate } from "@/lib/formatters";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string | Date;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500/10 text-purple-600",
  ADMIN: "bg-blue-500/10 text-blue-600",
  GUEST: "bg-gray-500/10 text-gray-600",
};

export function UsersClient({ users }: { users: User[] }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const pageCount = Math.max(1, Math.ceil(users.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const visibleUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [page, pageSize, users]);

  async function handlePromote(userId: string) {
    try {
      const result = await promoteUserToAdmin(userId);

      if ("error" in result && result.error) {
        toast.error(t("promoteFailed"));
        return;
      }

      toast.success(t("userPromoted"));
      router.refresh();
    } catch {
      toast.error(t("promoteFailed"));
    }
  }

  function openDeleteDialog(userId: string) {
    setDeleteTargetId(userId);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTargetId) return;
    try {
      const result = await deleteUser(deleteTargetId);

      if ("error" in result && result.error) {
        toast.error(t("deleteUserFailed"));
        return;
      }

      toast.success(t("userDeleted"));
      router.refresh();
    } catch {
      toast.error(t("deleteUserFailed"));
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("user")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("joined")}</TableHead>
                <TableHead className="text-right">{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    {t("noUsers")}
                  </TableCell>
                </TableRow>
              ) : (
                visibleUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role] || ""}>
                        {t(`roles.${user.role as "SUPER_ADMIN" | "ADMIN" | "GUEST"}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatLongDate(user.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== "SUPER_ADMIN" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role === "GUEST" && (
                              <DropdownMenuItem onClick={() => handlePromote(user.id)}>
                                <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                                {t("promoteUser")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(user.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("deleteUser")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AdminTablePagination
          page={page}
          pageSize={pageSize}
          totalItems={users.length}
          pageCount={pageCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteUserConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

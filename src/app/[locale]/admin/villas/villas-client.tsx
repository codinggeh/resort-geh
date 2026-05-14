"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { deleteVilla } from "@/actions/admin";
import { AdminTablePagination } from "@/components/admin-table-pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatters";
import { isDemoReadOnlyError } from "@/lib/demo-mode-errors";

interface Villa {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  imageUrls: string[];
  status: string;
  createdAt: string | Date;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-500/10 text-green-600",
  MAINTENANCE: "bg-yellow-500/10 text-yellow-600",
  HIDDEN: "bg-gray-500/10 text-gray-600",
};

export function VillasClient({ villas }: { villas: Villa[] }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const td = useTranslations("demo");
  const locale = useLocale();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const pageCount = Math.max(1, Math.ceil(villas.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const visibleVillas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return villas.slice(start, start + pageSize);
  }, [page, pageSize, villas]);

  function openDeleteDialog(villaId: string) {
    setDeleteTargetId(villaId);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTargetId) return;
    try {
      const result = await deleteVilla(deleteTargetId);

      if ("error" in result && result.error) {
        if (isDemoReadOnlyError(result.error)) {
          toast.error(td("readOnlyToast"));
          return;
        }

        toast.error(t("villaDeleteFailed"));
        return;
      }

      toast.success(t("villaDeleted"));
      router.refresh();
    } catch {
      toast.error(t("villaDeleteFailed"));
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button asChild>
          <Link href="/admin/villas/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("addVilla")}
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("pricePerNight")}</TableHead>
                <TableHead>{t("capacity")}</TableHead>
                <TableHead>{tc("status")}</TableHead>
                <TableHead className="text-right">{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleVillas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    {t("noVillas")}
                  </TableCell>
                </TableRow>
              ) : (
                visibleVillas.map((villa) => (
                  <TableRow key={villa.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{villa.name}</p>
                        <p className="text-xs text-muted-foreground">/{villa.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(villa.pricePerNight, locale)}</TableCell>
                    <TableCell>
                      {villa.bedrooms}BR / {villa.maxGuests} {t("guests")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[villa.status] || ""}>
                        {t(villa.status.toLowerCase() as "available" | "maintenance" | "hidden")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/villas/${villa.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("editVilla")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(villa.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("deleteVilla")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          totalItems={villas.length}
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
              {t("deleteVillaConfirmDesc")}
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

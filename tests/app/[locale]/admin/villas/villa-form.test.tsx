import type React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VillaForm } from "@/app/[locale]/admin/villas/villa-form";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const createVillaMock = vi.fn();
const updateVillaMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

const translations: Record<string, string> = {
  "admin.addVilla": "Tambah Vila",
  "admin.editVilla": "Edit Vila",
  "admin.name": "Nama",
  "admin.slug": "Slug",
  "admin.slugHint": "Dibuat otomatis dari nama vila, tapi tetap bisa Anda ubah manual.",
  "admin.description": "Deskripsi",
  "admin.pricePerNight": "Harga/Malam",
  "admin.maxGuests": "Maks Tamu",
  "admin.bedrooms": "Kamar Tidur",
  "admin.bathrooms": "Kamar Mandi",
  "admin.villaStatus": "Status",
  "admin.selectStatus": "Pilih status",
  "admin.available": "Tersedia",
  "admin.maintenance": "Pemeliharaan",
  "admin.hidden": "Tersembunyi",
  "admin.amenities": "Fasilitas (pisahkan dengan koma)",
  "admin.imageUrls": "URL Gambar (satu per baris)",
  "admin.createVilla": "Buat Vila",
  "admin.updateVilla": "Perbarui Vila",
  "admin.villaCreated": "Vila berhasil dibuat",
  "admin.villaUpdated": "Vila berhasil diperbarui",
  "admin.operationFailed": "Operasi gagal",
  "admin.somethingWrong": "Terjadi kesalahan",
  "admin.fixFormErrors": "Periksa lagi field yang wajib diisi.",
  "admin.addVillaDialogDescription": "Buat vila baru dengan mengisi detail di bawah ini.",
  "admin.editVillaDialogDescription": "Edit detail vila dan simpan perubahan Anda.",
  "admin.backToVillas": "Kembali ke Vila",
  "admin.validation.nameMin": "Nama vila minimal 2 karakter.",
  "admin.validation.slugMin": "Slug minimal 2 karakter.",
  "admin.validation.slugFormat": "Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
  "admin.validation.slugTaken": "Slug ini sudah dipakai vila lain.",
  "admin.validation.descriptionMin": "Deskripsi minimal 10 karakter.",
  "admin.validation.numberRequired": "Field angka ini wajib diisi.",
  "admin.validation.pricePositive": "Harga per malam harus lebih dari 0.",
  "admin.validation.maxGuestsMin": "Vila minimal harus menerima 1 tamu.",
  "admin.validation.nonNegative": "Nilainya tidak boleh kurang dari 0.",
  "admin.validation.amenitiesRequired": "Isi minimal satu fasilitas.",
  "admin.validation.imageUrlsRequired": "Isi minimal satu URL gambar.",
  "admin.validation.imageUrlInvalid": "Masukkan URL gambar yang valid.",
  "admin.validation.imageUrlHostInvalid":
    "Gunakan URL gambar dari host yang diizinkan seperti Unsplash atau Cloudinary.",
  "common.cancel": "Batal",
};

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    translations[`${namespace}.${key}`] ?? key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@/actions/admin", () => ({
  createVilla: (...args: unknown[]) => createVillaMock(...args),
  updateVilla: (...args: unknown[]) => updateVillaMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("VillaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createVillaMock.mockResolvedValue({ success: true, bookingId: "ignored" });
    updateVillaMock.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows feedback when submit is invalid", async () => {
    const user = userEvent.setup();

    render(<VillaForm mode="create" />);

    await user.click(screen.getByRole("button", { name: "Buat Vila" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });

    expect(createVillaMock).not.toHaveBeenCalled();
    expect(screen.getByText("Nama vila minimal 2 karakter.")).toBeTruthy();
    expect(screen.getByText("Deskripsi minimal 10 karakter.")).toBeTruthy();
  });

  it("auto-generates slug and submits valid create payload", async () => {
    const user = userEvent.setup();

    render(<VillaForm mode="create" />);

    const nameInput = screen.getByLabelText(/Nama/);
    const slugInput = screen.getByLabelText(/Slug/) as HTMLInputElement;

    await user.type(nameInput, "Villa Sunset Paradise");
    expect(slugInput.value).toBe("villa-sunset-paradise");

    await user.type(screen.getByLabelText(/Deskripsi/), "Villa tepi laut dengan kolam renang pribadi dan area santai.");
    await user.type(screen.getByLabelText(/Harga/), "350");
    await user.type(screen.getByLabelText(/Maks Tamu/), "4");
    await user.type(screen.getByLabelText(/Kamar Tidur/), "2");
    await user.type(screen.getByLabelText(/Kamar Mandi/), "2");
    await user.type(screen.getByLabelText(/Fasilitas/), "wifi, pool");
    await user.type(screen.getByLabelText(/URL Gambar/), "https://images.unsplash.com/photo-123");

    await user.click(screen.getByRole("button", { name: "Buat Vila" }));

    await waitFor(() => {
      expect(createVillaMock).toHaveBeenCalledWith({
        name: "Villa Sunset Paradise",
        slug: "villa-sunset-paradise",
        description: "Villa tepi laut dengan kolam renang pribadi dan area santai.",
        pricePerNight: 350,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ["wifi", "pool"],
        imageUrls: ["https://images.unsplash.com/photo-123"],
        status: "AVAILABLE",
      });
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Vila berhasil dibuat");
    expect(pushMock).toHaveBeenCalledWith("/admin/villas");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("preserves a custom slug and submits edit payload", async () => {
    const user = userEvent.setup();

    render(
      <VillaForm
        mode="edit"
        villa={{
          id: "villa-1",
          name: "Villa Sunset",
          slug: "sunset-signature",
          description: "Villa awal dengan deskripsi yang cukup panjang.",
          pricePerNight: 420,
          maxGuests: 5,
          bedrooms: 3,
          bathrooms: 2,
          amenities: ["wifi", "pool"],
          imageUrls: ["https://images.unsplash.com/photo-original"],
          status: "AVAILABLE",
        }}
      />
    );

    const nameInput = screen.getByLabelText(/Nama/);
    const slugInput = screen.getByLabelText(/Slug/) as HTMLInputElement;

    await user.clear(nameInput);
    await user.type(nameInput, "Villa Sunset Paradise");

    expect(slugInput.value).toBe("sunset-signature");

    const descriptionInput = screen.getByLabelText(/Deskripsi/);
    await user.clear(descriptionInput);
    await user.type(
      descriptionInput,
      "Villa edit dengan deskripsi yang lebih lengkap dan tetap valid."
    );

    await user.click(screen.getByRole("button", { name: "Perbarui Vila" }));

    await waitFor(() => {
      expect(updateVillaMock).toHaveBeenCalledWith("villa-1", {
        name: "Villa Sunset Paradise",
        slug: "sunset-signature",
        description: "Villa edit dengan deskripsi yang lebih lengkap dan tetap valid.",
        pricePerNight: 420,
        maxGuests: 5,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["wifi", "pool"],
        imageUrls: ["https://images.unsplash.com/photo-original"],
        status: "AVAILABLE",
      });
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Vila berhasil diperbarui");
  });
});

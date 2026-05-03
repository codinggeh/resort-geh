import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirstMock = vi.fn();
const insertRunMock = vi.fn();
const insertValuesMock = vi.fn(() => ({ run: insertRunMock }));
const insertMock = vi.fn(() => ({ values: insertValuesMock }));
const updateRunMock = vi.fn();
const updateWhereMock = vi.fn(() => ({ run: updateRunMock }));
const updateSetMock = vi.fn(() => ({ where: updateWhereMock }));
const updateMock = vi.fn(() => ({ set: updateSetMock }));
const getAuthSessionMock = vi.fn();
const revalidateLocalizedPathsMock = vi.fn();

vi.mock("@/db", () => ({
  db: {
    query: {
      villas: {
        findFirst: (...args: unknown[]) => findFirstMock(...args),
      },
    },
    insert: (...args: unknown[]) => insertMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
  },
}));

vi.mock("@/lib/session", () => ({
  getAuthSession: (...args: unknown[]) => getAuthSessionMock(...args),
}));

vi.mock("@/lib/revalidate", () => ({
  revalidateLocalizedPaths: (...args: unknown[]) => revalidateLocalizedPathsMock(...args),
}));

vi.mock("uuid", () => ({
  v4: () => "generated-villa-id",
}));

import { createVilla, updateVilla } from "@/actions/admin";

const validPayload = {
  name: "Villa Sunset Paradise",
  slug: "villa-sunset-paradise",
  description: "Villa tepi laut dengan deskripsi yang cukup panjang.",
  pricePerNight: 350,
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 2,
  amenities: ["wifi", "pool"],
  imageUrls: ["https://images.unsplash.com/photo-123"],
  status: "AVAILABLE" as const,
};

describe("admin villa actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthSessionMock.mockResolvedValue({
      user: {
        id: "admin-1",
        role: "SUPER_ADMIN",
      },
    });
  });

  it("createVilla inserts a new villa and revalidates on success", async () => {
    findFirstMock.mockResolvedValue(undefined);

    const result = await createVilla(validPayload);

    expect(result).toEqual({ success: true });
    expect(findFirstMock).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
    expect(insertValuesMock).toHaveBeenCalledWith({
      id: "generated-villa-id",
      ...validPayload,
    });
    expect(insertRunMock).toHaveBeenCalled();
    expect(revalidateLocalizedPathsMock).toHaveBeenCalledWith([
      "/",
      "/villas",
      "/admin/villas",
      "/villas/villa-sunset-paradise",
    ]);
  });

  it("createVilla returns a slug error when the slug already exists", async () => {
    findFirstMock.mockResolvedValue({ id: "existing-villa" });

    const result = await createVilla(validPayload);

    expect(result).toEqual({
      error: {
        slug: ["Slug already in use"],
      },
    });
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidateLocalizedPathsMock).not.toHaveBeenCalled();
  });

  it("updateVilla blocks slug collisions from another villa", async () => {
    findFirstMock
      .mockResolvedValueOnce({ slug: "villa-sunset" })
      .mockResolvedValueOnce({ id: "other-villa" });

    const result = await updateVilla("villa-1", validPayload);

    expect(result).toEqual({
      error: {
        slug: ["Slug already in use"],
      },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updateVilla updates and revalidates when slug belongs to the same villa", async () => {
    findFirstMock
      .mockResolvedValueOnce({ slug: "villa-sunset" })
      .mockResolvedValueOnce({ id: "villa-1" });

    const result = await updateVilla("villa-1", validPayload);

    expect(result).toEqual({ success: true });
    expect(updateMock).toHaveBeenCalled();
    expect(updateSetMock).toHaveBeenCalledWith(validPayload);
    expect(updateWhereMock).toHaveBeenCalled();
    expect(updateRunMock).toHaveBeenCalled();
    expect(revalidateLocalizedPathsMock).toHaveBeenCalledWith([
      "/",
      "/villas",
      "/admin/villas",
      "/villas/villa-sunset",
      "/villas/villa-sunset-paradise",
    ]);
  });
});

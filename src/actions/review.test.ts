import { beforeEach, describe, expect, it, vi } from "vitest";

const completedBookingFindFirstMock = vi.fn();
const existingReviewFindFirstMock = vi.fn();
const villaFindFirstMock = vi.fn();
const insertRunMock = vi.fn();
const insertValuesMock = vi.fn(() => ({ run: insertRunMock }));
const insertMock = vi.fn(() => ({ values: insertValuesMock }));
const getAuthSessionMock = vi.fn();
const revalidateLocalizedPathsMock = vi.fn();

vi.mock("@/db", () => ({
  db: {
    query: {
      bookings: {
        findFirst: (...args: unknown[]) => completedBookingFindFirstMock(...args),
      },
      reviews: {
        findFirst: (...args: unknown[]) => existingReviewFindFirstMock(...args),
      },
      villas: {
        findFirst: (...args: unknown[]) => villaFindFirstMock(...args),
      },
    },
    insert: (...args: unknown[]) => insertMock(...args),
  },
}));

vi.mock("@/lib/session", () => ({
  getAuthSession: (...args: unknown[]) => getAuthSessionMock(...args),
}));

vi.mock("@/lib/revalidate", () => ({
  revalidateLocalizedPaths: (...args: unknown[]) => revalidateLocalizedPathsMock(...args),
}));

vi.mock("uuid", () => ({
  v4: () => "review-id-1",
}));

import { createReview } from "./review";

describe("createReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthSessionMock.mockResolvedValue({
      user: {
        id: "guest-1",
        role: "GUEST",
      },
    });
  });

  it("creates a review and revalidates the villa page when the stay was completed", async () => {
    completedBookingFindFirstMock.mockResolvedValue({ id: "booking-1" });
    existingReviewFindFirstMock.mockResolvedValue(undefined);
    villaFindFirstMock.mockResolvedValue({ slug: "villa-sunset" });

    const result = await createReview({
      villaId: "villa-1",
      rating: 5,
      comment: "Amazing stay with a calm view and very responsive staff.",
    });

    expect(result).toEqual({ success: true });
    expect(insertValuesMock).toHaveBeenCalledWith({
      id: "review-id-1",
      villaId: "villa-1",
      guestId: "guest-1",
      rating: 5,
      comment: "Amazing stay with a calm view and very responsive staff.",
    });
    expect(revalidateLocalizedPathsMock).toHaveBeenCalledWith([
      "/villas",
      "/villas/villa-sunset",
    ]);
  });

  it("rejects duplicate reviews from the same guest for the same villa", async () => {
    completedBookingFindFirstMock.mockResolvedValue({ id: "booking-1" });
    existingReviewFindFirstMock.mockResolvedValue({ id: "review-1" });

    const result = await createReview({
      villaId: "villa-1",
      rating: 4,
      comment: "Still good on the second visit.",
    });

    expect(result).toEqual({
      error: {
        villaId: ["You've already reviewed this villa"],
      },
    });
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidateLocalizedPathsMock).not.toHaveBeenCalled();
  });

  it("throws when the user is not authenticated", async () => {
    getAuthSessionMock.mockResolvedValue(null);

    await expect(
      createReview({
        villaId: "villa-1",
        rating: 5,
        comment: "Amazing stay with a calm view and very responsive staff.",
      })
    ).rejects.toThrow("Unauthorized");
  });
});

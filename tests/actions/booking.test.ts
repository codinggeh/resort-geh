import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthSessionMock = vi.fn();
const getPakasirConfigMock = vi.fn();
const buildPakasirRedirectUrlMock = vi.fn();
const revalidateLocalizedPathsMock = vi.fn();
const transactionMock = vi.fn();
const insertValuesMock = vi.fn(() => Promise.resolve());
const insertMock = vi.fn(() => ({ values: insertValuesMock }));

vi.mock("@/db", () => ({
  db: {
    transaction: (...args: unknown[]) => transactionMock(...args),
  },
}));

vi.mock("@/lib/session", () => ({
  getAuthSession: (...args: unknown[]) => getAuthSessionMock(...args),
}));

vi.mock("@/lib/pakasir", () => ({
  getPakasirConfig: (...args: unknown[]) => getPakasirConfigMock(...args),
  buildPakasirRedirectUrl: (...args: unknown[]) => buildPakasirRedirectUrlMock(...args),
}));

vi.mock("@/lib/revalidate", () => ({
  revalidateLocalizedPaths: (...args: unknown[]) => revalidateLocalizedPathsMock(...args),
}));

vi.mock("uuid", () => ({
  v4: vi
    .fn()
    .mockReturnValueOnce("booking-id-1")
    .mockReturnValueOnce("payment-id-1")
    .mockReturnValue("generated-id"),
}));

import { createBooking } from "@/actions/booking";

describe("createBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getAuthSessionMock.mockResolvedValue({
      user: {
        id: "guest-1",
        role: "GUEST",
      },
    });

    getPakasirConfigMock.mockReturnValue({
      baseUrl: "https://app.pakasir.com",
      projectSlug: "resortsgeh",
      apiKey: "secret",
    });

    buildPakasirRedirectUrlMock.mockReturnValue("https://app.pakasir.com/pay/mock");
  });

  it("creates a booking inside an immediate transaction and revalidates on success", async () => {
    const selectResultMock = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: "villa-1",
          slug: "villa-sunset",
          pricePerNight: 350,
          maxGuests: 4,
          status: "AVAILABLE",
        },
      ])
      .mockResolvedValueOnce([]);

    const selectMock = vi.fn(() => ({
      from: () => ({
        where: selectResultMock,
      }),
    }));

    transactionMock.mockImplementation((callback) => {
      const tx = {
        select: selectMock,
        insert: insertMock,
      };

      return callback(tx);
    });

    const result = await createBooking({
      locale: "id",
      villaId: "villa-1",
      checkInDate: "2099-05-10",
      checkOutDate: "2099-05-13",
      guestCount: 2,
      paymentMethod: "CREDIT_CARD",
    });

    expect(result).toEqual({
      success: true,
      bookingId: "booking-id-1",
      paymentUrl: "https://app.pakasir.com/pay/mock",
    });
    expect(buildPakasirRedirectUrlMock).toHaveBeenCalledWith({
      orderId: "booking-id-1",
      amount: 1050,
      locale: "id",
      qrisOnly: true,
    });
    expect(insertMock).toHaveBeenCalledTimes(2);
    expect(insertValuesMock).toHaveBeenNthCalledWith(1, {
      id: "booking-id-1",
      villaId: "villa-1",
      guestId: "guest-1",
      checkInDate: "2099-05-10",
      checkOutDate: "2099-05-13",
      guestCount: 2,
      totalAmount: 1050,
      status: "PENDING",
    });
    expect(insertValuesMock).toHaveBeenNthCalledWith(2, {
      id: "payment-id-1",
      bookingId: "booking-id-1",
      amount: 1050,
      paymentMethod: "CREDIT_CARD",
      transactionId: "booking-id-1",
      status: "UNPAID",
      processedAt: null,
    });
    expect(revalidateLocalizedPathsMock).toHaveBeenCalledWith([
      "/",
      "/villas",
      "/villas/villa-sunset",
      "/my-bookings",
      "/admin",
      "/admin/bookings",
    ]);
  });

  it("returns a date conflict error and skips inserts when overlap exists", async () => {
    const selectResultMock = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: "villa-1",
          slug: "villa-sunset",
          pricePerNight: 350,
          maxGuests: 4,
          status: "AVAILABLE",
        },
      ])
      .mockResolvedValueOnce([{ id: "existing-booking" }]);

    transactionMock.mockImplementation((callback) =>
      callback({
        select: () => ({
          from: () => ({
            where: selectResultMock,
          }),
        }),
        insert: insertMock,
      })
    );

    const result = await createBooking({
      locale: "en",
      villaId: "villa-1",
      checkInDate: "2099-05-10",
      checkOutDate: "2099-05-13",
      guestCount: 2,
      paymentMethod: "BANK_TRANSFER",
    });

    expect(result).toEqual({
      error: {
        checkInDate: ["Selected dates conflict with an existing booking"],
      },
    });
    expect(insertMock).not.toHaveBeenCalled();
    expect(revalidateLocalizedPathsMock).not.toHaveBeenCalled();
  });

  it("throws when the user is not authenticated", async () => {
    getAuthSessionMock.mockResolvedValue(null);

    await expect(
      createBooking({
        locale: "en",
        villaId: "villa-1",
        checkInDate: "2099-05-10",
        checkOutDate: "2099-05-13",
        guestCount: 2,
        paymentMethod: "BANK_TRANSFER",
      })
    ).rejects.toThrow("Unauthorized");
  });
});

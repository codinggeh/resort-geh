import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, payments, villas } from "@/db/schema";
import { fetchPakasirTransactionDetail, getPakasirConfig } from "@/lib/pakasir";
import { revalidateLocalizedPaths } from "@/lib/revalidate";

type PakasirWebhookBody = {
  amount?: number;
  order_id?: string;
  project?: string;
  status?: string;
  payment_method?: string;
  completed_at?: string;
};

function mapProviderMethod(providerMethod?: string) {
  if (!providerMethod) {
    return "BANK_TRANSFER" as const;
  }

  if (providerMethod === "qris") {
    return "CREDIT_CARD" as const;
  }

  return "BANK_TRANSFER" as const;
}

export async function POST(request: Request) {
  const config = getPakasirConfig();

  if (!config) {
    return NextResponse.json(
      { error: "Pakasir is not configured" },
      { status: 500 }
    );
  }

  let payload: PakasirWebhookBody;

  try {
    payload = (await request.json()) as PakasirWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = payload.amount;
  const orderId = payload.order_id;
  const project = payload.project;

  if (!amount || !orderId || !project) {
    return NextResponse.json({ error: "Missing webhook fields" }, { status: 400 });
  }

  if (project !== config.projectSlug) {
    return NextResponse.json({ error: "Project mismatch" }, { status: 400 });
  }

  const payment = await db.query.payments.findFirst({
    where: eq(payments.bookingId, orderId),
    with: {
      booking: true,
    },
  });

  if (!payment || !payment.booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (payment.status === "PAID" && payment.booking.status === "CONFIRMED") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  if (Math.round(payment.amount) !== Math.round(amount)) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  let detail;

  try {
    detail = await fetchPakasirTransactionDetail({
      amount,
      orderId,
    });
  } catch {
    return NextResponse.json(
      { error: "Transaction verification request failed" },
      { status: 502 }
    );
  }

  if (
    !detail.transaction ||
    detail.transaction.project !== config.projectSlug ||
    detail.transaction.order_id !== orderId ||
    Math.round(detail.transaction.amount) !== Math.round(amount)
  ) {
    return NextResponse.json(
      { error: "Transaction verification failed" },
      { status: 400 }
    );
  }

  if (detail.transaction.status !== "completed") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (payment.booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Booking already cancelled" }, { status: 409 });
  }

  db.transaction((tx) => {
    tx.update(payments)
      .set({
        status: "PAID",
        processedAt:
          detail.transaction?.completed_at || payload.completed_at || new Date().toISOString(),
        paymentMethod: mapProviderMethod(detail.transaction?.payment_method),
        transactionId: orderId,
      })
      .where(and(eq(payments.id, payment.id), eq(payments.bookingId, orderId)))
      .run();

    tx.update(bookings)
      .set({ status: "CONFIRMED" })
      .where(eq(bookings.id, orderId))
      .run();
  });

  const villa = await db.query.villas.findFirst({
    where: eq(villas.id, payment.booking.villaId),
    columns: {
      slug: true,
    },
  });

  revalidateLocalizedPaths([
    "/",
    "/villas",
    ...(villa?.slug ? [`/villas/${villa.slug}`] : []),
    "/my-bookings",
    "/admin",
    "/admin/bookings",
  ]);

  return NextResponse.json({ ok: true });
}

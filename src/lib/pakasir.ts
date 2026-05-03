import { SITE_URL } from "@/lib/constants/site";
import { localizePath } from "@/lib/revalidate";

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const PAKASIR_BASE_URL = stripTrailingSlash(
  process.env.PAKASIR_BASE_URL || "https://app.pakasir.com"
);

export function getPakasirConfig() {
  const projectSlug = process.env.PAKASIR_PROJECT_SLUG;
  const apiKey = process.env.PAKASIR_API_KEY;

  if (!projectSlug || !apiKey) {
    return null;
  }

  return {
    baseUrl: PAKASIR_BASE_URL,
    projectSlug,
    apiKey,
  };
}

export function getPakasirWebhookUrl() {
  return `${SITE_URL}/api/pakasir/webhook`;
}

export function buildPakasirRedirectUrl({
  orderId,
  amount,
  locale,
  qrisOnly = false,
}: {
  orderId: string;
  amount: number;
  locale: string;
  qrisOnly?: boolean;
}) {
  const config = getPakasirConfig();

  if (!config) {
    return null;
  }

  const paymentUrl = new URL(
    `/pay/${config.projectSlug}/${Math.round(amount)}`,
    `${config.baseUrl}/`
  );

  paymentUrl.searchParams.set("order_id", orderId);
  paymentUrl.searchParams.set(
    "redirect",
    `${SITE_URL}${localizePath("/my-bookings", locale)}?booking=${orderId}`
  );

  if (qrisOnly) {
    paymentUrl.searchParams.set("qris_only", "1");
  }

  return paymentUrl.toString();
}

type PakasirTransactionDetailResponse = {
  transaction?: {
    amount: number;
    order_id: string;
    project: string;
    status: string;
    payment_method?: string;
    completed_at?: string;
  };
};

export async function fetchPakasirTransactionDetail(params: {
  amount: number;
  orderId: string;
}) {
  const config = getPakasirConfig();

  if (!config) {
    throw new Error("Missing Pakasir configuration");
  }

  const url = new URL("/api/transactiondetail", `${config.baseUrl}/`);
  url.searchParams.set("project", config.projectSlug);
  url.searchParams.set("amount", String(Math.round(params.amount)));
  url.searchParams.set("order_id", params.orderId);
  url.searchParams.set("api_key", config.apiKey);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Pakasir detail request failed with ${response.status}`);
  }

  return (await response.json()) as PakasirTransactionDetailResponse;
}

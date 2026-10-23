import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let CF_ENV: any = undefined;

const GLOBAL_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getSecret(name: string): string | undefined {
  if (CF_ENV && CF_ENV[name]) return CF_ENV[name];
  const g: any = globalThis as any;
  if (g && g.env && g.env[name]) return g.env[name];
  if (g && g.process && g.process.env && g.process.env[name]) return g.process.env[name];
  return undefined;
}

// --- PESAPAL CONFIGURATION ---
const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3"; // Use sandbox URL for testing: https://cybqa.pesapal.com/pesapalv3

async function getPesapalToken(): Promise<string> {
  const key = getSecret("PESAPAL_CONSUMER_KEY");
  const secret = getSecret("PESAPAL_CONSUMER_SECRET");
  if (!key || !secret) throw new Error("Pesapal credentials missing in Cloudflare.");

  const res = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });

  if (!res.ok) throw new Error("Failed to authenticate with Pesapal.");
  const data = await res.json();
  return data.token;
}

async function registerIPN(token: string, ipnUrl: string): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "GET",
    }),
  });
  const data = await res.json();
  return data.ipn_id;
}

async function handleApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...GLOBAL_CORS, "Content-Type": "application/json" },
    });

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: GLOBAL_CORS });
  }

  if (url.pathname === "/api/health") {
    return json({ status: "alive" });
  }

  // --- PESAPAL ENDPOINTS ---

  // 1. One-time setup to get your IPN ID
  if (url.pathname === "/api/pesapal/setup-ipn" && request.method === "GET") {
    try {
      const token = await getPesapalToken();
      const ipnUrl = `https://classoni.classoni66.workers.dev/api/pesapal/ipn`; // Your IPN URL
      const ipnId = await registerIPN(token, ipnUrl);
      return json({ ipn_id: ipnId });
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  }

  // 2. Initiate a Payment
  if (url.pathname === "/api/pesapal/pay" && request.method === "POST") {
    try {
      const body: any = await request.json();
      const token = await getPesapalToken();
      
      const ipnId = getSecret("PESAPAL_IPN_ID");
      if (!ipnId) return json({ error: "PESAPAL_IPN_ID not set in Cloudflare." }, 500);

      const orderPayload = {
        id: `SMARTSALE-${Date.now()}`,
        currency: "UGX",
        amount: body.amount,
        description: body.description,
        callback_url: `https://classoni.classoni66.workers.dev/payment-callback`, // Where Pesapal redirects after payment
        notification_id: ipnId,
        billing_address: {
          email_address: "customer@smartsale.ug",
          phone_number: body.phone || "0700000000",
          first_name: "SmartSale",
          last_name: "User",
          country_code: "UG",
        },
      };

      const orderRes = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error.message);

      return json({ redirect_url: orderData.redirect_url, order_tracking_id: orderData.order_tracking_id });
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  }

  // 3. IPN Callback (Pesapal hits this when a payment status changes)
  if (url.pathname === "/api/pesapal/ipn") {
    // In a production app, you would verify the status with Pesapal here.
    // For now, we just acknowledge receipt to prevent Pesapal from retrying.
    return json({ status: "success" });
  }

  return null;
}

// ... (Keep the rest of your server.ts code exactly as it is: getServerEntry, normalizeCatastrophicSsrResponse, etc.)

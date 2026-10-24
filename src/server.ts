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

const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3"; 

async function getPesapalToken(): Promise<string> {
  const key = getSecret("PESAPAL_CONSUMER_KEY");
  const secret = getSecret("PESAPAL_CONSUMER_SECRET");
  if (!key || !secret) throw new Error("Pesapal credentials missing.");
  const res = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });
  if (!res.ok) throw new Error(`Pesapal auth failed`);
  const data = await res.json();
  return data.token;
}

async function handleApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...GLOBAL_CORS, "Content-Type": "application/json" },
    });

  if (request.method === "OPTIONS") return new Response(null, { headers: GLOBAL_CORS });
  if (url.pathname === "/api/health") return json({ status: "alive" });

  if (url.pathname === "/api/pesapal/pay" && request.method === "POST") {
    try {
      const body: any = await request.json();
      const token = await getPesapalToken();
      const ipnId = getSecret("PESAPAL_IPN_ID");
      if (!ipnId) return json({ error: "PESAPAL_IPN_ID not set." }, 500);

      let formattedPhone = body.phone || "0700000000";
      formattedPhone = formattedPhone.replace(/\s/g, ''); 
      if (formattedPhone.startsWith('0')) formattedPhone = '+256' + formattedPhone.substring(1);
      else if (formattedPhone.startsWith('256')) formattedPhone = '+' + formattedPhone;
      else if (!formattedPhone.startsWith('+')) formattedPhone = '+256' + formattedPhone;

      const orderPayload = {
        id: `SMARTSALE-${Date.now()}`,
        currency: "UGX",
        amount: body.amount,
        description: body.description,
        callback_url: `https://classoni.classoni66.workers.dev/?payment_callback=true`,
        notification_id: ipnId,
        billing_address: {
          email_address: "customer@smartsale.ug",
          phone_number: formattedPhone,
          first_name: "SmartSale",
          last_name: "User",
          country_code: "UG",
        },
      };

      const orderRes = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error.message);

      return json({ redirect_url: orderData.redirect_url, order_tracking_id: orderData.order_tracking_id });
    } catch (err: any) {
      return json({ error: err.message }, 500);
    }
  }

  if (url.pathname === "/api/pesapal/verify" && request.method === "POST") {
    try {
      const body: any = await request.json();
      const token = await getPesapalToken();
      const statusRes = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${body.orderTrackingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusRes.json();
      return json({ status: statusData.payment_status_description });
    } catch (err: any) {
      return json({ error: err.message }, 500);
    }
  }

  return null;
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then((m) => {
      const handler = m.default ?? m;
      if (typeof handler === 'function') {
        return { fetch: handler } as ServerEntry;
      }
      return handler as ServerEntry;
    });
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.indexOf("application/json") !== -1) return response;
  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;
  return new Response(renderErrorPage(), { status: 500, headers: { "content-type": "text/html; charset=utf-8" } });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: any, ctx: unknown) {
    CF_ENV = env;
    try {
      const apiResponse = await handleApi(request);
      if (apiResponse) return apiResponse;
    } catch (apiErr) {
      return new Response(JSON.stringify({ error: "API routing failed: " + String(apiErr) }), {
        status: 500, headers: { ...GLOBAL_CORS, "Content-Type": "application/json" },
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      return new Response(renderErrorPage(), {
        status: 500, headers: { ...GLOBAL_CORS, "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

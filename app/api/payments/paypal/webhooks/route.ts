import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Replace with your actual webhook secret from the PayPal dashboard
const PAYPAL_WEBHOOK_ID = process.env.PP_WEBHOOK_ID!;
const PAYPAL_ENV =
  process.env.NODE_ENV === "production"
    ? "api-m.paypal.com"
    : "api-m.sandbox.paypal.com";

// Utility to verify PayPal webhook signature
async function verifyWebhook(req: NextRequest, body: string) {
  const transmissionId = req.headers.get("paypal-transmission-id")!;
  const timestamp = req.headers.get("paypal-transmission-time")!;
  const webhookEventBody = body;
  const certUrl = req.headers.get("paypal-cert-url")!;
  const actualSig = req.headers.get("paypal-transmission-sig")!;
  const authAlgo = req.headers.get("paypal-auth-algo")!;
  const webhookId = PAYPAL_WEBHOOK_ID;

  // Call PayPal verify endpoint
  const res = await fetch(
    `https://${PAYPAL_ENV}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${process.env.PP_CLIENT_ID}:${process.env.PP_SECRET_KEY}`).toString("base64")}`,
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: timestamp,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: actualSig,
        webhook_id: webhookId,
        webhook_event: JSON.parse(webhookEventBody),
      }),
    }
  );
  const verification = await res.json();
  return verification.verification_status === "SUCCESS";
}

export async function POST(req: NextRequest) {
  // 1. Read raw body for signature verification
  const body = await req.text();

  // 2. Verify signature
  const isValid = await verifyWebhook(req, body);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // 3. Parse event
  const event = JSON.parse(body);
  const { event_type, resource } = event;

  // 4. Handle events
  switch (event_type) {
    case "BILLING.SUBSCRIPTION.CREATED":
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      await prisma.user.update({
        where: { subscriptionId: resource.id },
        data: { subscriptionStatus: "ACTIVE" },
      });
      break;

    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      await prisma.user.update({
        where: { subscriptionId: resource.id },
        data: {
          subscriptionStatus:
            event_type === "CANCELLED" ? "CANCELLED" : "SUSPENDED",
        },
      });
      break;

    case "PAYMENT.SALE.COMPLETED":
      // resource.billing_agreement_id holds the subscriptionId
      await prisma.invoice.create({
        data: {
          user: { connect: { subscriptionId: resource.billing_agreement_id } },
          amount: parseFloat(resource.amount.total),
          saleId: resource.id,
        },
      });
      break;

    // add more as needed…
    default:
      // ignore other events
      break;
  }

  // 5. Acknowledge receipt
  return NextResponse.json({ received: true });
}

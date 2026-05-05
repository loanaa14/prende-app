import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      console.error("Falta MERCADO_PAGO_ACCESS_TOKEN");
      return NextResponse.json({ ok: false });
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const paymentClient = new Payment(client);

    const url = new URL(request.url);

    let paymentId =
      body?.data?.id ||
      body?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    const topic = body?.type || body?.topic || url.searchParams.get("topic");

    if (topic === "merchant_order" && body?.resource) {
      const orderResponse = await fetch(body.resource, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const order = await orderResponse.json();
      paymentId = order?.payments?.[0]?.id;
    }

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const payment = await paymentClient.get({ id: String(paymentId) });

    const status = payment.status;
    const metadata: any = payment.metadata || {};
    const feeId = payment.external_reference || metadata.fee_id;

    console.log("MP PAYMENT RECEIVED:", {
      paymentId: payment.id,
      status,
      feeId,
      metadata,
      external_reference: payment.external_reference,
    });

    if (status === "approved" && feeId) {
      const { error } = await supabaseAdmin
        .from("member_fees")
        .update({
          status: "pagada",
          paid_at: new Date().toISOString(),
          mercado_pago_payment_id: String(payment.id),
          updated_at: new Date().toISOString(),
        })
        .eq("id", String(feeId));

      if (error) {
        console.error("ERROR UPDATING MEMBER FEE:", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json({ ok: false });
  }
}
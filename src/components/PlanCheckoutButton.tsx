"use client";

import { useState } from "react";

export default function PlanCheckoutButton({
  clubId,
  plan,
}: {
  clubId: string;
  plan: "esencial" | "personalizado";
}) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);

    const response = await fetch("/api/create-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        club_id: clubId,
        plan,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "No se pudo iniciar el pago.");
      setLoading(false);
      return;
    }

    const url = data.init_point || data.sandbox_init_point;

    if (!url) {
      alert("Mercado Pago no devolvió una URL de pago.");
      setLoading(false);
      return;
    }

    window.location.href = url;
  }

  return (
    <button onClick={handleCheckout} disabled={loading} className="prende-btn">
      {loading ? "Redirigiendo..." : "Contratar"}
    </button>
  );
}
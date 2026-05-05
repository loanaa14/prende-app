"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F6] px-6">
      <div className="w-full max-w-md bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">
          Ingresar a Prendé
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          Acceso privado para clubes y socios.
        </p>

        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="********"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#76A889] text-white rounded p-2"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <a
          href="/signup"
          className="block text-sm text-[#76A889] mt-4 text-center"
        >
          Crear cuenta
        </a>
      </div>
    </div>
  );
}
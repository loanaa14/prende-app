"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} style={button}>
      <LogOut size={16} />
      Cerrar sesión
    </button>
  );
}

const button: React.CSSProperties = {
  width: "100%",
  height: 50,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#101010",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  cursor: "pointer",
  fontWeight: 850,
};
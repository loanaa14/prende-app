import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Prendé",
  description: "Gestión privada para clubes",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
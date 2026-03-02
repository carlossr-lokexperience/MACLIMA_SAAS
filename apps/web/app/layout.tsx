import "./globals.css";
import React from "react";
import "flatpickr/dist/flatpickr.min.css";

export const metadata = {
  title: "MACLIMA OS",
  description: "Operations SaaS template",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

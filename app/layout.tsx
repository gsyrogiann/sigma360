import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RetailPilot",
  description: "Καταστήματα. Προσωπικό. Καλύτερα αποτελέσματα.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}

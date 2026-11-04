import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hosilink — Daladan dasturxoningizga",
  description: "Farg‘ona restoranlari va fermerlarini bog‘laydigan yangi savdo yo‘li.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased">{children}</body>
    </html>
  );
}

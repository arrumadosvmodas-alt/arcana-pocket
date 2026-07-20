import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Arcana Pocket",
  description: "Um jogo de cartas colecionáveis original, para partidas rápidas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arcana Pocket",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

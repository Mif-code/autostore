import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import FloatingChat from "@/components/FloatingChat";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoStore",
  description:
    "Catálogo, comparação de veículos e assistente inteligente.",
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}

        <FloatingChat />
      </body>
    </html>
  );
}

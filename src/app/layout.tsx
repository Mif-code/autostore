import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import FloatingChat from "@/components/FloatingChat";
import ThemeProvider from "@/components/ThemeProvider";

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
  title: "Vroomly AutoStore",
  description:
    "Catálogo inteligente de veículos com comparação, leads e assistente VroomAI.",
};

const SCRIPT_TEMA = `
(function () {
  try {
    var chave = "vroom-autostore-tema";
    var temaSalvo = localStorage.getItem(chave);
    var prefereEscuro = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    var tema =
      temaSalvo === "dark" ||
      temaSalvo === "light"
        ? temaSalvo
        : prefereEscuro
          ? "dark"
          : "light";

    document.documentElement.classList.toggle(
      "dark",
      tema === "dark"
    );

    document.documentElement.style.colorScheme = tema;
  } catch (error) {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: SCRIPT_TEMA,
          }}
        />
      </head>

      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          {children}

          <FloatingChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
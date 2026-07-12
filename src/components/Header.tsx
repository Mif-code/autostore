"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { useTheme } from "@/components/ThemeProvider";

interface LinkNavegacao {
  readonly nome: string;
  readonly href: string;
  readonly icone:
    | "catalogo"
    | "comparar"
    | "ia"
    | "leads";
}

const links: LinkNavegacao[] = [
  {
    nome: "Catálogo",
    href: "/",
    icone: "catalogo",
  },
  {
    nome: "Comparar",
    href: "/comparar",
    icone: "comparar",
  },
  {
    nome: "VroomAI",
    href: "/chat/new",
    icone: "ia",
  },
  {
    nome: "Leads",
    href: "/leads",
    icone: "leads",
  },
];

interface IconeMenuProps {
  readonly tipo: LinkNavegacao["icone"];
}

function IconeMenu({
  tipo,
}: IconeMenuProps) {
  if (tipo === "catalogo") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect
          x="4"
          y="4"
          width="6"
          height="6"
          rx="1"
        />

        <rect
          x="14"
          y="4"
          width="6"
          height="6"
          rx="1"
        />

        <rect
          x="4"
          y="14"
          width="6"
          height="6"
          rx="1"
        />

        <rect
          x="14"
          y="14"
          width="6"
          height="6"
          rx="1"
        />
      </svg>
    );
  }

  if (tipo === "comparar") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M7 7h12" />
        <path d="m15 3 4 4-4 4" />
        <path d="M17 17H5" />
        <path d="m9 13-4 4 4 4" />
      </svg>
    );
  }

  if (tipo === "ia") {
    return (
      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
        <Image
          src="/vroom-ai-icon.png"
          alt=""
          fill
          sizes="28px"
          className="object-contain"
        />
      </span>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />
    </svg>
  );
}

function IconeSol() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.42 1.42" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.35 17.66-1.42 1.41" />
      <path d="m19.07 4.93-1.41 1.42" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { tema, alternarTema } = useTheme();

  const [paginaRolada, setPaginaRolada] =
    useState(false);

  useEffect(() => {
    function verificarRolagem(): void {
      setPaginaRolada(window.scrollY > 40);
    }

    verificarRolagem();

    window.addEventListener(
      "scroll",
      verificarRolagem,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        verificarRolagem,
      );
    };
  }, []);

  function linkEstaAtivo(
    href: string,
  ): boolean {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 py-2">
      <div
        className={`relative flex min-h-20 items-center border-b border-slate-200 transition-all duration-300 dark:border-slate-800 ${
          paginaRolada
            ? "rounded-3xl border bg-white/95 px-5 shadow-lg backdrop-blur-md dark:bg-neutral-950/95"
            : "bg-transparent px-0"
        }`}
      >
        <Link
          href="/"
          aria-label="Ir para o catálogo"
          className="absolute left-0 flex shrink-0 items-center"
        >
          <Image
            src="/vroomly-logo.png"
            alt="Vroomly"
            width={160}
            height={60}
            priority
            className="h-auto w-55 object-contain dark:brightness-0 dark:invert"
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
        >
          {links.map((link) => {
            const ativo =
              linkEstaAtivo(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  ativo
                    ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-300"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-900 dark:hover:text-white"
                }`}
              >
                <IconeMenu
                  tipo={link.icone}
                />

                <span>{link.nome}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={alternarTema}
          aria-label={
            tema === "dark"
              ? "Ativar tema claro"
              : "Ativar tema escuro"
          }
          title={
            tema === "dark"
              ? "Ativar tema claro"
              : "Ativar tema escuro"
          }
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:text-slate-300 dark:hover:bg-neutral-900 dark:hover:text-white dark:focus:ring-offset-neutral-950"
        >
          {tema === "dark" ? (
            <IconeSol />
          ) : (
            <IconeLua />
          )}
        </button>
      </div>
    </header>
  );
}
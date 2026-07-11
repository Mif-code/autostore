"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface LinkNavegacao {
  readonly nome: string;
  readonly href: string;
  readonly icone: "catalogo" | "comparar" | "ia" | "leads";
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
    nome: "AutoStoreAI",
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

function IconeMenu({ tipo }: IconeMenuProps) {
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
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
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
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 3v3" />
        <path d="M12 18v3" />
        <path d="M3 12h3" />
        <path d="M18 12h3" />
        <path d="m4.2 4.2 2.1 2.1" />
        <path d="m17.7 17.7 2.1 2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
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

function IconeTema() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [paginaRolada, setPaginaRolada] = useState(false);

  useEffect(() => {
    function verificarRolagem(): void {
      setPaginaRolada(window.scrollY > 40);
    }

    verificarRolagem();

    window.addEventListener("scroll", verificarRolagem, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", verificarRolagem);
    };
  }, []);

  function linkEstaAtivo(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 py-2">
      <div
        className={`relative flex items-center justify-between gap-3 transition-all duration-300 ease-out ${
          paginaRolada
            ? "rounded-3xl border border-slate-200 bg-white/95 px-4 shadow-lg backdrop-blur-md lg:h-16"
            : "border-b border-slate-200 bg-transparent px-0 shadow-none lg:h-20"
        }`}
      >
        <Link
          href="/"
          aria-label="Ir para o catálogo"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/vroomly-logo.png"
            alt="Vroomly"
            width={220}
            height={80}
            priority
            className={`h-auto object-contain transition-all duration-300 ${
              paginaRolada ? "w-55" : "w-60"
            }`}
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className={`flex max-w-[calc(100%-180px)] items-center gap-1 overflow-x-auto rounded-2xl p-1 transition-colors duration-300 lg:absolute lg:left-1/2 lg:max-w-none lg:-translate-x-1/2 ${
            paginaRolada ? "bg-slate-100" : "bg-slate-100/80"
          }`}
        >
          {links.map((link) => {
            const ativo = linkEstaAtivo(link.href);
            const linkDaIA = link.icone === "ia";

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={linkDaIA ? "Abrir AutoStoreAI" : undefined}
                title={linkDaIA ? "AutoStoreAI" : undefined}
                className={`flex shrink-0 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition ${
                  linkDaIA ? "px-3" : "px-3 sm:px-4"
                } ${
                  ativo
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <IconeMenu tipo={link.icone} />

                {!linkDaIA && <span>{link.nome}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="Alternar tema"
          title="Alternar tema"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <IconeTema />
        </button>
      </div>
    </header>
  );
}
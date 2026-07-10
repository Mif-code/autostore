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
        className={`flex flex-col gap-2 transition-all duration-300 ease-out lg:flex-row lg:items-center lg:justify-between ${
          paginaRolada
            ? "rounded-3xl border border-slate-200 bg-white/95 px-4 shadow-lg backdrop-blur-md lg:h-16"
            : "border-b border-slate-200 bg-transparent px-0 shadow-none lg:h-18"
        }`}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Ir para o catálogo AutoStore"
        >
          <div
            className={`relative overflow-hidden transition-all duration-300 ${
              paginaRolada ? "h-14 w-40" : "h-16 w-44"
            }`}
          >
            <Image
              src="/autostore-logo.png"
              alt="AutoStore"
              fill
              priority
              sizes="176px"
              className="scale-[2.15] object-contain object-center"
            />
          </div>
        </Link>

        <nav
          aria-label="Navegação principal"
          className={`flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl p-1 transition-colors duration-300 ${
            paginaRolada ? "bg-slate-100" : "bg-transparent"
          }`}
        >
          {links.map((link) => {
            const ativo = linkEstaAtivo(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-4 ${
                  ativo
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <IconeMenu tipo={link.icone} />

                <span>{link.nome}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className={`hidden transition-all duration-300 lg:block ${
            paginaRolada ? "w-40" : "w-44"
          }`}
          aria-hidden="true"
        />
      </div>
    </header>
  );
}
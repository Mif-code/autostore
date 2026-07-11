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
      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
        <Image
          src="/vroom-ai-icon.png"
          alt=""
          fill
          sizes="20px"
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
        className={`relative flex min-h-20 items-center border-b border-slate-200 transition-all duration-300 ${
          paginaRolada
            ? "rounded-3xl border bg-white/95 px-5 shadow-lg backdrop-blur-md"
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
            className="h-auto w-55 object-contain"
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
        >
          {links.map((link) => {
            const ativo = linkEstaAtivo(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
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

        <button
          type="button"
          aria-label="Alternar tema"
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-slate-900"
        >
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
        </button>
      </div>
    </header>
  );
}
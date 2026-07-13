"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/ThemeProvider";

interface LinkInstitucional {
  readonly nome: string;
  readonly href: string;
  readonly destaque?: boolean;
}

interface LinkNavegacao {
  readonly nome: string;
  readonly href: string;
  readonly icone:
    | "catalogo"
    | "comparar"
    | "ia"
    | "leads"
    | "admin";
}

const linksInstitucionais: readonly LinkInstitucional[] = [
  {
    nome: "Home",
    href: "/",
  },
  {
    nome: "Sobre nós",
    href: "/#sobre-nos",
  },
  {
    nome: "FAQ",
    href: "/#faq",
  },
  {
    nome: "Contato",
    href: "/#contato",
  },
  {
    nome: "Endereço",
    href: "/#endereco",
  },
  {
    nome: "Ver carros disponíveis",
    href: "/#catalogo",
    destaque: true,
  },
];

const links: readonly LinkNavegacao[] = [
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
  {
    nome: "Admin",
    href: "/admin/carros",
    icone: "admin",
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
          sizes="28px"
          className="object-contain"
        />
      </span>
    );
  }

  if (tipo === "leads") {
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

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 4v5" />
      <path d="M16 4v5" />
      <path d="M8 14h3" />
      <path d="M14 14h2" />
      <path d="M8 17h2" />
      <path d="M13 17h3" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
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
      strokeLinecap="round"
      strokeLinejoin="round"
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

    if (href === "/admin/carros") {
      return pathname.startsWith("/admin");
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 -mt-5 sm:-mt-7">
      <div
        className={`overflow-hidden transition-all duration-300 ${
          paginaRolada
            ? "rounded-b-3xl border-x border-b border-slate-200 bg-white/95 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-neutral-950/95"
            : "bg-transparent"
        }`}
      >
        {/* BARRA SUPERIOR: MESMA COR DO RODAPÉ */}

        <div
          className={`overflow-hidden bg-slate-800 transition-all duration-300 ease-in-out dark:bg-slate-800 ${
            paginaRolada
              ? "max-h-0 -translate-y-full opacity-0"
              : "max-h-11 translate-y-0 opacity-100"
          }`}
        >
          <nav
            aria-label="Navegação institucional"
            className="flex min-h-11 items-center gap-1 overflow-x-auto px-3 scrollbar-none sm:justify-center sm:gap-2 sm:px-5"
          >
            {linksInstitucionais.map((link) => (
              <Link
                key={link.nome}
                href={link.href}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  link.destaque
                    ? "bg-white text-slate-800 shadow-sm hover:bg-slate-100"
                    : "text-slate-100 hover:bg-white/15 hover:text-white"
                }`}
              >
                {link.nome}
              </Link>
            ))}
          </nav>
        </div>

        {/* MENU PRINCIPAL: PERMANECE FIXO */}

        <div
          className={`relative flex min-h-20 items-center border-b border-slate-200 transition-all duration-300 dark:border-slate-800 ${
            paginaRolada
              ? "bg-white/95 px-5 dark:bg-neutral-950/95"
              : "bg-transparent px-0"
          }`}
        >
          <Link
            href="/"
            aria-label="Ir para o catálogo"
            className={`absolute flex shrink-0 items-center transition-all duration-300 ${
              paginaRolada ? "left-5" : "left-0"
            }`}
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
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1"
          >
            {links.map((link) => {
              const ativo = linkEstaAtivo(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                    ativo
                      ? "bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-300"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-900 dark:hover:text-white"
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
            className={`absolute flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-all duration-300 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:text-slate-300 dark:hover:bg-neutral-900 dark:hover:text-white dark:focus:ring-offset-neutral-950 ${
              paginaRolada ? "right-5" : "right-0"
            }`}
          >
            {tema === "dark" ? <IconeSol /> : <IconeLua />}
          </button>
        </div>
      </div>
    </header>
  );
}
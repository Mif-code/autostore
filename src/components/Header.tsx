"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    nome: "Catálogo",
    href: "/",
  },
  {
    nome: "Comparar",
    href: "/comparar",
  },
  {
    nome: "VroomAI",
    href: "/chat/new",
  },
  {
    nome: "Leads",
    href: "/leads",
  },
];

export default function Header() {
  const pathname = usePathname();

  function linkEstaAtivo(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="mb-8 border-b border-zinc-200">
      <div className="flex min-h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            AutoStore
          </h1>
        </Link>

        <nav className="flex items-center gap-2">
          {links.map((link) => {
            const ativo = linkEstaAtivo(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  ativo
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {link.nome}
              </Link>
            );
          })}
        </nav>

        <div className="hidden w-32 lg:block" />
      </div>
    </header>
  );
}
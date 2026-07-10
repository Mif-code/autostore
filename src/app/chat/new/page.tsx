import Link from "next/link";

import Header from "@/components/Header";
import ChatIA from "@/components/ChatIA";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <Header />

        <section className="mt-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Assistente inteligente
              </p>

              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                AutoStoreAI
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Consulte o catálogo, compare veículos e encontre uma opção
                adequada às suas necessidades.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>

              Voltar ao catálogo
            </Link>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3v3" />
                  <path d="M12 18v3" />
                  <path d="M3 12h3" />
                  <path d="M18 12h3" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Converse com o AutoStoreAI
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Pergunte sobre preços, consumo, cores, categorias ou
                  comparações.
                </p>
              </div>
            </div>

            <ChatIA />
          </section>
        </section>
      </div>
    </main>
  );
}
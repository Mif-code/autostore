import Link from "next/link";
import ChatIA from "@/components/ChatIA";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-3xl font-bold text-zinc-900">
              AutoStore
            </Link>

            <p className="mt-1 text-zinc-600">
              Assistente inteligente para escolha de veículos
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-zinc-300 bg-white px-5 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Voltar ao catálogo
          </Link>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-zinc-200 pb-5">
            <h1 className="text-2xl font-bold text-zinc-900">VroomAI</h1>

            <p className="mt-1 text-zinc-600">
              Consulte o catálogo e encontre o veículo ideal para você.
            </p>
          </div>

          <ChatIA />
        </section>
      </div>
    </main>
  );
}
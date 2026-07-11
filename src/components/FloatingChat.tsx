"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

interface FonteRag {
  readonly id: string;
  readonly arquivo: string;
  readonly trecho: number;
  readonly similaridade: number;
  readonly conteudo: string;
}

interface MensagemChat {
  readonly id: string;
  readonly autor: "usuario" | "ia";
  readonly texto: string;
  readonly fontes?: FonteRag[];
}

interface RespostaChat {
  readonly sucesso: boolean;
  readonly mensagem: string;
  readonly resultado?: {
    readonly pergunta: string;
    readonly resposta: string;
    readonly modelo: string;
    readonly fontes: FonteRag[];
  };
}

const SUGESTOES = [
  "Carros elétricos",
  "Melhor custo-benefício",
  "SUVs disponíveis",
];

function criarId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function formatarSimilaridade(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}

interface IconeAssistenteProps {
  readonly tamanho?: "pequeno" | "grande";
}

function IconeAssistente({
  tamanho = "pequeno",
}: IconeAssistenteProps) {
  const classes =
    tamanho === "grande"
      ? "h-14 w-14 rounded-2xl"
      : "h-10 w-10 rounded-xl";

  const tamanhoImagem =
    tamanho === "grande" ? "56px" : "40px";

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-blue-50 ${classes}`}
    >
      <Image
        src="/vroom-ai-icon.png"
        alt="VroomAI"
        fill
        sizes={tamanhoImagem}
        className="object-contain p-1"
      />
    </div>
  );
}

function IconeEnviar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  );
}

function IconeSugestao() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
      <path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z" />
    </svg>
  );
}

export default function FloatingChat() {
  const pathname = usePathname();

  const [aberto, setAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [mensagens, setMensagens] = useState<
    MensagemChat[]
  >([]);

  const fimMensagensRef = useRef<HTMLDivElement>(null);

  const paginaDoChat =
    pathname === "/chat/new" ||
    pathname.startsWith("/chat/");

  useEffect(() => {
    fimMensagensRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [mensagens, enviando]);

  async function processarPergunta(
    perguntaAtual: string,
  ): Promise<void> {
    const perguntaLimpa = perguntaAtual.trim();

    if (!perguntaLimpa || enviando) {
      return;
    }

    const mensagemUsuario: MensagemChat = {
      id: criarId(),
      autor: "usuario",
      texto: perguntaLimpa,
    };

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      mensagemUsuario,
    ]);

    setPergunta("");
    setEnviando(true);

    try {
      const respostaHttp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pergunta: perguntaLimpa,
        }),
      });

      const dados =
        (await respostaHttp.json()) as RespostaChat;

      if (
        !respostaHttp.ok ||
        !dados.sucesso ||
        !dados.resultado
      ) {
        throw new Error(
          dados.mensagem ||
            "Não foi possível obter uma resposta do VroomAI.",
        );
      }

      const mensagemIA: MensagemChat = {
        id: criarId(),
        autor: "ia",
        texto: dados.resultado.resposta,
        fontes: dados.resultado.fontes,
      };

      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        mensagemIA,
      ]);
    } catch (error) {
      const textoErro =
        error instanceof Error
          ? error.message
          : "Não foi possível processar sua pergunta.";

      const mensagemErro: MensagemChat = {
        id: criarId(),
        autor: "ia",
        texto: textoErro,
      };

      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        mensagemErro,
      ]);
    } finally {
      setEnviando(false);
    }
  }

  function enviarPergunta(
    event: SubmitEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();
    void processarPergunta(pergunta);
  }

  function iniciarNovaConversa(): void {
    if (enviando) {
      return;
    }

    setMensagens([]);
    setPergunta("");
  }

  if (paginaDoChat) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {aberto ? (
        <section className="flex h-[min(650px,calc(100vh-40px))] w-[calc(100vw-40px)] max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <IconeAssistente />

              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900">
                  VroomAI
                </h2>

                <p className="truncate text-xs text-slate-500">
                  Chat ativo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={iniciarNovaConversa}
                aria-label="Iniciar nova conversa"
                title="Nova conversa"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </button>

              <Link
                href="/chat/new"
                aria-label="Abrir chat completo"
                title="Abrir chat completo"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h6v6" />
                  <path d="m21 3-8 8" />
                  <path d="M9 21H3v-6" />
                  <path d="m3 21 8-8" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar chat"
                title="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>
          </header>

          {mensagens.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-8">
              <IconeAssistente tamanho="grande" />

              <h3 className="mt-5 text-center text-2xl font-bold text-slate-900">
                Como posso ajudar?
              </h3>

              <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-slate-500">
                Base técnica local: preços, consumo,
                cores e comparações.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {SUGESTOES.map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    disabled={enviando}
                    onClick={() =>
                      void processarPergunta(sugestao)
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconeSugestao />
                    {sugestao}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 px-4 py-5"
              aria-live="polite"
            >
              {mensagens.map((mensagem) => (
                <div
                  key={mensagem.id}
                  className={`flex ${
                    mensagem.autor === "usuario"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      mensagem.autor === "usuario"
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {mensagem.texto}
                    </p>

                    {mensagem.fontes &&
                      mensagem.fontes.length > 0 && (
                        <div className="mt-4 border-t border-slate-200 pt-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Fontes consultadas
                          </p>

                          <div className="space-y-2">
                            {mensagem.fontes.map(
                              (fonte) => (
                                <article
                                  key={fonte.id}
                                  className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600"
                                >
                                  <div className="flex flex-wrap justify-between gap-2">
                                    <strong className="text-slate-800">
                                      {fonte.arquivo}
                                    </strong>

                                    <span>
                                      {formatarSimilaridade(
                                        fonte.similaridade,
                                      )}
                                    </span>
                                  </div>

                                  <p className="mt-2">
                                    Trecho {fonte.trecho}
                                  </p>

                                  <p className="mt-2 line-clamp-3">
                                    {fonte.conteudo}
                                  </p>
                                </article>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {enviando && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    VroomAI está analisando...
                  </div>
                </div>
              )}

              <div ref={fimMensagensRef} />
            </div>
          )}

          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            {mensagens.length > 0 && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {SUGESTOES.map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    disabled={enviando}
                    onClick={() =>
                      void processarPergunta(sugestao)
                    }
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconeSugestao />
                    {sugestao}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={enviarPergunta}
              className="flex min-h-16 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 pl-4 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"
            >
              <textarea
                aria-label="Pergunta para o VroomAI"
                placeholder="Pergunte sobre preços, consumo, cores, comparações..."
                value={pergunta}
                disabled={enviando}
                maxLength={1000}
                rows={2}
                onChange={(event) =>
                  setPergunta(event.target.value)
                }
                className="max-h-28 min-h-10 min-w-0 flex-1 resize-none bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                aria-label="Enviar pergunta"
                disabled={enviando || !pergunta.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                <IconeEnviar />
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir VroomAI"
          title="Abrir VroomAI"
          className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-xl transition hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <Image
            src="/vroom-ai-icon.png"
            alt="VroomAI"
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        </button>
      )}
    </div>
  );
}
"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

import ChatSidebar from "@/components/ChatSidebar";

interface FonteRag {
  readonly id: string;
  readonly arquivo: string;
  readonly trecho: number;
  readonly similaridade: number;
  readonly conteudo: string;
}

interface Mensagem {
  readonly id: string;
  readonly autor: "usuario" | "ia";
  readonly texto: string;
  readonly fontes?: FonteRag[];
}

interface Conversa {
  readonly id: string;
  readonly titulo: string;
  readonly atualizadaEm: string;
  readonly mensagens: Mensagem[];
}

interface EstadoChat {
  readonly conversas: Conversa[];
  readonly conversaAtivaId: string;
  readonly historicoCarregado: boolean;
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

interface SugestoesPerguntasProps {
  readonly enviando: boolean;
  readonly onSelecionar: (sugestao: string) => void;
}

interface IconeAssistenteProps {
  readonly tamanho?: "pequeno" | "grande";
}

const CHAVE_HISTORICO =
  "autostore-ai-conversas";

const SUGESTOES_PERGUNTAS = [
  "Carros elétricos",
  "Melhor custo-benefício",
  "SUVs disponíveis",
];

const ESTADO_INICIAL: EstadoChat = {
  conversas: [],
  conversaAtivaId: "",
  historicoCarregado: false,
};

function criarId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function criarNovaConversa(): Conversa {
  return {
    id: criarId(),
    titulo: "Nova conversa",
    atualizadaEm: new Date().toISOString(),
    mensagens: [],
  };
}

function criarTituloConversa(
  pergunta: string,
): string {
  const limite = 42;

  if (pergunta.length <= limite) {
    return pergunta;
  }

  return `${pergunta
    .slice(0, limite)
    .trim()}...`;
}

function formatarSimilaridade(
  valor: number,
): string {
  return `${Math.round(valor * 100)}%`;
}

function mensagemEhValida(
  valor: unknown,
): valor is Mensagem {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const mensagem = valor as Partial<Mensagem>;

  return (
    typeof mensagem.id === "string" &&
    (mensagem.autor === "usuario" ||
      mensagem.autor === "ia") &&
    typeof mensagem.texto === "string"
  );
}

function conversaEhValida(
  valor: unknown,
): valor is Conversa {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const conversa = valor as Partial<Conversa>;

  return (
    typeof conversa.id === "string" &&
    typeof conversa.titulo === "string" &&
    typeof conversa.atualizadaEm === "string" &&
    Array.isArray(conversa.mensagens) &&
    conversa.mensagens.every(mensagemEhValida)
  );
}

function carregarConversasSalvas(): Conversa[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const conteudoSalvo =
      window.localStorage.getItem(
        CHAVE_HISTORICO,
      );

    if (!conteudoSalvo) {
      return [];
    }

    const dados: unknown =
      JSON.parse(conteudoSalvo);

    if (!Array.isArray(dados)) {
      return [];
    }

    return dados.filter(conversaEhValida);
  } catch {
    return [];
  }
}

function IconeAssistente({
  tamanho = "pequeno",
}: IconeAssistenteProps) {
  const classes =
    tamanho === "grande"
      ? "h-16 w-16 rounded-2xl"
      : "h-12 w-12 rounded-xl";

  const tamanhoImagem =
    tamanho === "grande" ? "64px" : "48px";

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

function SugestoesPerguntas({
  enviando,
  onSelecionar,
}: SugestoesPerguntasProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGESTOES_PERGUNTAS.map(
        (sugestao) => (
          <button
            key={sugestao}
            type="button"
            disabled={enviando}
            onClick={() =>
              onSelecionar(sugestao)
            }
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconeSugestao />

            {sugestao}
          </button>
        ),
      )}
    </div>
  );
}

export default function ChatIA() {
  const [pergunta, setPergunta] =
    useState("");

  const [enviando, setEnviando] =
    useState(false);

  const [estadoChat, setEstadoChat] =
    useState<EstadoChat>(ESTADO_INICIAL);

  const fimMensagensRef =
    useRef<HTMLDivElement>(null);

  const {
    conversas,
    conversaAtivaId,
    historicoCarregado,
  } = estadoChat;

  useEffect(() => {
    const temporizador =
      window.setTimeout(() => {
        const conversasSalvas =
          carregarConversasSalvas();

        if (conversasSalvas.length > 0) {
          setEstadoChat({
            conversas: conversasSalvas,
            conversaAtivaId:
              conversasSalvas[0].id,
            historicoCarregado: true,
          });

          return;
        }

        const novaConversa =
          criarNovaConversa();

        setEstadoChat({
          conversas: [novaConversa],
          conversaAtivaId: novaConversa.id,
          historicoCarregado: true,
        });
      }, 0);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, []);

  useEffect(() => {
    if (
      !historicoCarregado ||
      conversas.length === 0
    ) {
      return;
    }

    window.localStorage.setItem(
      CHAVE_HISTORICO,
      JSON.stringify(conversas),
    );
  }, [conversas, historicoCarregado]);

  const conversaAtiva = useMemo(
    () =>
      conversas.find(
        (conversa) =>
          conversa.id === conversaAtivaId,
      ),
    [conversas, conversaAtivaId],
  );

  const conversasResumo = useMemo(
    () =>
      conversas.map((conversa) => ({
        id: conversa.id,
        titulo: conversa.titulo,
        atualizadaEm: conversa.atualizadaEm,
      })),
    [conversas],
  );

  useEffect(() => {
    fimMensagensRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    conversaAtiva?.mensagens.length,
    enviando,
  ]);

  function atualizarConversa(
    conversaId: string,
    atualizar: (
      conversa: Conversa,
    ) => Conversa,
  ): void {
    setEstadoChat((estadoAtual) => ({
      ...estadoAtual,
      conversas:
        estadoAtual.conversas.map(
          (conversa) =>
            conversa.id === conversaId
              ? atualizar(conversa)
              : conversa,
        ),
    }));
  }

  function adicionarMensagem(
    conversaId: string,
    mensagem: Mensagem,
    titulo?: string,
  ): void {
    atualizarConversa(
      conversaId,
      (conversa) => ({
        ...conversa,
        titulo: titulo ?? conversa.titulo,
        atualizadaEm:
          new Date().toISOString(),
        mensagens: [
          ...conversa.mensagens,
          mensagem,
        ],
      }),
    );
  }

  function iniciarNovaConversa(): void {
    if (enviando) {
      return;
    }

    const novaConversa =
      criarNovaConversa();

    setEstadoChat((estadoAtual) => ({
      ...estadoAtual,
      conversas: [
        novaConversa,
        ...estadoAtual.conversas,
      ],
      conversaAtivaId: novaConversa.id,
    }));

    setPergunta("");
  }

  function limparHistorico(): void {
    if (enviando) {
      return;
    }

    const confirmou = window.confirm(
      "Deseja realmente apagar todo o histórico de conversas?",
    );

    if (!confirmou) {
      return;
    }

    const novaConversa =
      criarNovaConversa();

    window.localStorage.removeItem(
      CHAVE_HISTORICO,
    );

    setEstadoChat({
      conversas: [novaConversa],
      conversaAtivaId: novaConversa.id,
      historicoCarregado: true,
    });

    setPergunta("");
  }

  function selecionarConversa(
    conversaId: string,
  ): void {
    if (enviando) {
      return;
    }

    setEstadoChat((estadoAtual) => ({
      ...estadoAtual,
      conversaAtivaId: conversaId,
    }));

    setPergunta("");
  }

  async function processarPergunta(
    perguntaAtual: string,
  ): Promise<void> {
    if (
      !perguntaAtual ||
      enviando ||
      !conversaAtiva
    ) {
      return;
    }

    const conversaId = conversaAtiva.id;

    const mensagemUsuario: Mensagem = {
      id: criarId(),
      autor: "usuario",
      texto: perguntaAtual,
    };

    const titulo =
      conversaAtiva.titulo ===
      "Nova conversa"
        ? criarTituloConversa(
            perguntaAtual,
          )
        : conversaAtiva.titulo;

    adicionarMensagem(
      conversaId,
      mensagemUsuario,
      titulo,
    );

    setPergunta("");
    setEnviando(true);

    try {
      const respostaHttp = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            pergunta: perguntaAtual,
          }),
        },
      );

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

      adicionarMensagem(conversaId, {
        id: criarId(),
        autor: "ia",
        texto:
          dados.resultado.resposta,
        fontes:
          dados.resultado.fontes,
      });
    } catch (error) {
      adicionarMensagem(conversaId, {
        id: criarId(),
        autor: "ia",
        texto:
          error instanceof Error
            ? error.message
            : "Não foi possível processar sua pergunta.",
      });
    } finally {
      setEnviando(false);
    }
  }

  async function enviarPergunta(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    await processarPergunta(
      pergunta.trim(),
    );
  }

  async function usarSugestao(
    sugestao: string,
  ): Promise<void> {
    await processarPergunta(sugestao);
  }

  if (
    !historicoCarregado ||
    !conversaAtiva
  ) {
    return (
      <div className="flex min-h-150 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          Carregando conversas...
        </p>
      </div>
    );
  }

  const conversaVazia =
    conversaAtiva.mensagens.length === 0;

  return (
    <div className="grid min-h-[calc(100vh-118px)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <ChatSidebar
        conversas={conversasResumo}
        conversaAtivaId={conversaAtivaId}
        onNovaConversa={iniciarNovaConversa}
        onSelecionarConversa={
          selecionarConversa
        }
        onLimparHistorico={
          limparHistorico
        }
      />

      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex h-24 shrink-0 items-center justify-between border-b border-slate-200 px-7">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              aria-label="Abrir menu de conversas"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            <IconeAssistente />

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-950">
                VroomAI
              </h1>

              <p className="truncate text-sm text-slate-500">
                Catálogo da loja · respostas em
                tempo real
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 sm:flex">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3H3v5" />
              <path d="m3 3 6 6" />
              <path d="M16 21h5v-5" />
              <path d="m21 21-6-6" />
            </svg>

            Flutuante auto
          </div>
        </header>

        {conversaVazia ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
            <IconeAssistente tamanho="grande" />

            <h2 className="mt-6 text-center text-3xl font-semibold tracking-tight text-slate-950">
              Como posso ajudar?
            </h2>

            <div className="mt-5">
              <SugestoesPerguntas
                enviando={enviando}
                onSelecionar={(sugestao) =>
                  void usarSugestao(
                    sugestao,
                  )
                }
              />
            </div>

            <form
              className="mt-6 flex h-18 w-full max-w-3xl items-center rounded-2xl border border-slate-200 bg-white px-3 pl-6 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"
              onSubmit={enviarPergunta}
            >
              <input
                type="text"
                aria-label="Pergunta para o VroomAI"
                placeholder="Pergunte sobre preços, consumo, cores, comparações..."
                value={pergunta}
                disabled={enviando}
                maxLength={1000}
                onChange={(event) =>
                  setPergunta(
                    event.target.value,
                  )
                }
                className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                aria-label="Enviar pergunta"
                disabled={
                  enviando ||
                  !pergunta.trim()
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                <IconeEnviar />
              </button>
            </form>
          </div>
        ) : (
          <>
            <div
              className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 px-8 py-7"
              aria-live="polite"
            >
              {conversaAtiva.mensagens.map(
                (mensagem) => (
                  <div
                    key={mensagem.id}
                    className={`flex ${
                      mensagem.autor ===
                      "usuario"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-5 py-4 text-sm leading-7 ${
                        mensagem.autor ===
                        "usuario"
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {mensagem.texto}
                      </p>

                      {mensagem.fontes &&
                        mensagem.fontes
                          .length > 0 && (
                          <div className="mt-4 border-t border-slate-200 pt-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Fontes consultadas
                            </p>

                            <div className="space-y-2">
                              {mensagem.fontes.map(
                                (fonte) => (
                                  <article
                                    key={
                                      fonte.id
                                    }
                                    className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600"
                                  >
                                    <div className="flex flex-wrap justify-between gap-2">
                                      <strong className="text-slate-800">
                                        {
                                          fonte.arquivo
                                        }
                                      </strong>

                                      <span>
                                        Relevância:{" "}
                                        {formatarSimilaridade(
                                          fonte.similaridade,
                                        )}
                                      </span>
                                    </div>

                                    <p className="mt-2 font-medium text-slate-700">
                                      Trecho{" "}
                                      {
                                        fonte.trecho
                                      }
                                    </p>

                                    <p className="mt-2 line-clamp-3">
                                      {
                                        fonte.conteudo
                                      }
                                    </p>
                                  </article>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ),
              )}

              {enviando && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-blue-50">
                      <Image
                        src="/vroom-ai-icon.png"
                        alt="VroomAI"
                        fill
                        sizes="28px"
                        className="object-contain p-0.5"
                      />
                    </div>

                    VroomAI está analisando os
                    documentos...
                  </div>
                </div>
              )}

              <div ref={fimMensagensRef} />
            </div>

            <div className="border-t border-slate-200 bg-white px-6 py-4">
              <SugestoesPerguntas
                enviando={enviando}
                onSelecionar={(sugestao) =>
                  void usarSugestao(
                    sugestao,
                  )
                }
              />

              <form
                className="mx-auto mt-4 flex h-18 w-full max-w-3xl items-center rounded-2xl border border-slate-200 bg-white px-3 pl-6 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"
                onSubmit={enviarPergunta}
              >
                <input
                  type="text"
                  aria-label="Pergunta para o VroomAI"
                  placeholder="Pergunte sobre preços, consumo, cores, comparações..."
                  value={pergunta}
                  disabled={enviando}
                  maxLength={1000}
                  onChange={(event) =>
                    setPergunta(
                      event.target.value,
                    )
                  }
                  className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
                />

                <button
                  type="submit"
                  aria-label="Enviar pergunta"
                  disabled={
                    enviando ||
                    !pergunta.trim()
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  <IconeEnviar />
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
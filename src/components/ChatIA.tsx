"use client";

import {
  useEffect,
  useMemo,
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

const CHAVE_HISTORICO = "autostore-ai-conversas";

const SUGESTOES_PERGUNTAS = [
  "Qual carro tem o menor preço inicial?",
  "Quais cores e qual o consumo do Corolla Cross?",
  "Compare o Onix e o HB20 para uso urbano.",
  "Qual SUV elétrico ou híbrido você recomenda?",
];

const TEXTO_MENSAGEM_INICIAL =
  "Olá! Sou o AutoStoreAI. Posso ajudar você a encontrar, comparar e conhecer melhor os veículos disponíveis no catálogo.";

const ESTADO_INICIAL: EstadoChat = {
  conversas: [],
  conversaAtivaId: "",
  historicoCarregado: false,
};

function criarId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function criarMensagemInicial(): Mensagem {
  return {
    id: criarId(),
    autor: "ia",
    texto: TEXTO_MENSAGEM_INICIAL,
  };
}

function criarNovaConversa(): Conversa {
  return {
    id: criarId(),
    titulo: "Nova conversa",
    atualizadaEm: new Date().toISOString(),
    mensagens: [criarMensagemInicial()],
  };
}

function criarTituloConversa(pergunta: string): string {
  const limite = 42;

  if (pergunta.length <= limite) {
    return pergunta;
  }

  return `${pergunta.slice(0, limite).trim()}...`;
}

function formatarSimilaridade(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}

function mensagemEhValida(valor: unknown): valor is Mensagem {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const mensagem = valor as Partial<Mensagem>;

  return (
    typeof mensagem.id === "string" &&
    (mensagem.autor === "usuario" || mensagem.autor === "ia") &&
    typeof mensagem.texto === "string"
  );
}

function conversaEhValida(valor: unknown): valor is Conversa {
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
    const conteudoSalvo = window.localStorage.getItem(
      CHAVE_HISTORICO,
    );

    if (!conteudoSalvo) {
      return [];
    }

    const dados: unknown = JSON.parse(conteudoSalvo);

    if (!Array.isArray(dados)) {
      return [];
    }

    return dados.filter(conversaEhValida);
  } catch {
    return [];
  }
}

export default function ChatIA() {
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [estadoChat, setEstadoChat] =
    useState<EstadoChat>(ESTADO_INICIAL);

  const {
    conversas,
    conversaAtivaId,
    historicoCarregado,
  } = estadoChat;

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      const conversasSalvas = carregarConversasSalvas();

      if (conversasSalvas.length > 0) {
        setEstadoChat({
          conversas: conversasSalvas,
          conversaAtivaId: conversasSalvas[0].id,
          historicoCarregado: true,
        });

        return;
      }

      const novaConversa = criarNovaConversa();

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
    if (!historicoCarregado || conversas.length === 0) {
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
        (conversa) => conversa.id === conversaAtivaId,
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

  function atualizarConversa(
    conversaId: string,
    atualizar: (conversa: Conversa) => Conversa,
  ): void {
    setEstadoChat((estadoAtual) => ({
      ...estadoAtual,
      conversas: estadoAtual.conversas.map((conversa) =>
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
    atualizarConversa(conversaId, (conversa) => ({
      ...conversa,
      titulo: titulo ?? conversa.titulo,
      atualizadaEm: new Date().toISOString(),
      mensagens: [...conversa.mensagens, mensagem],
    }));
  }

  function iniciarNovaConversa(): void {
    if (enviando) {
      return;
    }

    const novaConversa = criarNovaConversa();

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

  function selecionarConversa(conversaId: string): void {
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
    if (!perguntaAtual || enviando || !conversaAtiva) {
      return;
    }

    const conversaId = conversaAtiva.id;

    const mensagemUsuario: Mensagem = {
      id: criarId(),
      autor: "usuario",
      texto: perguntaAtual,
    };

    const titulo =
      conversaAtiva.titulo === "Nova conversa"
        ? criarTituloConversa(perguntaAtual)
        : conversaAtiva.titulo;

    adicionarMensagem(
      conversaId,
      mensagemUsuario,
      titulo,
    );

    setPergunta("");
    setEnviando(true);

    try {
      const respostaHttp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pergunta: perguntaAtual,
        }),
      });

      const dados = (await respostaHttp.json()) as RespostaChat;

      if (
        !respostaHttp.ok ||
        !dados.sucesso ||
        !dados.resultado
      ) {
        throw new Error(
          dados.mensagem ||
            "Não foi possível obter uma resposta do AutoStoreAI.",
        );
      }

      const mensagemIA: Mensagem = {
        id: criarId(),
        autor: "ia",
        texto: dados.resultado.resposta,
        fontes: dados.resultado.fontes,
      };

      adicionarMensagem(conversaId, mensagemIA);
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Não foi possível processar sua pergunta.";

      const mensagemIA: Mensagem = {
        id: criarId(),
        autor: "ia",
        texto: mensagemErro,
      };

      adicionarMensagem(conversaId, mensagemIA);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarPergunta(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    await processarPergunta(pergunta.trim());
  }

  async function usarSugestao(
    sugestao: string,
  ): Promise<void> {
    await processarPergunta(sugestao);
  }

  if (!historicoCarregado || !conversaAtiva) {
    return (
      <div className="flex min-h-130 items-center justify-center rounded-2xl bg-zinc-50">
        <p className="text-sm text-zinc-500">
          Carregando conversas...
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ChatSidebar
        conversas={conversasResumo}
        conversaAtivaId={conversaAtivaId}
        onNovaConversa={iniciarNovaConversa}
        onSelecionarConversa={selecionarConversa}
      />

      <section className="flex min-h-130 min-w-0 flex-col">
        <div className="mb-4">
          <p className="mb-3 text-sm font-semibold text-zinc-700">
            Sugestões de perguntas
          </p>

          <div className="flex flex-wrap gap-2">
            {SUGESTOES_PERGUNTAS.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                disabled={enviando}
                onClick={() => usarSugestao(sugestao)}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sugestao}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-zinc-50 p-5"
          aria-live="polite"
        >
          {conversaAtiva.mensagens.map((mensagem) => (
            <div
              key={mensagem.id}
              className={`flex ${
                mensagem.autor === "usuario"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-3/4 rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  mensagem.autor === "usuario"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-zinc-700 shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {mensagem.texto}
                </p>

                {mensagem.fontes &&
                  mensagem.fontes.length > 0 && (
                    <div className="mt-4 border-t border-zinc-200 pt-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Fontes consultadas
                      </p>

                      <div className="space-y-2">
                        {mensagem.fontes.map((fonte) => (
                          <div
                            key={fonte.id}
                            className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-zinc-800">
                                {fonte.arquivo}
                              </span>

                              <span>
                                Relevância:{" "}
                                {formatarSimilaridade(
                                  fonte.similaridade,
                                )}
                              </span>
                            </div>

                            <p className="mt-2 font-medium text-zinc-700">
                              Trecho {fonte.trecho}
                            </p>

                            <p className="mt-2 line-clamp-3">
                              {fonte.conteudo}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {enviando && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm">
                AutoStoreAI está analisando os documentos...
              </div>
            </div>
          )}
        </div>

        <form
          className="mt-5 flex gap-3"
          onSubmit={enviarPergunta}
        >
          <input
            className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-zinc-100"
            type="text"
            aria-label="Pergunta para o AutoStoreAI"
            placeholder="Pergunte sobre preços, consumo, cores, comparações..."
            value={pergunta}
            disabled={enviando}
            maxLength={1000}
            onChange={(event) =>
              setPergunta(event.target.value)
            }
          />

          <button
            className="rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={enviando || !pergunta.trim()}
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </section>
    </div>
  );
}
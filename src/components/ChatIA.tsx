"use client";

import { useState, type SubmitEvent } from "react";

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

const SUGESTOES_PERGUNTAS = [
  "Qual carro tem o menor preço inicial?",
  "Quais cores e qual o consumo do Corolla Cross?",
  "Compare o Onix e o HB20 para uso urbano.",
  "Qual SUV elétrico ou híbrido você recomenda?",
];

function criarId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function formatarSimilaridade(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}

export default function ChatIA() {
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "mensagem-inicial",
      autor: "ia",
      texto:
        "Olá! Sou o AutoStoreAI. Posso ajudar você a encontrar, comparar e conhecer melhor os veículos disponíveis no catálogo.",
    },
  ]);

  async function processarPergunta(perguntaAtual: string): Promise<void> {
    if (!perguntaAtual || enviando) {
      return;
    }

    const mensagemUsuario: Mensagem = {
      id: criarId(),
      autor: "usuario",
      texto: perguntaAtual,
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
          pergunta: perguntaAtual,
        }),
      });

      const dados = (await respostaHttp.json()) as RespostaChat;

      if (!respostaHttp.ok || !dados.sucesso || !dados.resultado) {
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

      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        mensagemIA,
      ]);
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

      setMensagens((mensagensAtuais) => [
        ...mensagensAtuais,
        mensagemIA,
      ]);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarPergunta(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const perguntaAtual = pergunta.trim();

    await processarPergunta(perguntaAtual);
  }

  async function usarSugestao(sugestao: string): Promise<void> {
    await processarPergunta(sugestao);
  }

  return (
    <section className="flex min-h-130 flex-col">
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
        className="flex-1 space-y-4 rounded-2xl bg-zinc-50 p-5"
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
          onChange={(event) => setPergunta(event.target.value)}
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
  );
}
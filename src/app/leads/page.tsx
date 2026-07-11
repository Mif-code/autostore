"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import Header from "@/components/Header";
import type { Lead } from "@/types/Lead";

interface RespostaApiLeads {
  readonly sucesso: boolean;
  readonly totalLeads?: number;
  readonly leads?: Lead[];
  readonly mensagem?: string;
}

interface EstadoLeads {
  readonly leads: Lead[];
  readonly carregando: boolean;
  readonly mensagemErro: string;
}

const ESTADO_INICIAL: EstadoLeads = {
  leads: [],
  carregando: true,
  mensagemErro: "",
};

function formatarData(dataIso: string): string {
  const data = new Date(dataIso);

  if (Number.isNaN(data.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function limparTelefoneParaLink(telefone: string): string {
  return telefone.replaceAll(/\D/g, "");
}

export default function LeadsPage() {
  const [estado, setEstado] =
    useState<EstadoLeads>(ESTADO_INICIAL);

  const { leads, carregando, mensagemErro } = estado;

  const carregarLeads = useCallback(
    async (mostrarCarregamento = true): Promise<void> => {
      if (mostrarCarregamento) {
        setEstado((estadoAtual) => ({
          ...estadoAtual,
          carregando: true,
          mensagemErro: "",
        }));
      }

      try {
        const respostaHttp = await fetch("/api/leads", {
          method: "GET",
          cache: "no-store",
        });

        const dados =
          (await respostaHttp.json()) as RespostaApiLeads;

        if (!respostaHttp.ok || !dados.sucesso) {
          throw new Error(
            dados.mensagem ??
              "Não foi possível carregar os interessados.",
          );
        }

        setEstado({
          leads: dados.leads ?? [],
          carregando: false,
          mensagemErro: "",
        });
      } catch (error) {
        const mensagem =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os interessados.";

        setEstado({
          leads: [],
          carregando: false,
          mensagemErro: mensagem,
        });
      }
    },
    [],
  );

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void carregarLeads(false);
    }, 0);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [carregarLeads]);

  function renderizarCarregamento(): ReactNode {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

        <p className="mt-5 font-semibold text-slate-700">
          Carregando interessados...
        </p>
      </section>
    );
  }

  function renderizarErro(): ReactNode {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6" />
            <path d="M12 17h.01" />
          </svg>
        </div>

        <h2 className="mt-5 text-xl font-bold text-red-900">
          Não foi possível carregar os leads
        </h2>

        <p className="mt-2 text-red-700">
          {mensagemErro}
        </p>

        <button
          type="button"
          onClick={() => void carregarLeads()}
          className="mt-6 rounded-xl bg-red-700 px-6 py-3 font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  function renderizarListaVazia(): ReactNode {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6" />
            <path d="M22 11h-6" />
          </svg>
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Nenhum interessado cadastrado
        </h2>

        <p className="mt-2 text-slate-600">
          Os novos contatos aparecerão aqui após o preenchimento
          do formulário.
        </p>
      </section>
    );
  }

  function renderizarListaLeads(): ReactNode {
    return (
      <section className="space-y-4">
        {leads.map((lead) => {
          const telefoneLink = limparTelefoneParaLink(
            lead.telefone,
          );

          return (
            <article
              key={lead.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {lead.nome}
                    </h2>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {lead.veiculoNome}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Cadastrado em {formatarData(lead.criadoEm)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />
                        <path d="m3 7 9 6 9-6" />
                      </svg>

                      Enviar e-mail
                    </a>
                  )}

                  {lead.telefone && (
                    <a
                      href={`tel:${telefoneLink}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
                      </svg>

                      Ligar
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    E-mail
                  </p>

                  <p className="mt-1 break-all font-medium text-slate-700">
                    {lead.email || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Telefone
                  </p>

                  <p className="mt-1 font-medium text-slate-700">
                    {lead.telefone || "Não informado"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Mensagem
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {lead.mensagem ||
                    "O interessado não deixou uma mensagem."}
                </p>
              </div>
            </article>
          );
        })}
      </section>
    );
  }

  function renderizarConteudo(): ReactNode {
    if (carregando) {
      return renderizarCarregamento();
    }

    if (mensagemErro) {
      return renderizarErro();
    }

    if (leads.length === 0) {
      return renderizarListaVazia();
    }

    return renderizarListaLeads();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <Header />

        <section className="py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Gestão de contatos
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Interessados nos veículos
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Consulte os contatos enviados pelo formulário
                &quot;Tenho interesse&quot;.
              </p>
            </div>

            <button
              type="button"
              disabled={carregando}
              onClick={() => void carregarLeads()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={`h-4 w-4 ${
                  carregando ? "animate-spin" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 11a8 8 0 1 0-2.34 5.66" />
                <path d="M20 4v7h-7" />
              </svg>

              {carregando
                ? "Atualizando..."
                : "Atualizar lista"}
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total de interessados
              </p>

              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {leads.length}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Com e-mail informado
              </p>

              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {
                  leads.filter(
                    (lead) => Boolean(lead.email),
                  ).length
                }
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Com telefone informado
              </p>

              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {
                  leads.filter(
                    (lead) => Boolean(lead.telefone),
                  ).length
                }
              </p>
            </article>
          </div>
        </section>

        {renderizarConteudo()}
      </div>
    </main>
  );
}
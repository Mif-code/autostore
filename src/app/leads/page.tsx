"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Header from "@/components/Header";
import type { Lead } from "@/types/Lead";

type StatusLead =
  | "novo"
  | "em-contato"
  | "qualificado"
  | "descartado";

type FiltroStatus = "todos" | StatusLead;

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

interface ConfiguracaoStatus {
  readonly nome: string;
  readonly classeBadge: string;
  readonly classePonto: string;
}

interface FiltroStatusConfig {
  readonly valor: FiltroStatus;
  readonly nome: string;
}

const ESTADO_INICIAL: EstadoLeads = {
  leads: [],
  carregando: true,
  mensagemErro: "",
};

const FILTROS_STATUS: FiltroStatusConfig[] = [
  {
    valor: "todos",
    nome: "Todos",
  },
  {
    valor: "novo",
    nome: "Novo",
  },
  {
    valor: "em-contato",
    nome: "Em contato",
  },
  {
    valor: "qualificado",
    nome: "Qualificado",
  },
  {
    valor: "descartado",
    nome: "Descartado",
  },
];

const CONFIGURACOES_STATUS: Record<
  StatusLead,
  ConfiguracaoStatus
> = {
  novo: {
    nome: "Novo",
    classeBadge:
      "border-slate-300 bg-slate-100 text-slate-700",
    classePonto: "bg-slate-500",
  },
  "em-contato": {
    nome: "Em contato",
    classeBadge:
      "border-amber-200 bg-amber-50 text-amber-700",
    classePonto: "bg-amber-500",
  },
  qualificado: {
    nome: "Qualificado",
    classeBadge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    classePonto: "bg-emerald-500",
  },
  descartado: {
    nome: "Descartado",
    classeBadge:
      "border-red-200 bg-red-50 text-red-700",
    classePonto: "bg-red-500",
  },
};

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replaceAll("\u0301", "")
    .replaceAll("\u0300", "")
    .replaceAll("\u0302", "")
    .replaceAll("\u0303", "")
    .replaceAll("\u0308", "")
    .replaceAll("\u0327", "")
    .toLowerCase()
    .trim();
}

function resumirTexto(
  texto: string,
  limite: number,
): string {
  const textoLimpo = texto.trim();

  if (!textoLimpo) {
    return "Sem mensagem.";
  }

  if (textoLimpo.length <= limite) {
    return textoLimpo;
  }

  return `${textoLimpo.slice(0, limite).trim()}...`;
}

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

function calcularTempoRecebido(
  dataIso: string,
): string {
  const data = new Date(dataIso);

  if (Number.isNaN(data.getTime())) {
    return "Data não informada";
  }

  const diferencaMilissegundos =
    Date.now() - data.getTime();

  if (diferencaMilissegundos < 0) {
    return formatarData(dataIso);
  }

  const minutos = Math.floor(
    diferencaMilissegundos / 60_000,
  );

  if (minutos < 1) {
    return "agora";
  }

  if (minutos < 60) {
    return `há ${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);

  if (horas < 24) {
    return `há ${horas} h`;
  }

  const dias = Math.floor(horas / 24);

  if (dias < 30) {
    return `há ${dias} d`;
  }

  return formatarData(dataIso);
}

function ordenarPorDataRecente(
  leadA: Lead,
  leadB: Lead,
): number {
  const dataA = new Date(leadA.criadoEm).getTime();
  const dataB = new Date(leadB.criadoEm).getTime();

  if (
    Number.isNaN(dataA) ||
    Number.isNaN(dataB)
  ) {
    return 0;
  }

  return dataB - dataA;
}

function limparTelefone(telefone: string): string {
  return telefone.replaceAll(/\D/g, "");
}

export default function LeadsPage() {
  const [estado, setEstado] =
    useState<EstadoLeads>(ESTADO_INICIAL);

  const [busca, setBusca] = useState("");

  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>("todos");

  const [statusPorLead, setStatusPorLead] =
    useState<Record<string, StatusLead>>({});

  const [leadExcluindoId, setLeadExcluindoId] =
    useState<string | null>(null);

  const { leads, carregando, mensagemErro } = estado;

  const carregarLeads = useCallback(
    async (
      mostrarCarregamento = true,
    ): Promise<void> => {
      if (mostrarCarregamento) {
        setEstado((estadoAtual) => ({
          ...estadoAtual,
          carregando: true,
          mensagemErro: "",
        }));
      }

      try {
        const respostaHttp = await fetch(
          "/api/leads",
          {
            method: "GET",
            cache: "no-store",
          },
        );

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

  const leadsOrdenados = useMemo(
    () =>
      [...leads].sort(ordenarPorDataRecente),
    [leads],
  );

  const contagemPorStatus = useMemo(() => {
    const contagens: Record<StatusLead, number> = {
      novo: 0,
      "em-contato": 0,
      qualificado: 0,
      descartado: 0,
    };

    leads.forEach((lead) => {
      const status =
        statusPorLead[lead.id] ?? "novo";

      contagens[status] += 1;
    });

    return contagens;
  }, [leads, statusPorLead]);

  const leadsExibidos = useMemo(() => {
    const textoBusca = normalizarTexto(busca);

    return leadsOrdenados.filter((lead) => {
      const status =
        statusPorLead[lead.id] ?? "novo";

      const correspondeStatus =
        filtroStatus === "todos" ||
        status === filtroStatus;

      const camposBusca = [
        lead.nome,
        lead.email,
        lead.telefone,
        lead.veiculoNome,
        lead.mensagem,
      ];

      const correspondeBusca =
        !textoBusca ||
        camposBusca.some((campo) =>
          normalizarTexto(campo ?? "").includes(
            textoBusca,
          ),
        );

      return correspondeStatus && correspondeBusca;
    });
  }, [
    busca,
    filtroStatus,
    leadsOrdenados,
    statusPorLead,
  ]);

  function alterarStatus(
    leadId: string,
    novoStatus: StatusLead,
  ): void {
    setStatusPorLead((statusAtual) => ({
      ...statusAtual,
      [leadId]: novoStatus,
    }));
  }

  function obterQuantidadeFiltro(
    filtro: FiltroStatus,
  ): number {
    if (filtro === "todos") {
      return leads.length;
    }

    return contagemPorStatus[filtro];
  }

  async function excluirLeadSelecionado(
    lead: Lead,
  ): Promise<void> {
    const confirmouExclusao = window.confirm(
      `Deseja realmente excluir o lead de ${lead.nome}? Essa ação não poderá ser desfeita.`,
    );

    if (!confirmouExclusao) {
      return;
    }

    setLeadExcluindoId(lead.id);

    try {
      const respostaHttp = await fetch(
        `/api/leads?id=${encodeURIComponent(lead.id)}`,
        {
          method: "DELETE",
        },
      );

      const dados =
        (await respostaHttp.json()) as RespostaApiLeads;

      if (!respostaHttp.ok || !dados.sucesso) {
        throw new Error(
          dados.mensagem ??
            "Não foi possível excluir o lead.",
        );
      }

      setEstado((estadoAtual) => ({
        ...estadoAtual,
        leads: estadoAtual.leads.filter(
          (leadAtual) => leadAtual.id !== lead.id,
        ),
      }));

      setStatusPorLead((statusAtual) => {
        const statusAtualizado = {
          ...statusAtual,
        };

        delete statusAtualizado[lead.id];

        return statusAtualizado;
      });
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o lead.";

      window.alert(mensagem);
    } finally {
      setLeadExcluindoId(null);
    }
  }

  function renderizarCarregamento(): ReactNode {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

        <p className="mt-5 font-semibold text-slate-600">
          Carregando leads...
        </p>
      </section>
    );
  }

  function renderizarErro(): ReactNode {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
        <h2 className="text-xl font-semibold text-red-800">
          Não foi possível carregar os leads
        </h2>

        <p className="mt-2 text-red-700">
          {mensagemErro}
        </p>

        <button
          type="button"
          onClick={() => void carregarLeads()}
          className="mt-6 rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
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

        <h2 className="mt-5 text-xl font-semibold text-slate-900">
          Nenhum lead encontrado
        </h2>

        <p className="mt-2 text-slate-500">
          Altere a busca ou o filtro selecionado.
        </p>
      </section>
    );
  }

  function renderizarTabela(): ReactNode {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nome
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Veículo
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mensagem
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recebido ↓
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {leadsExibidos.map((lead) => {
                const status =
                  statusPorLead[lead.id] ?? "novo";

                const configuracaoStatus =
                  CONFIGURACOES_STATUS[status];

                const telefoneLimpo =
                  limparTelefone(lead.telefone);

                const estaExcluindo =
                  leadExcluindoId === lead.id;

                return (
                  <tr
                    key={lead.id}
                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 align-middle">
                      <p className="font-semibold text-slate-900">
                        {lead.nome}
                      </p>

                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="mt-1 block max-w-56 truncate text-xs text-slate-500 transition hover:text-blue-600"
                        >
                          {lead.email}
                        </a>
                      )}

                      {lead.telefone && (
                        <a
                          href={`tel:${telefoneLimpo}`}
                          className="mt-1 block text-xs text-slate-400 transition hover:text-blue-600"
                        >
                          {lead.telefone}
                        </a>
                      )}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="max-w-48 truncate text-sm font-medium text-slate-700">
                        {lead.veiculoNome}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p
                        title={
                          lead.mensagem ||
                          "Sem mensagem."
                        }
                        className="max-w-80 truncate text-sm text-slate-500"
                      >
                        {resumirTexto(
                          lead.mensagem ?? "",
                          52,
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="relative inline-flex">
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${configuracaoStatus.classePonto}`}
                        />

                        <select
                          aria-label={`Alterar status de ${lead.nome}`}
                          value={status}
                          onChange={(event) =>
                            alterarStatus(
                              lead.id,
                              event.target
                                .value as StatusLead,
                            )
                          }
                          className={`appearance-none rounded-full border py-1.5 pl-7 pr-8 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-blue-500 ${configuracaoStatus.classeBadge}`}
                        >
                          <option value="novo">
                            Novo
                          </option>

                          <option value="em-contato">
                            Em contato
                          </option>

                          <option value="qualificado">
                            Qualificado
                          </option>

                          <option value="descartado">
                            Descartado
                          </option>
                        </select>

                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-current"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m7 10 5 5 5-5" />
                        </svg>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 align-middle text-sm text-slate-500">
                      <span
                        title={formatarData(
                          lead.criadoEm,
                        )}
                      >
                        {calcularTempoRecebido(
                          lead.criadoEm,
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center align-middle">
                      <button
                        type="button"
                        disabled={estaExcluindo}
                        onClick={() =>
                          void excluirLeadSelecionado(
                            lead,
                          )
                        }
                        aria-label={`Excluir lead de ${lead.nome}`}
                        title="Excluir lead"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {estaExcluindo ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                        ) : (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="m19 6-1 14H6L5 6" />
                            <path d="M10 11v5" />
                            <path d="M14 11v5" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

    if (leadsExibidos.length === 0) {
      return renderizarListaVazia();
    }

    return renderizarTabela();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <Header />

        <section className="py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Leads recebidos
                </h1>

                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                  {leads.length}
                </span>

                <span className="text-xs text-slate-400">
                  Painel interno da loja
                </span>
              </div>

              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Interesses enviados pela vitrine para
                consulta e atendimento da equipe.
              </p>
            </div>

            <button
              type="button"
              disabled={carregando}
              onClick={() => void carregarLeads()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                : "Atualizar"}
            </button>
          </div>

          <div className="mt-7 flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative w-full xl:max-w-sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <label
                htmlFor="busca-leads"
                className="sr-only"
              >
                Buscar leads
              </label>

              <input
                id="busca-leads"
                type="search"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Buscar por nome, e-mail ou veículo"
                className="h-11 w-full rounded-full border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {FILTROS_STATUS.map((filtro) => {
                const ativo =
                  filtroStatus === filtro.valor;

                return (
                  <button
                    key={filtro.valor}
                    type="button"
                    onClick={() =>
                      setFiltroStatus(filtro.valor)
                    }
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      ativo
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {filtro.nome} ·{" "}
                    {obterQuantidadeFiltro(
                      filtro.valor,
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {renderizarConteudo()}
      </div>
    </main>
  );
}
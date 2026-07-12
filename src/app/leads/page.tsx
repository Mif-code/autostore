"use client";

import Link from "next/link";
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

interface PainelDetalhesLeadProps {
  readonly lead: Lead;
  readonly status: StatusLead;
  readonly onFechar: () => void;
  readonly onAlterarStatus: (
    leadId: string,
    novoStatus: StatusLead,
  ) => void;
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

function obterIniciais(nome: string): string {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter((parte) => parte.length > 0);

  if (partes.length === 0) {
    return "LD";
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  const primeiraInicial = partes[0]?.[0] ?? "";
  const ultimaInicial = partes.at(-1)?.[0] ?? "";

  return `${primeiraInicial}${ultimaInicial}`.toUpperCase();
}

function PainelDetalhesLead({
  lead,
  status,
  onFechar,
  onAlterarStatus,
}: PainelDetalhesLeadProps) {
  const configuracaoStatus =
    CONFIGURACOES_STATUS[status];

  const telefoneLimpo =
    limparTelefone(lead.telefone);

  useEffect(() => {
    function fecharComEscape(
      event: globalThis.KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        onFechar();
      }
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      fecharComEscape,
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        fecharComEscape,
      );
    };
  }, [onFechar]);

  return (
    <dialog
      open
      aria-labelledby="titulo-detalhes-lead"
      className="fixed inset-0 z-100 m-0 flex h-screen w-screen max-w-none justify-end overflow-hidden bg-transparent p-0"
    >
      <button
        type="button"
        aria-label="Fechar informações do lead"
        onClick={onFechar}
        className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-[1px]"
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
              {obterIniciais(lead.nome)}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Lead
              </p>

              <h2
                id="titulo-detalhes-lead"
                className="truncate text-lg font-bold text-slate-900"
              >
                {lead.nome}
              </h2>

              <div
                className={`mt-2 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${configuracaoStatus.classeBadge}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${configuracaoStatus.classePonto}`}
                />

                {configuracaoStatus.nome}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar painel"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <section className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
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

                E-mail
              </div>

              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="mt-2 block break-all text-sm font-medium text-slate-800 transition hover:text-blue-600"
                >
                  {lead.email}
                </a>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  E-mail não informado.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z" />
                </svg>

                Telefone
              </div>

              {lead.telefone ? (
                <a
                  href={`tel:${telefoneLimpo}`}
                  className="mt-2 block text-sm font-medium text-slate-800 transition hover:text-blue-600"
                >
                  {lead.telefone}
                </a>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Telefone não informado.
                </p>
              )}
            </div>
          </section>

          <div className="my-6 border-t border-slate-200" />

          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 11h18" />
                <path d="m5 11 2-5h10l2 5" />
                <path d="M5 11v7" />
                <path d="M19 11v7" />
                <path d="M7 18h10" />
                <circle cx="7" cy="14" r="1" />
                <circle cx="17" cy="14" r="1" />
              </svg>

              Veículo de interesse
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-base font-bold text-slate-900">
                {lead.veiculoNome}
              </p>

              <Link
                href={`/carros/${lead.veiculoId}`}
                className="shrink-0 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Ver veículo
              </Link>
            </div>
          </section>

          <div className="my-6 border-t border-slate-200" />

          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
              </svg>

              Mensagem
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {lead.mensagem?.trim() ||
                  "O interessado não deixou uma mensagem."}
              </p>
            </div>
          </section>

          <div className="my-6 border-t border-slate-200" />

          <section>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>

              Recebido
            </div>

            <p className="mt-2 text-sm font-medium text-slate-800">
              {calcularTempoRecebido(
                lead.criadoEm,
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatarData(lead.criadoEm)}
            </p>
          </section>

          <div className="my-6 border-t border-slate-200" />

          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status do lead
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(
                Object.keys(
                  CONFIGURACOES_STATUS,
                ) as StatusLead[]
              ).map((statusDisponivel) => {
                const configuracao =
                  CONFIGURACOES_STATUS[
                    statusDisponivel
                  ];

                const ativo =
                  status === statusDisponivel;

                return (
                  <button
                    key={statusDisponivel}
                    type="button"
                    onClick={() =>
                      onAlterarStatus(
                        lead.id,
                        statusDisponivel,
                      )
                    }
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      ativo
                        ? configuracao.classeBadge
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${configuracao.classePonto}`}
                    />

                    {configuracao.nome}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onFechar}
            className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Fechar
          </button>
        </footer>
      </aside>
    </dialog>
  );
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

  const [leadSelecionadoId, setLeadSelecionadoId] =
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

  const leadSelecionado = useMemo(
    () =>
      leads.find(
        (lead) => lead.id === leadSelecionadoId,
      ) ?? null,
    [leads, leadSelecionadoId],
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

  function abrirDetalhesLead(leadId: string): void {
    setLeadSelecionadoId(leadId);
  }

  function fecharDetalhesLead(): void {
    setLeadSelecionadoId(null);
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

      if (leadSelecionadoId === lead.id) {
        fecharDetalhesLead();
      }
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

                const estaExcluindo =
                  leadExcluindoId === lead.id;

                return (
                  <tr
                    key={lead.id}
                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 align-middle">
                      <button
                        type="button"
                        onClick={() =>
                          abrirDetalhesLead(lead.id)
                        }
                        aria-label={`Abrir informações de ${lead.nome}`}
                        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <p className="font-semibold text-slate-900">
                          {lead.nome}
                        </p>

                        {lead.email && (
                          <span className="mt-1 block max-w-56 truncate text-xs text-slate-500">
                            {lead.email}
                          </span>
                        )}

                        {lead.telefone && (
                          <span className="mt-1 block text-xs text-slate-400">
                            {lead.telefone}
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <button
                        type="button"
                        onClick={() =>
                          abrirDetalhesLead(lead.id)
                        }
                        aria-label={`Abrir informações do veículo de ${lead.nome}`}
                        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <p className="max-w-48 truncate text-sm font-medium text-slate-700">
                          {lead.veiculoNome}
                        </p>
                      </button>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <button
                        type="button"
                        onClick={() =>
                          abrirDetalhesLead(lead.id)
                        }
                        aria-label={`Abrir mensagem de ${lead.nome}`}
                        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
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
                      </button>
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

      {leadSelecionado && (
        <PainelDetalhesLead
          lead={leadSelecionado}
          status={
            statusPorLead[leadSelecionado.id] ??
            "novo"
          }
          onFechar={fecharDetalhesLead}
          onAlterarStatus={alterarStatus}
        />
      )}
    </main>
  );
}
"use client";

import { useMemo, type ReactNode } from "react";

import type { Carro } from "@/types/Carro";

export type TipoCombustivel =
  | "Elétrico"
  | "Híbrido"
  | "Diesel"
  | "Flex"
  | "Gasolina";

interface FilterSidebarProps {
  readonly carros: Carro[];
  readonly montadorasSelecionadas: string[];
  readonly categoriasSelecionadas: string[];
  readonly combustiveisSelecionados: TipoCombustivel[];
  readonly precoMaximo: number;
  readonly onAlternarMontadora: (montadora: string) => void;
  readonly onAlternarCategoria: (categoria: string) => void;
  readonly onAlternarCombustivel: (
    combustivel: TipoCombustivel,
  ) => void;
  readonly onPrecoMaximoChange: (preco: number) => void;
  readonly onLimparFiltros: () => void;
}

interface OpcaoFiltro {
  readonly nome: string;
  readonly quantidade: number;
}

interface OpcaoCombustivel {
  readonly nome: TipoCombustivel;
  readonly quantidade: number;
}

interface GrupoFiltroProps {
  readonly titulo: string;
  readonly children: ReactNode;
}

interface OpcaoCheckboxProps {
  readonly id: string;
  readonly nome: string;
  readonly quantidade: number;
  readonly selecionado: boolean;
  readonly onAlternar: () => void;
}

const PRECO_MINIMO = 90_000;
export const PRECO_MAXIMO_CATALOGO = 300_000;
const PASSO_PRECO = 5_000;

const ORDEM_COMBUSTIVEIS: TipoCombustivel[] = [
  "Flex",
  "Gasolina",
  "Diesel",
  "Híbrido",
  "Elétrico",
];

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

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function identificarCombustivel(
  carro: Carro,
): TipoCombustivel {
  const textoMotor = normalizarTexto(carro.motor);

  if (textoMotor.includes("hibrid")) {
    return "Híbrido";
  }

  if (
    textoMotor.includes("eletric") ||
    textoMotor.includes("bateria")
  ) {
    return "Elétrico";
  }

  if (textoMotor.includes("diesel")) {
    return "Diesel";
  }

  if (textoMotor.includes("flex")) {
    return "Flex";
  }

  return "Gasolina";
}

function contarOpcoes(
  valores: string[],
): OpcaoFiltro[] {
  const contagem = new Map<string, number>();

  valores.forEach((valor) => {
    contagem.set(
      valor,
      (contagem.get(valor) ?? 0) + 1,
    );
  });

  return Array.from(contagem.entries())
    .map(([nome, quantidade]) => ({
      nome,
      quantidade,
    }))
    .sort((opcaoA, opcaoB) =>
      opcaoA.nome.localeCompare(
        opcaoB.nome,
        "pt-BR",
      ),
    );
}

function contarCombustiveis(
  carros: Carro[],
): OpcaoCombustivel[] {
  const contagem = new Map<TipoCombustivel, number>();

  carros.forEach((carro) => {
    const combustivel = identificarCombustivel(carro);

    contagem.set(
      combustivel,
      (contagem.get(combustivel) ?? 0) + 1,
    );
  });

  return ORDEM_COMBUSTIVEIS.filter((combustivel) =>
    contagem.has(combustivel),
  ).map((combustivel) => ({
    nome: combustivel,
    quantidade: contagem.get(combustivel) ?? 0,
  }));
}

function GrupoFiltro({
  titulo,
  children,
}: GrupoFiltroProps) {
  return (
    <section className="border-t border-slate-200 py-5 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-bold text-slate-900">
        {titulo}
      </h3>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </section>
  );
}

function OpcaoCheckbox({
  id,
  nome,
  quantidade,
  selecionado,
  onAlternar,
}: OpcaoCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
    >
      <span className="flex min-w-0 items-center gap-3">
        <input
          id={id}
          type="checkbox"
          checked={selecionado}
          onChange={onAlternar}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />

        <span className="truncate text-sm font-medium text-slate-700">
          {nome}
        </span>
      </span>

      <span className="shrink-0 text-sm text-slate-400">
        {quantidade}
      </span>
    </label>
  );
}

export default function FilterSidebar({
  carros,
  montadorasSelecionadas,
  categoriasSelecionadas,
  combustiveisSelecionados,
  precoMaximo,
  onAlternarMontadora,
  onAlternarCategoria,
  onAlternarCombustivel,
  onPrecoMaximoChange,
  onLimparFiltros,
}: FilterSidebarProps) {
  const montadoras = useMemo(
    () =>
      contarOpcoes(
        carros.map((carro) => carro.montadora),
      ),
    [carros],
  );

  const categorias = useMemo(
    () =>
      contarOpcoes(
        carros.map((carro) => carro.categoria),
      ),
    [carros],
  );

  const combustiveis = useMemo(
    () => contarCombustiveis(carros),
    [carros],
  );

  const existemFiltrosAtivos =
    montadorasSelecionadas.length > 0 ||
    categoriasSelecionadas.length > 0 ||
    combustiveisSelecionados.length > 0 ||
    precoMaximo < PRECO_MAXIMO_CATALOGO;

  return (
    <aside className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-900">
          Filtros
        </h2>

        <button
          type="button"
          disabled={!existemFiltrosAtivos}
          onClick={onLimparFiltros}
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          Limpar
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <GrupoFiltro titulo="Montadora">
          {montadoras.map((opcao) => (
            <OpcaoCheckbox
              key={opcao.nome}
              id={`filtro-montadora-${normalizarTexto(
                opcao.nome,
              )}`}
              nome={opcao.nome}
              quantidade={opcao.quantidade}
              selecionado={montadorasSelecionadas.includes(
                opcao.nome,
              )}
              onAlternar={() =>
                onAlternarMontadora(opcao.nome)
              }
            />
          ))}
        </GrupoFiltro>

        <GrupoFiltro titulo="Categoria">
          {categorias.map((opcao) => (
            <OpcaoCheckbox
              key={opcao.nome}
              id={`filtro-categoria-${normalizarTexto(
                opcao.nome,
              )}`}
              nome={opcao.nome}
              quantidade={opcao.quantidade}
              selecionado={categoriasSelecionadas.includes(
                opcao.nome,
              )}
              onAlternar={() =>
                onAlternarCategoria(opcao.nome)
              }
            />
          ))}
        </GrupoFiltro>

        <GrupoFiltro titulo="Combustível / energia">
          {combustiveis.map((opcao) => (
            <OpcaoCheckbox
              key={opcao.nome}
              id={`filtro-combustivel-${normalizarTexto(
                opcao.nome,
              )}`}
              nome={opcao.nome}
              quantidade={opcao.quantidade}
              selecionado={combustiveisSelecionados.includes(
                opcao.nome,
              )}
              onAlternar={() =>
                onAlternarCombustivel(opcao.nome)
              }
            />
          ))}
        </GrupoFiltro>

        <GrupoFiltro titulo="Preço">
          <div>
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="filtro-preco-maximo"
                className="text-sm font-semibold text-slate-700"
              >
                Preço até
              </label>

              <span className="text-sm font-bold text-slate-900">
                {formatarPreco(precoMaximo)}
              </span>
            </div>

            <input
              id="filtro-preco-maximo"
              type="range"
              min={PRECO_MINIMO}
              max={PRECO_MAXIMO_CATALOGO}
              step={PASSO_PRECO}
              value={precoMaximo}
              onChange={(event) =>
                onPrecoMaximoChange(
                  Number(event.target.value),
                )
              }
              className="mt-4 h-2 w-full cursor-pointer accent-blue-600"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>R$ 90 mil</span>
              <span>R$ 300 mil</span>
            </div>
          </div>
        </GrupoFiltro>
      </div>
    </aside>
  );
}
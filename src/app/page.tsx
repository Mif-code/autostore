"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import CarCard from "@/components/CarCard";
import FilterSidebar, {
  identificarCombustivel,
  PRECO_MAXIMO_CATALOGO,
  type TipoCombustivel,
} from "@/components/FilterSidebar";
import Header from "@/components/Header";

import carrosData from "@/data/carros_catalogo.json";
import type { Carro } from "@/types/Carro";

type TipoOrdenacao =
  | "relevancia"
  | "ano-mais-recente"
  | "menor-preco"
  | "mais-economico"
  | "maior-preco";

const carros = carrosData as Carro[];
const LIMITE_COMPARACAO = 3;

const larguraOrdenacao: Record<TipoOrdenacao, string> = {
  relevancia: "11rem",
  "ano-mais-recente": "13.5rem",
  "menor-preco": "11.5rem",
  "mais-economico": "12.8rem",
  "maior-preco": "11.5rem",
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

function obterTextoQuantidade(quantidade: number): string {
  if (quantidade === 1) {
    return "1 veículo encontrado";
  }

  return `${quantidade} veículos encontrados`;
}

function obterPontuacaoRelevancia(
  carro: Carro,
  textoBusca: string,
): number {
  if (!textoBusca) {
    return 0;
  }

  const montadora = normalizarTexto(carro.montadora);
  const modelo = normalizarTexto(carro.modelo);
  const categoria = normalizarTexto(carro.categoria);
  const motor = normalizarTexto(carro.motor);
  const cambio = normalizarTexto(carro.cambio);
  const potencia = normalizarTexto(carro.potencia_cv);

  let pontuacao = 0;

  if (modelo === textoBusca) {
    pontuacao += 100;
  } else if (modelo.startsWith(textoBusca)) {
    pontuacao += 80;
  } else if (modelo.includes(textoBusca)) {
    pontuacao += 60;
  }

  if (montadora === textoBusca) {
    pontuacao += 50;
  } else if (montadora.startsWith(textoBusca)) {
    pontuacao += 40;
  } else if (montadora.includes(textoBusca)) {
    pontuacao += 30;
  }

  if (categoria.includes(textoBusca)) {
    pontuacao += 20;
  }

  if (motor.includes(textoBusca)) {
    pontuacao += 15;
  }

  if (cambio.includes(textoBusca)) {
    pontuacao += 10;
  }

  if (potencia.includes(textoBusca)) {
    pontuacao += 5;
  }

  return pontuacao;
}

function obterPontuacaoEconomia(carro: Carro): number {
  const textoCompleto = normalizarTexto(
    `${carro.categoria} ${carro.motor} ${carro.consumo}`,
  );

  const valoresNumericos =
    carro.consumo
      .replaceAll(",", ".")
      .match(/\d+(?:\.\d+)?/g)
      ?.map(Number) ?? [];

  const maiorValor =
    valoresNumericos.length > 0
      ? Math.max(...valoresNumericos)
      : 0;

  if (textoCompleto.includes("eletrico")) {
    return 3000 + maiorValor;
  }

  if (textoCompleto.includes("hibrido")) {
    return 2000 + maiorValor;
  }

  return 1000 + maiorValor;
}

export default function Home() {
  const [busca, setBusca] = useState("");

  const [ordenacao, setOrdenacao] =
    useState<TipoOrdenacao>("relevancia");

  const [montadorasSelecionadas, setMontadorasSelecionadas] =
    useState<string[]>([]);

  const [categoriasSelecionadas, setCategoriasSelecionadas] =
    useState<string[]>([]);

  const [
    combustiveisSelecionados,
    setCombustiveisSelecionados,
  ] = useState<TipoCombustivel[]>([]);

  const [precoMaximo, setPrecoMaximo] = useState(
    PRECO_MAXIMO_CATALOGO,
  );

  const [carrosSelecionados, setCarrosSelecionados] =
    useState<number[]>([]);

  const carrosExibidos = useMemo(() => {
    const textoBusca = normalizarTexto(busca);

    const carrosFiltrados = carros.filter((carro) => {
      const correspondeBusca =
        !textoBusca ||
        [
          carro.montadora,
          carro.modelo,
          carro.categoria,
          carro.motor,
          carro.cambio,
          carro.potencia_cv,
        ].some((campo) =>
          normalizarTexto(campo).includes(textoBusca),
        );

      const correspondeMontadora =
        montadorasSelecionadas.length === 0 ||
        montadorasSelecionadas.includes(carro.montadora);

      const correspondeCategoria =
        categoriasSelecionadas.length === 0 ||
        categoriasSelecionadas.includes(carro.categoria);

      const combustivel = identificarCombustivel(carro);

      const correspondeCombustivel =
        combustiveisSelecionados.length === 0 ||
        combustiveisSelecionados.includes(combustivel);

      const correspondePreco =
        carro.preco_a_partir_rs <= precoMaximo;

      return (
        correspondeBusca &&
        correspondeMontadora &&
        correspondeCategoria &&
        correspondeCombustivel &&
        correspondePreco
      );
    });

    if (ordenacao === "ano-mais-recente") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          carroB.ano - carroA.ano ||
          carroA.id - carroB.id,
      );
    }

    if (ordenacao === "menor-preco") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          carroA.preco_a_partir_rs -
          carroB.preco_a_partir_rs,
      );
    }

    if (ordenacao === "mais-economico") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          obterPontuacaoEconomia(carroB) -
            obterPontuacaoEconomia(carroA) ||
          carroA.preco_a_partir_rs -
            carroB.preco_a_partir_rs,
      );
    }

    if (ordenacao === "maior-preco") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          carroB.preco_a_partir_rs -
          carroA.preco_a_partir_rs,
      );
    }

    return [...carrosFiltrados].sort(
      (carroA, carroB) =>
        obterPontuacaoRelevancia(carroB, textoBusca) -
          obterPontuacaoRelevancia(carroA, textoBusca) ||
        carros.findIndex((carro) => carro.id === carroA.id) -
          carros.findIndex((carro) => carro.id === carroB.id),
    );
  }, [
    busca,
    categoriasSelecionadas,
    combustiveisSelecionados,
    montadorasSelecionadas,
    ordenacao,
    precoMaximo,
  ]);

  const hrefComparacao =
    `/comparar?ids=${carrosSelecionados.join(",")}`;

  const existemFiltrosAtivos =
    montadorasSelecionadas.length > 0 ||
    categoriasSelecionadas.length > 0 ||
    combustiveisSelecionados.length > 0 ||
    precoMaximo < PRECO_MAXIMO_CATALOGO;

  function alternarMontadora(montadora: string): void {
    setMontadorasSelecionadas((montadorasAtuais) => {
      if (montadorasAtuais.includes(montadora)) {
        return montadorasAtuais.filter(
          (item) => item !== montadora,
        );
      }

      return [...montadorasAtuais, montadora];
    });
  }

  function alternarCategoria(categoria: string): void {
    setCategoriasSelecionadas((categoriasAtuais) => {
      if (categoriasAtuais.includes(categoria)) {
        return categoriasAtuais.filter(
          (item) => item !== categoria,
        );
      }

      return [...categoriasAtuais, categoria];
    });
  }

  function alternarCombustivel(
    combustivel: TipoCombustivel,
  ): void {
    setCombustiveisSelecionados((combustiveisAtuais) => {
      if (combustiveisAtuais.includes(combustivel)) {
        return combustiveisAtuais.filter(
          (item) => item !== combustivel,
        );
      }

      return [...combustiveisAtuais, combustivel];
    });
  }

  function limparFiltrosLaterais(): void {
    setMontadorasSelecionadas([]);
    setCategoriasSelecionadas([]);
    setCombustiveisSelecionados([]);
    setPrecoMaximo(PRECO_MAXIMO_CATALOGO);
  }

  function limparPesquisaCompleta(): void {
    setBusca("");
    setOrdenacao("relevancia");
    limparFiltrosLaterais();
  }

  function alternarComparacao(carroId: number): void {
    setCarrosSelecionados((selecionadosAtuais) => {
      const jaSelecionado =
        selecionadosAtuais.includes(carroId);

      if (jaSelecionado) {
        return selecionadosAtuais.filter(
          (idSelecionado) => idSelecionado !== carroId,
        );
      }

      if (selecionadosAtuais.length >= LIMITE_COMPARACAO) {
        return selecionadosAtuais;
      }

      return [...selecionadosAtuais, carroId];
    });
  }

  function limparComparacao(): void {
    setCarrosSelecionados([]);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <Header />

        <section className="pb-5 pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-160">
              <label
                htmlFor="busca-veiculos"
                className="sr-only"
              >
                Buscar veículos
              </label>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                id="busca-veiculos"
                type="search"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Buscar por modelo, montadora ou motor"
                className="h-14 w-full rounded-full border border-slate-300 bg-white pl-12 pr-5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div
              className="relative w-full shrink-0 transition-[width] duration-200 lg:w-auto"
              style={{
                width: larguraOrdenacao[ordenacao],
              }}
            >
              <label htmlFor="ordenacao" className="sr-only">
                Ordenar veículos
              </label>

              <select
                id="ordenacao"
                value={ordenacao}
                onChange={(event) =>
                  setOrdenacao(
                    event.target.value as TipoOrdenacao,
                  )
                }
                className="h-14 w-full appearance-none whitespace-nowrap rounded-full border border-slate-300 bg-white pl-6 pr-12 text-base font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="ano-mais-recente">
                  Ano mais recente
                </option>

                <option value="relevancia">
                  Relevância
                </option>

                <option value="menor-preco">
                  Menor preço
                </option>

                <option value="mais-economico">
                  Mais econômico
                </option>

                <option value="maior-preco">
                  Maior preço
                </option>
              </select>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 10 5 5 5-5" />
              </svg>
            </div>
          </div>

          {busca.trim() && (
            <p className="mt-3 text-xs text-slate-500">
              Resultados para &quot;{busca}&quot;
            </p>
          )}

          {carrosSelecionados.length > 0 && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-900">
                  {carrosSelecionados.length} de{" "}
                  {LIMITE_COMPARACAO} veículos selecionados
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Selecione de dois a três veículos para comparar.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={limparComparacao}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Limpar seleção
                </button>

                {carrosSelecionados.length >= 2 ? (
                  <Link
                    href={hrefComparacao}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    Comparar veículos
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-500"
                  >
                    Comparar veículos
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Catálogo
          </h1>

          <p className="text-sm text-slate-500 sm:text-base">
            {obterTextoQuantidade(carrosExibidos.length)}
          </p>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24">
            <FilterSidebar
              carros={carros}
              montadorasSelecionadas={montadorasSelecionadas}
              categoriasSelecionadas={categoriasSelecionadas}
              combustiveisSelecionados={combustiveisSelecionados}
              precoMaximo={precoMaximo}
              onAlternarMontadora={alternarMontadora}
              onAlternarCategoria={alternarCategoria}
              onAlternarCombustivel={alternarCombustivel}
              onPrecoMaximoChange={setPrecoMaximo}
              onLimparFiltros={limparFiltrosLaterais}
            />
          </div>

          <div className="min-w-0">
            {carrosExibidos.length > 0 ? (
              <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {carrosExibidos.map((carro) => {
                  const selecionado =
                    carrosSelecionados.includes(carro.id);

                  const comparacaoDesabilitada =
                    !selecionado &&
                    carrosSelecionados.length >=
                      LIMITE_COMPARACAO;

                  return (
                    <CarCard
                      key={carro.id}
                      carro={carro}
                      selecionado={selecionado}
                      comparacaoDesabilitada={
                        comparacaoDesabilitada
                      }
                      onAlternarComparacao={
                        alternarComparacao
                      }
                    />
                  );
                })}
              </section>
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  Nenhum veículo encontrado
                </h2>

                <p className="mt-2 text-slate-600">
                  Tente alterar a pesquisa ou selecionar outros filtros.
                </p>

                <button
                  type="button"
                  onClick={limparPesquisaCompleta}
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  Limpar pesquisa e filtros
                </button>
              </section>
            )}
          </div>
        </div>

        {existemFiltrosAtivos && (
          <div className="mt-6 text-center lg:hidden">
            <button
              type="button"
              onClick={limparFiltrosLaterais}
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
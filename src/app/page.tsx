"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CarCard from "@/components/CarCard";

import carrosData from "@/data/carros_catalogo.json";
import type { Carro } from "@/types/Carro";

type TipoOrdenacao = "relevancia" | "menor-preco" | "maior-preco";

const carros = carrosData as Carro[];
const LIMITE_COMPARACAO = 3;

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function Home() {
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] =
    useState<TipoOrdenacao>("relevancia");

  const [carrosSelecionados, setCarrosSelecionados] = useState<number[]>(
    [],
  );

  const carrosExibidos = useMemo(() => {
    const textoBusca = normalizarTexto(busca);

    const carrosFiltrados = carros.filter((carro) => {
      if (!textoBusca) {
        return true;
      }

      const camposPesquisaveis = [
        carro.montadora,
        carro.modelo,
        carro.categoria,
        carro.motor,
      ];

      return camposPesquisaveis.some((campo) =>
        normalizarTexto(campo).includes(textoBusca),
      );
    });

    if (ordenacao === "menor-preco") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          carroA.preco_a_partir_rs - carroB.preco_a_partir_rs,
      );
    }

    if (ordenacao === "maior-preco") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          carroB.preco_a_partir_rs - carroA.preco_a_partir_rs,
      );
    }

    return carrosFiltrados;
  }, [busca, ordenacao]);

  const hrefComparacao = `/comparar?ids=${carrosSelecionados.join(",")}`;

  function limparPesquisa(): void {
    setBusca("");
    setOrdenacao("relevancia");
  }

  function alternarComparacao(carroId: number): void {
    setCarrosSelecionados((selecionadosAtuais) => {
      const jaSelecionado = selecionadosAtuais.includes(carroId);

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

        <section className="py-7">
          <div className="mb-5">
            <p className="text-sm font-semibold text-blue-600">
              Catálogo de veículos
            </p>

            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Encontre o carro ideal para você
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Pesquise os veículos disponíveis, compare especificações e
              consulte o AutoStoreAI para receber recomendações.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_230px]">
            <SearchBar
              busca={busca}
              onBuscaChange={setBusca}
            />

            <div className="relative">
              <label
                htmlFor="ordenacao"
                className="sr-only"
              >
                Ordenar veículos
              </label>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 6h18" />
                <path d="M6 12h12" />
                <path d="M10 18h4" />
              </svg>

              <select
                id="ordenacao"
                className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-12 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={ordenacao}
                onChange={(event) =>
                  setOrdenacao(event.target.value as TipoOrdenacao)
                }
              >
                <option value="relevancia">Mais relevantes</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
              </select>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m7 10 5 5 5-5" />
              </svg>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {carrosExibidos.length}{" "}
                {carrosExibidos.length === 1
                  ? "veículo encontrado"
                  : "veículos encontrados"}
              </p>

              {busca.trim() !== "" && (
                <p className="mt-1 text-xs text-slate-500">
                  Resultados para &quot;{busca}&quot;
                </p>
              )}
            </div>

            <Link
              href="/chat/new"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Pedir ajuda ao AutoStoreAI

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </Link>
          </div>

          {carrosSelecionados.length > 0 && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-900">
                  {carrosSelecionados.length} de {LIMITE_COMPARACAO}{" "}
                  veículos selecionados
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

        {carrosExibidos.length > 0 ? (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {carrosExibidos.map((carro) => {
              const selecionado = carrosSelecionados.includes(carro.id);

              const comparacaoDesabilitada =
                !selecionado &&
                carrosSelecionados.length >= LIMITE_COMPARACAO;

              return (
                <CarCard
                  key={carro.id}
                  carro={carro}
                  selecionado={selecionado}
                  comparacaoDesabilitada={comparacaoDesabilitada}
                  onAlternarComparacao={alternarComparacao}
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
              Tente pesquisar por outra marca, modelo, categoria ou motor.
            </p>

            <button
              type="button"
              onClick={limparPesquisa}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Limpar pesquisa
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
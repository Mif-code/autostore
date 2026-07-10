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
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Header />

        <section className="my-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
            <div className="flex-1">
              <SearchBar
                busca={busca}
                onBuscaChange={setBusca}
              />
            </div>

            <Link
              href="/chat/new"
              className="flex min-h-17.5 items-center justify-center rounded-2xl bg-blue-600 px-8 font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 lg:min-w-56"
            >
              Conversar com VroomAI
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-zinc-900">
                {carrosExibidos.length}{" "}
                {carrosExibidos.length === 1
                  ? "veículo encontrado"
                  : "veículos encontrados"}
              </p>

              {busca.trim() !== "" && (
                <p className="mt-1 text-sm text-zinc-500">
                  Resultado da pesquisa por &quot;{busca}&quot;
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="ordenacao"
                className="text-sm font-medium text-zinc-700"
              >
                Ordenar por:
              </label>

              <select
                id="ordenacao"
                className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-900 outline-none transition focus:border-blue-600 focus:bg-white"
                value={ordenacao}
                onChange={(event) =>
                  setOrdenacao(event.target.value as TipoOrdenacao)
                }
              >
                <option value="relevancia">Relevância</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
              </select>
            </div>
          </div>

          {carrosSelecionados.length > 0 && (
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-zinc-900">
                  {carrosSelecionados.length} de {LIMITE_COMPARACAO}{" "}
                  veículos selecionados
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  Selecione pelo menos 2 veículos para comparar.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={limparComparacao}
                  className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
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
                    className="cursor-not-allowed rounded-xl bg-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-500"
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
          <section className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
              🔎
            </div>

            <h2 className="mt-5 text-xl font-bold text-zinc-900">
              Nenhum veículo encontrado
            </h2>

            <p className="mt-2 text-zinc-600">
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
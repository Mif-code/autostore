"use client";

import { Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Header from "@/components/Header";

import carrosData from "@/data/carros_catalogo.json";
import type { Carro } from "@/types/Carro";

const carros = carrosData as Carro[];

interface LinhaComparacaoProps {
  readonly titulo: string;
  readonly valores: string[];
}

function LinhaComparacao({
  titulo,
  valores,
}: LinhaComparacaoProps) {
  return (
    <div className="grid border-t border-zinc-200 lg:grid-cols-4">
      <div className="bg-zinc-50 p-4 font-semibold text-zinc-900">
        {titulo}
      </div>

      {valores.map((valor, indice) => (
        <div
          key={`${titulo}-${indice}`}
          className="border-t border-zinc-100 p-4 text-sm text-zinc-700 lg:border-l lg:border-t-0"
        >
          {valor}
        </div>
      ))}
    </div>
  );
}

function ConteudoComparacao() {
  const searchParams = useSearchParams();

  const carrosSelecionados = useMemo(() => {
    const idsRecebidos = searchParams.get("ids") ?? "";

    const ids = idsRecebidos
      .split(",")
      .map(Number)
      .filter((id) => Number.isInteger(id))
      .slice(0, 3);

    return ids
      .map((id) => carros.find((carro) => carro.id === id))
      .filter((carro): carro is Carro => carro !== undefined);
  }, [searchParams]);

  if (carrosSelecionados.length < 2) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">
          Selecione pelo menos dois veículos
        </h1>

        <p className="mt-3 text-zinc-600">
          Volte ao catálogo e escolha de dois a três carros para comparar.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  const quantidadeColunas =
    carrosSelecionados.length === 2
      ? "md:grid-cols-2"
      : "md:grid-cols-3";

  return (
    <>
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Comparação
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Compare os veículos
          </h1>

          <p className="mt-2 text-zinc-600">
            Analise os principais dados lado a lado antes de decidir.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
        >
          Alterar seleção
        </Link>
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className={`grid gap-4 p-5 ${quantidadeColunas}`}>
          {carrosSelecionados.map((carro) => (
            <article
              key={carro.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={`/${carro.imagem_arquivo}`}
                  alt={`${carro.montadora} ${carro.modelo}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-5">
                <p className="text-sm font-semibold text-blue-600">
                  {carro.montadora}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-zinc-900">
                  {carro.modelo}
                </h2>

                <p className="mt-3 text-xl font-bold text-zinc-900">
                  R$ {carro.preco_a_partir_rs.toLocaleString("pt-BR")}
                </p>

                <Link
                  href={`/carros/${carro.id}`}
                  className="mt-5 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                >
                  Ver detalhes
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-3xl">
            <LinhaComparacao
              titulo="Montadora"
              valores={carrosSelecionados.map(
                (carro) => carro.montadora,
              )}
            />

            <LinhaComparacao
              titulo="Modelo"
              valores={carrosSelecionados.map(
                (carro) => carro.modelo,
              )}
            />

            <LinhaComparacao
              titulo="Categoria"
              valores={carrosSelecionados.map(
                (carro) => carro.categoria,
              )}
            />

            <LinhaComparacao
              titulo="Ano"
              valores={carrosSelecionados.map((carro) =>
                String(carro.ano),
              )}
            />

            <LinhaComparacao
              titulo="Motor"
              valores={carrosSelecionados.map(
                (carro) => carro.motor,
              )}
            />

            <LinhaComparacao
              titulo="Potência"
              valores={carrosSelecionados.map(
                (carro) => carro.potencia_cv,
              )}
            />

            <LinhaComparacao
              titulo="Câmbio"
              valores={carrosSelecionados.map(
                (carro) => carro.cambio,
              )}
            />

            <LinhaComparacao
              titulo="Consumo"
              valores={carrosSelecionados.map(
                (carro) => carro.consumo,
              )}
            />

            <LinhaComparacao
              titulo="Preço inicial"
              valores={carrosSelecionados.map(
                (carro) =>
                  `R$ ${carro.preco_a_partir_rs.toLocaleString(
                    "pt-BR",
                  )}`,
              )}
            />

            <LinhaComparacao
              titulo="Cores"
              valores={carrosSelecionados.map(
                (carro) => carro.cores,
              )}
            />
          </div>
        </div>
      </section>
    </>
  );
}

export default function CompararPage() {
  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Header />

        <div className="mt-8">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
                <p className="text-zinc-600">
                  Carregando comparação...
                </p>
              </div>
            }
          >
            <ConteudoComparacao />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import LeadModal from "@/components/LeadModal";
import type { Carro } from "@/types/Carro";

interface CarDetailsProps {
  readonly carro: Carro;
  readonly semelhantes: Carro[];
}

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

function separarLista(valor: string): string[] {
  return valor
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

interface ItemFichaProps {
  readonly titulo: string;
  readonly valor: string;
}

function ItemFicha({
  titulo,
  valor,
}: ItemFichaProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {titulo}
      </p>

      <p className="mt-2 font-semibold leading-relaxed text-slate-800">
        {valor}
      </p>
    </div>
  );
}

export default function CarDetails({
  carro,
  semelhantes,
}: CarDetailsProps) {
  const [modalAberto, setModalAberto] = useState(false);

  const nomeCompleto = `${carro.montadora} ${carro.modelo}`;
  const cores = separarLista(carro.cores);
  const itens = separarLista(carro.itens);

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-80 w-full sm:h-105">
            <Image
              src={`/${carro.imagem_arquivo}`}
              alt={nomeCompleto}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>

          {carro.imagens.length > 1 && (
            <div className="grid grid-cols-3 gap-3 p-4">
              {carro.imagens.slice(0, 3).map((imagem) => (
                <div
                  key={imagem}
                  className="relative h-24 overflow-hidden rounded-xl border border-slate-200"
                >
                  <Image
                    src={`/${imagem}`}
                    alt={`${nomeCompleto} - imagem adicional`}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-blue-600">
            {carro.montadora}
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {carro.modelo}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {carro.categoria}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              Ano {carro.ano}
            </span>
          </div>

          <div className="mt-8 border-y border-slate-200 py-6">
            <p className="text-sm font-medium text-slate-500">
              A partir de
            </p>

            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {formatarPreco(carro.preco_a_partir_rs)}
            </p>

            {carro.preco_obs && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {carro.preco_obs}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Tenho interesse
            </button>

            <Link
              href={`/chat/new?carro=${carro.id}`}
              className="flex w-full items-center justify-center rounded-xl border border-blue-600 bg-white px-6 py-3.5 font-semibold text-blue-600 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Perguntar ao AutoStoreAI
            </Link>

            <Link
              href={`/comparar?ids=${carro.id}`}
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Adicionar à comparação
            </Link>
          </div>
        </aside>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Informações técnicas
          </p>

          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
            Ficha técnica
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ItemFicha
            titulo="Motor"
            valor={carro.motor}
          />

          <ItemFicha
            titulo="Potência"
            valor={carro.potencia_cv}
          />

          <ItemFicha
            titulo="Câmbio"
            valor={carro.cambio}
          />

          <ItemFicha
            titulo="Consumo"
            valor={carro.consumo}
          />

          <ItemFicha
            titulo="Categoria"
            valor={carro.categoria}
          />

          <ItemFicha
            titulo="Ano-modelo"
            valor={String(carro.ano)}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-blue-600">
            Personalização
          </p>

          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
            Cores disponíveis
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            {cores.map((cor) => (
              <span
                key={cor}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {cor}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-blue-600">
            Equipamentos
          </p>

          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
            Itens de série
          </h2>

          <ul className="mt-5 space-y-3">
            {itens.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm leading-relaxed text-slate-700"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  ✓
                </span>

                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-blue-600">
          Sobre o veículo
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
          Descrição
        </h2>

        <p className="mt-5 max-w-4xl leading-8 text-slate-700">
          {carro.desc}
        </p>
      </section>

      {semelhantes.length > 0 && (
        <section className="mt-8">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Outras opções
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Veículos semelhantes
            </h2>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {semelhantes.map((semelhante) => (
              <Link
                key={semelhante.id}
                href={`/carros/${semelhante.id}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-44">
                  <Image
                    src={`/${semelhante.imagem_arquivo}`}
                    alt={`${semelhante.montadora} ${semelhante.modelo}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="p-5">
                  <p className="text-sm font-semibold text-blue-600">
                    {semelhante.montadora}
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {semelhante.modelo}
                  </h3>

                  <p className="mt-3 font-bold text-slate-900">
                    {formatarPreco(
                      semelhante.preco_a_partir_rs,
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {modalAberto && (
        <LeadModal
          carro={carro}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </>
  );
}
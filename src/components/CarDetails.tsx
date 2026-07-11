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

interface ItemFichaProps {
  readonly titulo: string;
  readonly valor: string;
}

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatarParcela(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor / 60);
}

function separarLista(valor: string): string[] {
  return valor
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function identificarEnergia(carro: Carro): string {
  const motor = carro.motor.toLowerCase();

  if (motor.includes("híbrido") || motor.includes("hibrido")) {
    return "Híbrido";
  }

  if (
    motor.includes("elétrico") ||
    motor.includes("eletrico") ||
    motor.includes("bateria")
  ) {
    return "Elétrico";
  }

  if (motor.includes("diesel")) {
    return "Diesel";
  }

  if (motor.includes("flex")) {
    return "Flex";
  }

  return "Gasolina";
}

function obterClasseCor(cor: string): string {
  const nomeCor = cor.toLowerCase();

  if (nomeCor.includes("branco")) {
    return "border-slate-300 bg-white";
  }

  if (nomeCor.includes("prata")) {
    return "border-slate-400 bg-slate-300";
  }

  if (nomeCor.includes("cinza")) {
    return "border-slate-500 bg-slate-500";
  }

  if (nomeCor.includes("preto")) {
    return "border-slate-900 bg-slate-900";
  }

  if (nomeCor.includes("azul")) {
    return "border-blue-900 bg-blue-900";
  }

  if (nomeCor.includes("vermelho")) {
    return "border-red-700 bg-red-700";
  }

  if (nomeCor.includes("verde")) {
    return "border-emerald-700 bg-emerald-700";
  }

  return "border-slate-400 bg-slate-200";
}

function ItemFicha({
  titulo,
  valor,
}: ItemFichaProps) {
  return (
    <div className="border-b border-slate-200 pb-3">
      <p className="text-xs font-medium text-slate-500">
        {titulo}
      </p>

      <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">
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
  const energia = identificarEnergia(carro);

  return (
    <>
      <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(290px,1fr)]">
        <div className="space-y-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative mx-auto h-80 w-full overflow-hidden rounded-xl sm:h-115">
              <Image
                src={`/${carro.imagem_arquivo}`}
                alt={nomeCompleto}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Ficha técnica
            </h2>

            <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <ItemFicha
                titulo="Montadora"
                valor={carro.montadora}
              />

              <ItemFicha
                titulo="Modelo"
                valor={carro.modelo}
              />

              <ItemFicha
                titulo="Categoria"
                valor={carro.categoria}
              />

              <ItemFicha
                titulo="Ano"
                valor={String(carro.ano)}
              />

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
                titulo="Combustível / energia"
                valor={energia}
              />

              <ItemFicha
                titulo="Consumo"
                valor={carro.consumo}
              />
            </div>

            <p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-7 text-slate-600">
              {carro.desc}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Itens de série
            </h2>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {itens.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <span
                    aria-hidden="true"
                    className="font-bold text-emerald-600"
                  >
                    ✓
                  </span>

                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              {carro.montadora}
            </p>

            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
              {carro.modelo}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {carro.categoria}
              </span>

              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {energia}
              </span>

              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {carro.ano}
              </span>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">
                Preço a partir de
              </p>

              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                {formatarPreco(carro.preco_a_partir_rs)}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                ou 60x de{" "}
                {formatarParcela(carro.preco_a_partir_rs)}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => setModalAberto(true)}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                Tenho interesse
              </button>

              <Link
                href={`/chat/new?carro=${carro.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                <span aria-hidden="true">✦</span>{" "}
                Perguntar ao AutoStoreAI
              </Link>

              <Link
                href={`/comparar?ids=${carro.id}`}
                className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Adicionar à comparação
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Sem compromisso. A loja retorna em até 1 dia útil.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Cores disponíveis
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {cores.map((cor) => (
                <div
                  key={cor}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <span
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 rounded-full border ${obterClasseCor(
                      cor,
                    )}`}
                  />

                  <span className="text-sm font-medium text-slate-700">
                    {cor}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      {semelhantes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">
            Veículos comparáveis
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {semelhantes.map((semelhante) => (
              <Link
                key={semelhante.id}
                href={`/carros/${semelhante.id}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-48 bg-slate-100">
                  <Image
                    src={`/${semelhante.imagem_arquivo}`}
                    alt={`${semelhante.montadora} ${semelhante.modelo}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      {semelhante.modelo}
                    </h3>

                    <p className="shrink-0 font-bold text-slate-900">
                      {formatarPreco(
                        semelhante.preco_a_partir_rs,
                      )}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {semelhante.montadora} ·{" "}
                    {semelhante.consumo}
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
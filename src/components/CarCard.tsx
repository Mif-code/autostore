"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import LeadModal from "@/components/LeadModal";
import type { Carro } from "@/types/Carro";

interface CarCardProps {
  readonly carro: Carro;
  readonly selecionado: boolean;
  readonly comparacaoDesabilitada: boolean;
  readonly onAlternarComparacao: (carroId: number) => void;
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

  if (
    motor.includes("híbrido") ||
    motor.includes("hibrido")
  ) {
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

function resumirTexto(
  texto: string,
  limite: number,
): string {
  if (texto.length <= limite) {
    return texto;
  }

  return `${texto.slice(0, limite).trim()}...`;
}

export default function CarCard({
  carro,
  selecionado,
  comparacaoDesabilitada,
  onAlternarComparacao,
}: CarCardProps) {
  const [modalAberto, setModalAberto] = useState(false);

  const nomeCompleto = `${carro.montadora} ${carro.modelo}`;
  const energia = identificarEnergia(carro);
  const cores = separarLista(carro.cores);
  const coresVisiveis = cores.slice(0, 4);
  const quantidadeCoresRestantes = Math.max(
    cores.length - coresVisiveis.length,
    0,
  );

  function abrirModal(): void {
    setModalAberto(true);
  }

  function fecharModal(): void {
    setModalAberto(false);
  }

  return (
    <>
      <article
        className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
          selecionado
            ? "border-blue-600 ring-2 ring-blue-100"
            : "border-slate-200"
        }`}
      >
        <Link
          href={`/carros/${carro.id}`}
          aria-label={`Ver detalhes de ${nomeCompleto}`}
          className="group flex flex-1 cursor-pointer flex-col focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
        >
          <div className="relative h-64 w-full overflow-hidden bg-slate-100">
            <Image
              src={`/${carro.imagem_arquivo}`}
              alt={nomeCompleto}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {selecionado && (
              <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">
                Selecionado
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-slate-900 transition group-hover:text-blue-600">
                  {carro.modelo}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {carro.montadora}
                </p>
              </div>

              <span className="shrink-0 text-base font-medium text-slate-500">
                {carro.ano}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
                {carro.categoria}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  energia === "Elétrico" ||
                  energia === "Híbrido"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-700"
                }`}
              >
                {energia}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p className="truncate text-slate-500">
                Motor{" "}
                <strong className="text-slate-900">
                  {resumirTexto(carro.motor, 18)}
                </strong>
              </p>

              <p className="truncate text-slate-500">
                Potência{" "}
                <strong className="text-slate-900">
                  {resumirTexto(carro.potencia_cv, 14)}
                </strong>
              </p>

              <p className="truncate text-slate-500">
                Câmbio{" "}
                <strong className="text-slate-900">
                  {resumirTexto(carro.cambio, 14)}
                </strong>
              </p>

              <p className="truncate text-slate-500">
                Consumo{" "}
                <strong className="text-slate-900">
                  {resumirTexto(carro.consumo, 14)}
                </strong>
              </p>
            </div>

            <div className="mt-4 flex min-h-6 items-center gap-2">
              {coresVisiveis.map((cor) => (
                <span
                  key={cor}
                  title={cor}
                  aria-label={cor}
                  className={`h-5 w-5 rounded-full border ${obterClasseCor(
                    cor,
                  )}`}
                />
              ))}

              {quantidadeCoresRestantes > 0 && (
                <span className="text-xs font-medium text-slate-500">
                  +{quantidadeCoresRestantes}
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="mx-5 border-t border-slate-200" />

        <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-sm text-slate-500">
              Preço a partir de
            </p>

            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {formatarPreco(carro.preco_a_partir_rs)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              ou 60x de{" "}
              {formatarParcela(carro.preco_a_partir_rs)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              aria-pressed={selecionado}
              disabled={comparacaoDesabilitada}
              onClick={() =>
                onAlternarComparacao(carro.id)
              }
              className={`min-w-36 rounded-full border px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                selecionado
                  ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                  : "border-slate-300 bg-white text-slate-900 hover:border-blue-600 hover:text-blue-600"
              } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
            >
              {selecionado ? "Remover" : "Comparar"}
            </button>

            <button
              type="button"
              onClick={abrirModal}
              className="min-w-36 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Tenho interesse
            </button>
          </div>
        </div>
      </article>

      {modalAberto && (
        <LeadModal
          carro={carro}
          onFechar={fecharModal}
        />
      )}
    </>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useState,
  type MouseEvent,
} from "react";

import LeadModal from "@/components/LeadModal";
import type { Carro } from "@/types/Carro";

interface CarDetailsProps {
  readonly carro: Carro;
  readonly semelhantes: Carro[];
}

interface CampoFichaProps {
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
  const texto = `${carro.motor} ${carro.desc}`.toLowerCase();

  if (
    texto.includes("híbrido") ||
    texto.includes("hibrido")
  ) {
    return "Híbrido";
  }

  if (
    texto.includes("elétrico") ||
    texto.includes("eletrico") ||
    texto.includes("bateria")
  ) {
    return "Elétrico";
  }

  if (texto.includes("diesel")) {
    return "Diesel";
  }

  if (texto.includes("flex")) {
    return "Flex";
  }

  return "Gasolina";
}

function obterClasseEnergia(energia: string): string {
  if (
    energia === "Elétrico" ||
    energia === "Híbrido"
  ) {
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-300 bg-slate-50 text-slate-700";
}

function obterClasseCor(cor: string): string {
  const corNormalizada = cor.toLowerCase();

  if (corNormalizada.includes("branco")) {
    return "border-slate-300 bg-white";
  }

  if (corNormalizada.includes("prata")) {
    return "border-slate-400 bg-slate-300";
  }

  if (corNormalizada.includes("cinza")) {
    return "border-slate-500 bg-slate-500";
  }

  if (corNormalizada.includes("preto")) {
    return "border-slate-900 bg-slate-900";
  }

  if (corNormalizada.includes("azul")) {
    return "border-blue-900 bg-blue-900";
  }

  if (corNormalizada.includes("vermelho")) {
    return "border-red-700 bg-red-700";
  }

  if (corNormalizada.includes("verde")) {
    return "border-emerald-700 bg-emerald-700";
  }

  return "border-slate-400 bg-slate-200";
}

function CampoFicha({
  titulo,
  valor,
}: CampoFichaProps) {
  return (
    <div className="min-w-0 border-b border-slate-200 pb-3">
      <p className="text-[11px] text-slate-500">
        {titulo}
      </p>

      <p className="mt-1 text-sm font-semibold leading-snug text-slate-950">
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

  const [zoomAtivo, setZoomAtivo] = useState(false);

  const [posicaoZoom, setPosicaoZoom] = useState({
    x: 50,
    y: 50,
  });

  const nomeCompleto = `${carro.montadora} ${carro.modelo}`;
  const energia = identificarEnergia(carro);
  const cores = separarLista(carro.cores);
  const itens = separarLista(carro.itens);

  function abrirModal(): void {
    setModalAberto(true);
  }

  function fecharModal(): void {
    setModalAberto(false);
  }

  function ativarZoom(): void {
    setZoomAtivo(true);
  }

  function desativarZoom(): void {
    setZoomAtivo(false);

    setPosicaoZoom({
      x: 50,
      y: 50,
    });
  }

  function movimentarZoom(
    event: MouseEvent<HTMLDivElement>,
  ): void {
    const areaImagem =
      event.currentTarget.getBoundingClientRect();

    const posicaoX =
      ((event.clientX - areaImagem.left) /
        areaImagem.width) *
      100;

    const posicaoY =
      ((event.clientY - areaImagem.top) /
        areaImagem.height) *
      100;

    setPosicaoZoom({
      x: Math.min(100, Math.max(0, posicaoX)),
      y: Math.min(100, Math.max(0, posicaoY)),
    });
  }

  return (
    <>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_320px]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div
              onMouseEnter={ativarZoom}
              onMouseLeave={desativarZoom}
              onMouseMove={movimentarZoom}
              className="relative h-90 w-full cursor-zoom-in overflow-hidden bg-white sm:h-117.5"
            >
              <Image
                src={`/${carro.imagem_arquivo}`}
                alt={nomeCompleto}
                fill
                priority
                className="pointer-events-none object-contain"
                sizes="(max-width: 1024px) 100vw, 66vw"
                style={{
                  transform: zoomAtivo
                    ? "scale(2)"
                    : "scale(1)",
                  transformOrigin: `${posicaoZoom.x}% ${posicaoZoom.y}%`,
                  transition: zoomAtivo
                    ? "transform 120ms ease-out"
                    : "transform 220ms ease-out",
                }}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Ficha técnica
            </h2>

            <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <CampoFicha titulo="Montadora" valor={carro.montadora} />
              <CampoFicha titulo="Modelo" valor={carro.modelo} />
              <CampoFicha titulo="Categoria" valor={carro.categoria} />
              <CampoFicha titulo="Ano" valor={String(carro.ano)} />
              <CampoFicha titulo="Motor" valor={carro.motor} />
              <CampoFicha titulo="Potência" valor={carro.potencia_cv} />
              <CampoFicha titulo="Câmbio" valor={carro.cambio} />
              <CampoFicha titulo="Combustível / energia" valor={energia} />
              <CampoFicha titulo="Consumo" valor={carro.consumo} />
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              {carro.desc}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Itens de série
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {itens.map((item) => (
                <div
                  key={item}
                  className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-bold text-emerald-600"
                  >
                    ✓
                  </span>

                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">
              {carro.montadora}
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {carro.modelo}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                {carro.categoria}
              </span>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${obterClasseEnergia(
                  energia,
                )}`}
              >
                {energia}
              </span>

              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                {carro.ano}
              </span>
            </div>

            <div className="my-4 border-t border-slate-200" />

            <p className="text-xs text-slate-500">
              Preço a partir de
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-950">
              {formatarPreco(carro.preco_a_partir_rs)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              ou 60x de{" "}
              {formatarParcela(carro.preco_a_partir_rs)}
            </p>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={abrirModal}
                className="flex w-full items-center justify-center rounded-full bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2"
              >
                Tenho interesse
              </button>

              <Link
                href={`/chat/new?carro=${carro.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-200 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2"
              >
                <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src="/vroom-ai-icon.png"
                    alt=""
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </span>

                <span>Perguntar à VroomAI</span>
              </Link>

              <Link
                href={`/comparar?ids=${carro.id}`}
                className="flex w-full items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-800 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2"
              >
                Adicionar à comparação
              </Link>
            </div>

            <p className="mt-4 text-center text-[11px] text-slate-500">
              Sem compromisso. A loja retorna em até 1 dia útil.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Cores disponíveis
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {cores.map((cor) => (
                <div
                  key={cor}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-800"
                >
                  <span
                    aria-hidden="true"
                    className={`h-5 w-5 shrink-0 rounded-full border shadow-inner ${obterClasseCor(
                      cor,
                    )}`}
                  />

                  <span className="truncate">{cor}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {semelhantes.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-bold text-slate-950">
            Veículos comparáveis
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {semelhantes.slice(0, 3).map((semelhante) => (
              <Link
                key={semelhante.id}
                href={`/carros/${semelhante.id}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-44 bg-slate-100">
                  <Image
                    src={`/${semelhante.imagem_arquivo}`}
                    alt={`${semelhante.montadora} ${semelhante.modelo}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-950">
                        {semelhante.modelo}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {semelhante.montadora} ·{" "}
                        {semelhante.consumo}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-slate-950">
                      {formatarPreco(
                        semelhante.preco_a_partir_rs,
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {modalAberto && (
        <LeadModal
          carro={carro}
          onFechar={fecharModal}
        />
      )}
    </>
  );
}
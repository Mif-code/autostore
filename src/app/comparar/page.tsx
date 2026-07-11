"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Suspense,
  useMemo,
  type ReactNode,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Header from "@/components/Header";

import carrosData from "@/data/carros_catalogo.json";
import type { Carro } from "@/types/Carro";

const carros = carrosData as Carro[];
const LIMITE_COMPARACAO = 3;

const MODELOS_SUGERIDOS = [
  "Dolphin",
  "Seal",
  "Yuan Plus",
  "Montana",
];

interface ItemLinhaComparacao {
  readonly chave: string;
  readonly conteudo: ReactNode;
}

interface LinhaComparacaoProps {
  readonly titulo: string;
  readonly itens: ItemLinhaComparacao[];
}

interface SecaoComparacaoProps {
  readonly titulo: string;
  readonly children: ReactNode;
}

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
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

function extrairMaiorNumero(texto: string): number {
  const numerosEncontrados =
    texto.match(/\d+(?:[.,]\d+)?/g) ?? [];

  const numeros = numerosEncontrados
    .map((numero) =>
      Number(numero.replace(",", ".")),
    )
    .filter((numero) => Number.isFinite(numero));

  if (numeros.length === 0) {
    return 0;
  }

  return Math.max(...numeros);
}

function transformarItensEmTexto(itens: string): string {
  return itens
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join(" · ");
}

function SecaoComparacao({
  titulo,
  children,
}: SecaoComparacaoProps) {
  return (
    <section>
      <h2 className="px-4 pb-3 pt-6 text-lg font-bold text-slate-900">
        {titulo}
      </h2>

      <div className="overflow-hidden rounded-xl">
        {children}
      </div>
    </section>
  );
}

function LinhaComparacao({
  titulo,
  itens,
}: LinhaComparacaoProps) {
  return (
    <div
      className="grid border-b border-slate-100 last:border-b-0"
      style={{
        gridTemplateColumns: `150px repeat(${itens.length}, minmax(220px, 1fr))`,
      }}
    >
      <div className="bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
        {titulo}
      </div>

      {itens.map((item) => (
        <div
          key={`${titulo}-${item.chave}`}
          className="border-l border-slate-100 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900"
        >
          {item.conteudo}
        </div>
      ))}
    </div>
  );
}

function AnimacaoCarrinho() {
  return (
    <div
      className="relative mx-auto h-24 w-full max-w-sm overflow-hidden"
      aria-hidden="true"
    >
      <div className="carro-andando absolute bottom-4 left-0">
        <svg
          viewBox="0 0 230 90"
          className="h-24 w-56 scale-x-[-1]"
          fill="none"
        >
          <path
            d="M24 68H196"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M187 57H218"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M197 48H211"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M42 52 55 30c3-5 8-8 14-8h64c8 0 15 3 20 9l18 21 18 4c5 1 9 6 9 11v5H30v-8c0-6 5-11 12-12Z"
            fill="#DC1E35"
          />

          <path
            d="M69 29h29v23H55l12-20c1-2 2-3 2-3Z"
            fill="#1E293B"
          />

          <path
            d="M105 29h26c5 0 9 2 12 6l14 17h-52V29Z"
            fill="#1E293B"
          />

          <rect
            x="34"
            y="57"
            width="24"
            height="7"
            rx="3.5"
            fill="#F8FAFC"
          />

          <rect
            x="177"
            y="57"
            width="17"
            height="7"
            rx="3.5"
            fill="#F8FAFC"
          />

          <circle
            cx="72"
            cy="70"
            r="15"
            fill="#334155"
          />

          <circle
            cx="72"
            cy="70"
            r="7"
            fill="#CBD5E1"
          />

          <circle
            cx="162"
            cy="70"
            r="15"
            fill="#334155"
          />

          <circle
            cx="162"
            cy="70"
            r="7"
            fill="#CBD5E1"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes carro-andando {
          0% {
            transform: translateX(-230px);
            opacity: 0;
          }

          8% {
            opacity: 1;
          }

          90% {
            opacity: 1;
          }

          100% {
            transform: translateX(390px);
            opacity: 0;
          }
        }

        .carro-andando {
          animation: carro-andando 3.5s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .carro-andando {
            animation: none;
            left: 50%;
            transform: translateX(-50%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function ConteudoComparacao() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const carrosSelecionados = useMemo(() => {
    const idsRecebidos =
      searchParams.get("ids") ?? "";

    const ids = idsRecebidos
      .split(",")
      .map(Number)
      .filter((id) => Number.isInteger(id))
      .slice(0, LIMITE_COMPARACAO);

    return ids
      .map((id) =>
        carros.find((carro) => carro.id === id),
      )
      .filter(
        (carro): carro is Carro =>
          carro !== undefined,
      );
  }, [searchParams]);

  const carrosSugeridos = useMemo(
    () =>
      MODELOS_SUGERIDOS.map((modelo) =>
        carros.find(
          (carro) => carro.modelo === modelo,
        ),
      ).filter(
        (carro): carro is Carro =>
          carro !== undefined,
      ),
    [],
  );

  const menorPreco = useMemo(() => {
    if (carrosSelecionados.length === 0) {
      return 0;
    }

    return Math.min(
      ...carrosSelecionados.map(
        (carro) => carro.preco_a_partir_rs,
      ),
    );
  }, [carrosSelecionados]);

  const maiorPotencia = useMemo(() => {
    if (carrosSelecionados.length === 0) {
      return 0;
    }

    return Math.max(
      ...carrosSelecionados.map((carro) =>
        extrairMaiorNumero(carro.potencia_cv),
      ),
    );
  }, [carrosSelecionados]);

  const melhorConsumo = useMemo(() => {
    if (carrosSelecionados.length === 0) {
      return 0;
    }

    return Math.max(
      ...carrosSelecionados.map((carro) =>
        extrairMaiorNumero(carro.consumo),
      ),
    );
  }, [carrosSelecionados]);

  const alturaImagemSelecionada =
    carrosSelecionados.length === 1
      ? "h-72"
      : carrosSelecionados.length === 2
        ? "h-56"
        : "h-44";

  const tamanhosImagemSelecionada =
    carrosSelecionados.length === 1
      ? "(max-width: 1280px) 100vw, 1000px"
      : carrosSelecionados.length === 2
        ? "(max-width: 1280px) 50vw, 520px"
        : "(max-width: 1280px) 33vw, 360px";

  function adicionarVeiculo(carroId: number): void {
    const idsAtuais = carrosSelecionados.map(
      (carro) => carro.id,
    );

    if (
      idsAtuais.includes(carroId) ||
      idsAtuais.length >= LIMITE_COMPARACAO
    ) {
      return;
    }

    const idsAtualizados = [
      ...idsAtuais,
      carroId,
    ];

    router.replace(
      `/comparar?ids=${idsAtualizados.join(",")}`,
    );
  }

  function removerVeiculo(carroId: number): void {
    const idsAtualizados = carrosSelecionados
      .filter((carro) => carro.id !== carroId)
      .map((carro) => carro.id);

    if (idsAtualizados.length === 0) {
      router.replace("/comparar");
      return;
    }

    router.replace(
      `/comparar?ids=${idsAtualizados.join(",")}`,
    );
  }

  const itensPreco = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: (
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-base">
            {formatarPreco(
              carro.preco_a_partir_rs,
            )}
          </strong>

          {carro.preco_a_partir_rs ===
            menorPreco && (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
              menor preço
            </span>
          )}
        </div>
      ),
    }),
  );

  const itensCategoria = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: carro.categoria,
    }),
  );

  const itensAno = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: String(carro.ano),
    }),
  );

  const itensMotor = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: carro.motor,
    }),
  );

  const itensPotencia = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => {
      const potencia =
        extrairMaiorNumero(carro.potencia_cv);

      return {
        chave: String(carro.id),
        conteudo: (
          <div className="flex flex-wrap items-center gap-2">
            <span>{carro.potencia_cv}</span>

            {potencia === maiorPotencia && (
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                mais potente
              </span>
            )}
          </div>
        ),
      };
    },
  );

  const itensCambio = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: carro.cambio,
    }),
  );

  const itensEnergia = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: identificarEnergia(carro),
    }),
  );

  const itensConsumo = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => {
      const consumo =
        extrairMaiorNumero(carro.consumo);

      return {
        chave: String(carro.id),
        conteudo: (
          <div>
            <strong className="font-semibold">
              {carro.consumo}
            </strong>

            {consumo === melhorConsumo && (
              <div className="mt-2">
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  mais econômico
                </span>
              </div>
            )}
          </div>
        ),
      };
    },
  );

  const itensCores = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: carro.cores,
    }),
  );

  const itensPrincipais = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: transformarItensEmTexto(
        carro.itens,
      ),
    }),
  );

  const itensPerfil = carrosSelecionados.map(
    (carro): ItemLinhaComparacao => ({
      chave: String(carro.id),
      conteudo: carro.desc,
    }),
  );

  const tituloComparacao =
    carrosSelecionados.length > 0
      ? carrosSelecionados
          .map((carro) => carro.modelo)
          .join(" vs ")
      : "Comparação";

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {tituloComparacao}
          </h1>

          <p className="mt-1 text-base text-slate-500">
            {carrosSelecionados.length === 0
              ? "Selecione até 3 veículos para ver lado a lado."
              : `${carrosSelecionados.length} de ${LIMITE_COMPARACAO} veículos selecionados.`}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <span
            aria-hidden="true"
            className="text-xl font-normal"
          >
            +
          </span>

          Adicionar do catálogo
        </Link>
      </section>

      {carrosSelecionados.length === 0 ? (
        <section className="flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <h2 className="text-xl font-bold text-slate-950">
            Nenhum veículo selecionado
          </h2>

          <div className="mt-5 w-full">
            <AnimacaoCarrinho />
          </div>

          <p className="mt-5 text-base text-slate-500">
            Marque Comparar nos cards do catálogo, ou
            comece com uma sugestão.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {carrosSugeridos.map((carro) => (
              <button
                key={carro.id}
                type="button"
                onClick={() =>
                  adicionarVeiculo(carro.id)
                }
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                <span
                  aria-hidden="true"
                  className="text-lg"
                >
                  +
                </span>

                {carro.montadora} {carro.modelo}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-225">
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `150px repeat(${carrosSelecionados.length}, minmax(220px, 1fr))`,
                }}
              >
                <div />

                {carrosSelecionados.map((carro) => (
                  <article
                    key={carro.id}
                    className="min-w-0 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div
                      className={`relative w-full overflow-hidden rounded-lg bg-slate-100 ${alturaImagemSelecionada}`}
                    >
                      <Image
                        src={`/${carro.imagem_arquivo}`}
                        alt={`${carro.montadora} ${carro.modelo}`}
                        fill
                        priority={
                          carrosSelecionados.length === 1
                        }
                        className="object-cover object-center"
                        sizes={tamanhosImagemSelecionada}
                      />
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">
                          {carro.montadora}
                        </p>

                        <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
                          {carro.modelo}
                        </h2>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remover ${carro.modelo} da comparação`}
                        onClick={() =>
                          removerVeiculo(carro.id)
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 6l12 12" />
                          <path d="M18 6 6 18" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/carros/${carro.id}`}
                        className="flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-blue-500 hover:text-blue-600"
                      >
                        Detalhes
                      </Link>

                      <Link
                        href={`/chat/new?carro=${carro.id}`}
                        className="flex items-center justify-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src="/vroom-ai-icon.png"
                            alt=""
                            fill
                            sizes="16px"
                            className="object-contain"
                          />
                        </span>

                        VroomAI
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <SecaoComparacao titulo="Visão geral">
                <LinhaComparacao
                  titulo="Preço a partir de"
                  itens={itensPreco}
                />

                <LinhaComparacao
                  titulo="Categoria"
                  itens={itensCategoria}
                />

                <LinhaComparacao
                  titulo="Ano"
                  itens={itensAno}
                />
              </SecaoComparacao>

              <SecaoComparacao titulo="Mecânica e consumo">
                <LinhaComparacao
                  titulo="Motor"
                  itens={itensMotor}
                />

                <LinhaComparacao
                  titulo="Potência"
                  itens={itensPotencia}
                />

                <LinhaComparacao
                  titulo="Câmbio"
                  itens={itensCambio}
                />

                <LinhaComparacao
                  titulo="Combustível / energia"
                  itens={itensEnergia}
                />

                <LinhaComparacao
                  titulo="Consumo"
                  itens={itensConsumo}
                />
              </SecaoComparacao>

              <SecaoComparacao titulo="Cores e equipamentos">
                <LinhaComparacao
                  titulo="Cores disponíveis"
                  itens={itensCores}
                />

                <LinhaComparacao
                  titulo="Itens principais"
                  itens={itensPrincipais}
                />

                <LinhaComparacao
                  titulo="Perfil do comprador"
                  itens={itensPerfil}
                />
              </SecaoComparacao>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default function CompararPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <Header />

        <div className="mt-6">
          <Suspense
            fallback={
              <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-600">
                  Carregando comparação...
                </p>
              </section>
            }
          >
            <ConteudoComparacao />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface Marca {
  readonly nome: string;
  readonly imagem: string;
}

interface CarrosselMarcasProps {
  readonly montadorasSelecionadas: string[];
  readonly onAlternarMontadora: (
    montadora: string,
  ) => void;
}

const MARCAS: readonly Marca[] = [
  {
    nome: "Toyota",
    imagem: "/marcas/toyota.png",
  },
  {
    nome: "Volkswagen",
    imagem: "/marcas/volkswagen.png",
  },
  {
    nome: "Chevrolet",
    imagem: "/marcas/chevrolet.png",
  },
  {
    nome: "Hyundai",
    imagem: "/marcas/hyundai.png",
  },
  {
    nome: "BYD",
    imagem: "/marcas/byd.png",
  },
];

const MARCAS_REPETIDAS: readonly Marca[] = [
  ...MARCAS,
  ...MARCAS,
];

const INTERVALO_AUTOMATICO = 2600;
const DURACAO_TRANSICAO = 650;

function obterQuantidadeVisivel(
  largura: number,
): number {
  if (largura < 640) {
    return 2;
  }

  if (largura < 1024) {
    return 3;
  }

  return 5;
}

function IconeSetaEsquerda() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconeSetaDireita() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function CarrosselMarcas({
  montadorasSelecionadas,
  onAlternarMontadora,
}: CarrosselMarcasProps) {
  const viewportRef =
    useRef<HTMLDivElement>(null);

  const [indiceAtual, setIndiceAtual] =
    useState(0);

  const [larguraItem, setLarguraItem] =
    useState(0);

  const [
    transicaoAtivada,
    setTransicaoAtivada,
  ] = useState(true);

  const [carrosselPausado, setCarrosselPausado] =
    useState(false);

  const atualizarDimensoes =
    useCallback((): void => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const quantidadeVisivel =
        obterQuantidadeVisivel(
          viewport.clientWidth,
        );

      setLarguraItem(
        viewport.clientWidth /
          quantidadeVisivel,
      );
    }, []);

  useEffect(() => {
    atualizarDimensoes();

    window.addEventListener(
      "resize",
      atualizarDimensoes,
    );

    return () => {
      window.removeEventListener(
        "resize",
        atualizarDimensoes,
      );
    };
  }, [atualizarDimensoes]);

  const avancar =
    useCallback((): void => {
      setTransicaoAtivada(true);

      setIndiceAtual(
        (indiceAnterior) =>
          indiceAnterior + 1,
      );
    }, []);

  function voltar(): void {
    if (indiceAtual === 0) {
      setTransicaoAtivada(false);
      setIndiceAtual(MARCAS.length);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTransicaoAtivada(true);

          setIndiceAtual(
            MARCAS.length - 1,
          );
        });
      });

      return;
    }

    setTransicaoAtivada(true);

    setIndiceAtual(
      (indiceAnterior) =>
        indiceAnterior - 1,
    );
  }

  useEffect(() => {
    if (carrosselPausado) {
      return;
    }

    const temporizador =
      window.setInterval(
        avancar,
        INTERVALO_AUTOMATICO,
      );

    return () => {
      window.clearInterval(temporizador);
    };
  }, [
    avancar,
    carrosselPausado,
  ]);

  function tratarFimTransicao(): void {
    if (indiceAtual < MARCAS.length) {
      return;
    }

    setTransicaoAtivada(false);
    setIndiceAtual(0);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTransicaoAtivada(true);
      });
    });
  }

  function selecionarIndicador(
    indice: number,
  ): void {
    setTransicaoAtivada(true);
    setIndiceAtual(indice);
  }

  const indiceIndicador =
    indiceAtual % MARCAS.length;

  return (
    <section
      aria-label="Carrossel de montadoras"
      className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-neutral-950"
      onMouseEnter={() =>
        setCarrosselPausado(true)
      }
      onMouseLeave={() =>
        setCarrosselPausado(false)
      }
      onFocusCapture={() =>
        setCarrosselPausado(true)
      }
      onBlurCapture={() =>
        setCarrosselPausado(false)
      }
    >
      <div className="relative flex items-center py-2">
        <button
          type="button"
          onClick={voltar}
          aria-label="Mostrar marcas anteriores"
          className="absolute left-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-neutral-900/95 dark:text-slate-300"
        >
          <IconeSetaEsquerda />
        </button>

        <div
          ref={viewportRef}
          className="w-full overflow-hidden"
        >
          <div
            onTransitionEnd={
              tratarFimTransicao
            }
            className="flex"
            style={{
              transform: `translateX(-${
                indiceAtual * larguraItem
              }px)`,

              transition: transicaoAtivada
                ? `transform ${DURACAO_TRANSICAO}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : "none",
            }}
          >
            {MARCAS_REPETIDAS.map(
              (marca, indice) => {
                const selecionada =
                  montadorasSelecionadas.includes(
                    marca.nome,
                  );

                return (
                  <div
                    key={`${marca.nome}-${indice}`}
                    className="shrink-0 px-2"
                    style={{
                      width:
                        larguraItem > 0
                          ? `${larguraItem}px`
                          : "20%",
                    }}
                  >
                    <button
                      type="button"
                      aria-pressed={
                        selecionada
                      }
                      onClick={() =>
                        onAlternarMontadora(
                          marca.nome,
                        )
                      }
                      className={`group flex h-24 w-full items-center justify-center rounded-xl border px-3 py-2 transition duration-300 sm:h-28 ${
                        selecionada
                          ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100 dark:bg-blue-950/50 dark:ring-blue-900"
                          : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50 dark:bg-neutral-950 dark:hover:border-slate-700 dark:hover:bg-neutral-900"
                      }`}
                    >
                      <div className="relative h-16 w-full sm:h-20">
                        <Image
                          src={marca.imagem}
                          alt={`Logotipo ${marca.nome}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className={`object-contain transition duration-300 ${
                            selecionada
                              ? "scale-105"
                              : "grayscale group-hover:scale-105"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={avancar}
          aria-label="Mostrar próximas marcas"
          className="absolute right-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:bg-neutral-900/95 dark:text-slate-300"
        >
          <IconeSetaDireita />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 pb-2">
        {MARCAS.map((marca, indice) => (
          <button
            key={marca.nome}
            type="button"
            aria-label={`Ir para ${marca.nome}`}
            onClick={() =>
              selecionarIndicador(indice)
            }
            className={`h-1.5 rounded-full transition-all duration-300 ${
              indiceIndicador === indice
                ? "w-6 bg-blue-600"
                : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
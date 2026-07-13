"use client";

import Image from "next/image";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Header from "@/components/Header";
import type { Carro } from "@/types/Carro";

type FormularioCarro = Omit<Carro, "id" | "imagens"> & {
  imagensTexto: string;
};

interface RespostaCarros {
  readonly sucesso: boolean;
  readonly carros?: Carro[];
  readonly carro?: Carro;
  readonly mensagem?: string;
}

const FORMULARIO_VAZIO: FormularioCarro = {
  montadora: "",
  modelo: "",
  categoria: "",
  ano: new Date().getFullYear(),
  motor: "",
  potencia_cv: "",
  cambio: "",
  consumo: "",
  preco_a_partir_rs: 0,
  preco_obs: "",
  cores: "",
  itens: "",
  desc: "",
  imagem_arquivo: "images/",
  imagensTexto: "",
  foto_referencia: "",
};

const CAMPOS_TEXTO: ReadonlyArray<{
  readonly campo: keyof FormularioCarro;
  readonly label: string;
  readonly obrigatorio: boolean;
}> = [
  {
    campo: "montadora",
    label: "Montadora",
    obrigatorio: true,
  },
  {
    campo: "modelo",
    label: "Modelo",
    obrigatorio: true,
  },
  {
    campo: "categoria",
    label: "Categoria",
    obrigatorio: true,
  },
  {
    campo: "motor",
    label: "Motor",
    obrigatorio: true,
  },
  {
    campo: "potencia_cv",
    label: "Potência",
    obrigatorio: true,
  },
  {
    campo: "cambio",
    label: "Câmbio",
    obrigatorio: true,
  },
  {
    campo: "consumo",
    label: "Consumo / autonomia",
    obrigatorio: true,
  },
  {
    campo: "cores",
    label: "Cores (separadas por vírgula)",
    obrigatorio: true,
  },
  {
    campo: "imagem_arquivo",
    label: "Imagem principal em public",
    obrigatorio: true,
  },
  {
    campo: "preco_obs",
    label: "Observação do preço",
    obrigatorio: false,
  },
  {
    campo: "foto_referencia",
    label: "Referência da foto",
    obrigatorio: false,
  },
  {
    campo: "imagensTexto",
    label: "Imagens extras (separadas por vírgula)",
    obrigatorio: false,
  },
];

function criarFormularioVazio(): FormularioCarro {
  return {
    ...FORMULARIO_VAZIO,
    ano: new Date().getFullYear(),
  };
}

function carroParaFormulario(carro: Carro): FormularioCarro {
  return {
    montadora: carro.montadora,
    modelo: carro.modelo,
    categoria: carro.categoria,
    ano: carro.ano,
    motor: carro.motor,
    potencia_cv: carro.potencia_cv,
    cambio: carro.cambio,
    consumo: carro.consumo,
    preco_a_partir_rs: carro.preco_a_partir_rs,
    preco_obs: carro.preco_obs,
    cores: carro.cores,
    itens: carro.itens,
    desc: carro.desc,
    imagem_arquivo: carro.imagem_arquivo,
    imagensTexto: carro.imagens.join(", "),
    foto_referencia: carro.foto_referencia,
  };
}

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

function obterTextoBotaoSalvar(
  salvando: boolean,
  editando: boolean,
): string {
  if (salvando) {
    return "Salvando...";
  }

  if (editando) {
    return "Salvar alterações";
  }

  return "Cadastrar veículo";
}

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string,
): string {
  return error instanceof Error
    ? error.message
    : mensagemPadrao;
}

export default function AdminCarrosPage() {
  const [carros, setCarros] = useState<Carro[]>([]);

  const [busca, setBusca] = useState("");

  const [carregando, setCarregando] = useState(true);

  const [salvando, setSalvando] = useState(false);

  const [mensagem, setMensagem] = useState("");

  const [erro, setErro] = useState("");

  const [carroEditandoId, setCarroEditandoId] =
    useState<number | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioCarro>(() => criarFormularioVazio());

  const estaEditando = carroEditandoId !== null;

  const carregarCarros = useCallback(
    async (): Promise<void> => {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch("/api/carros", {
          cache: "no-store",
        });

        const dados =
          (await resposta.json()) as RespostaCarros;

        if (!resposta.ok || !dados.sucesso) {
          throw new Error(
            dados.mensagem ??
              "Não foi possível carregar os veículos.",
          );
        }

        setCarros(dados.carros ?? []);
      } catch (error) {
        setErro(
          obterMensagemErro(
            error,
            "Erro ao carregar veículos.",
          ),
        );
      } finally {
        setCarregando(false);
      }
    },
    [],
  );

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void carregarCarros();
    }, 0);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [carregarCarros]);

  const carrosFiltrados = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    if (!texto) {
      return carros;
    }

    return carros.filter((carro) =>
      [
        carro.montadora,
        carro.modelo,
        carro.categoria,
        carro.motor,
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto),
    );
  }, [busca, carros]);

  function atualizarCampo<K extends keyof FormularioCarro>(
    campo: K,
    valor: FormularioCarro[K],
  ): void {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }));
  }

  function iniciarCriacao(): void {
    setCarroEditandoId(null);

    setFormulario(criarFormularioVazio());

    setMensagem("");

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function iniciarEdicao(carro: Carro): void {
    setCarroEditandoId(carro.id);

    setFormulario(carroParaFormulario(carro));

    setMensagem("");

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function salvarCarro(
    event: React.SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setSalvando(true);
    setMensagem("");
    setErro("");

    const dadosEnvio = {
      montadora: formulario.montadora,
      modelo: formulario.modelo,
      categoria: formulario.categoria,
      ano: formulario.ano,
      motor: formulario.motor,
      potencia_cv: formulario.potencia_cv,
      cambio: formulario.cambio,
      consumo: formulario.consumo,
      preco_a_partir_rs: formulario.preco_a_partir_rs,
      preco_obs: formulario.preco_obs,
      cores: formulario.cores,
      itens: formulario.itens,
      desc: formulario.desc,
      imagem_arquivo: formulario.imagem_arquivo,

      imagens: formulario.imagensTexto
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),

      foto_referencia: formulario.foto_referencia,
    };

    const rota = estaEditando
      ? `/api/carros/${carroEditandoId}`
      : "/api/carros";

    const metodo = estaEditando ? "PUT" : "POST";

    try {
      const resposta = await fetch(rota, {
        method: metodo,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(dadosEnvio),
      });

      const dados =
        (await resposta.json()) as RespostaCarros;

      if (!resposta.ok || !dados.sucesso) {
        throw new Error(
          dados.mensagem ??
            "Não foi possível salvar o veículo.",
        );
      }

      setMensagem(
        dados.mensagem ??
          "Veículo salvo com sucesso.",
      );

      setCarroEditandoId(null);

      setFormulario(criarFormularioVazio());

      await carregarCarros();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Erro ao salvar veículo.",
        ),
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCarro(carro: Carro): Promise<void> {
    const confirmou = window.confirm(
      `Deseja remover ${carro.montadora} ${carro.modelo}? Essa ação não poderá ser desfeita.`,
    );

    if (!confirmou) {
      return;
    }

    setMensagem("");
    setErro("");

    try {
      const resposta = await fetch(`/api/carros/${carro.id}`, {
        method: "DELETE",
      });

      const dados =
        (await resposta.json()) as RespostaCarros;

      if (!resposta.ok || !dados.sucesso) {
        throw new Error(
          dados.mensagem ??
            "Não foi possível remover o veículo.",
        );
      }

      if (carroEditandoId === carro.id) {
        setCarroEditandoId(null);
        setFormulario(criarFormularioVazio());
      }

      setMensagem(
        dados.mensagem ??
          "Veículo removido com sucesso.",
      );

      await carregarCarros();
    } catch (error) {
      setErro(
        obterMensagemErro(
          error,
          "Erro ao remover veículo.",
        ),
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <Header />

        <section className="py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Painel administrativo
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                CRUD de veículos
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Cadastre, consulte, edite e remova veículos. As
                alterações são persistidas em{" "}
                <code className="mx-1 rounded bg-slate-200 px-1.5 py-0.5 text-xs">
                  data/carros/carros.json
                </code>{" "}
                e refletidas no catálogo e na página de detalhes.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Ver catálogo
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {estaEditando
                  ? "Editar veículo"
                  : "Cadastrar veículo"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Os campos com informações técnicas serão usados nas
                telas do catálogo.
              </p>
            </div>

            {estaEditando && (
              <button
                type="button"
                onClick={iniciarCriacao}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar edição
              </button>
            )}
          </div>

          <form
            onSubmit={salvarCarro}
            className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {CAMPOS_TEXTO.map(
              ({ campo, label, obrigatorio }) => (
                <label key={campo} className="block">
                  <span className="text-sm font-semibold text-slate-700">
                    {label}
                  </span>

                  <input
                    required={obrigatorio}
                    value={String(formulario[campo])}
                    onChange={(event) =>
                      atualizarCampo(
                        campo,
                        event.target
                          .value as FormularioCarro[typeof campo],
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              ),
            )}

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Ano
              </span>

              <input
                type="number"
                required
                min={1900}
                max={2100}
                value={formulario.ano}
                onChange={(event) =>
                  atualizarCampo(
                    "ano",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Preço a partir de
              </span>

              <input
                type="number"
                required
                min={1}
                step="0.01"
                value={formulario.preco_a_partir_rs || ""}
                onChange={(event) =>
                  atualizarCampo(
                    "preco_a_partir_rs",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block md:col-span-2 xl:col-span-3">
              <span className="text-sm font-semibold text-slate-700">
                Itens de série
              </span>

              <textarea
                required
                rows={3}
                value={formulario.itens}
                onChange={(event) =>
                  atualizarCampo("itens", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block md:col-span-2 xl:col-span-3">
              <span className="text-sm font-semibold text-slate-700">
                Descrição técnica
              </span>

              <textarea
                required
                rows={4}
                value={formulario.desc}
                onChange={(event) =>
                  atualizarCampo("desc", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center xl:col-span-3">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {obterTextoBotaoSalvar(
                  salvando,
                  estaEditando,
                )}
              </button>

              {Boolean(mensagem) && (
                <p className="text-sm font-semibold text-emerald-700">
                  {mensagem}
                </p>
              )}

              {Boolean(erro) && (
                <p className="text-sm font-semibold text-red-700">
                  {erro}
                </p>
              )}
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Veículos cadastrados
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {carros.length} veículos persistidos.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="search"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Buscar veículo"
                className="h-11 rounded-full border border-slate-300 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={iniciarCriacao}
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Novo
              </button>
            </div>
          </div>

          {carregando ? (
            <p className="p-8 text-center text-slate-500">
              Carregando veículos...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">
                      Veículo
                    </th>

                    <th className="px-5 py-4">
                      Categoria
                    </th>

                    <th className="px-5 py-4">
                      Ano
                    </th>

                    <th className="px-5 py-4">
                      Preço
                    </th>

                    <th className="px-5 py-4 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {carrosFiltrados.map((carro) => (
                    <tr
                      key={carro.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-slate-100">
                            <Image
                              src={`/${carro.imagem_arquivo}`}
                              alt={`${carro.montadora} ${carro.modelo}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">
                              {carro.modelo}
                            </p>

                            <p className="text-xs text-slate-500">
                              {carro.montadora} · ID {carro.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {carro.categoria}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {carro.ano}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatarPreco(
                          carro.preco_a_partir_rs,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/carros/${carro.id}`}
                            className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                          >
                            Ver
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              iniciarEdicao(carro)
                            }
                            className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void excluirCarro(carro)
                            }
                            className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
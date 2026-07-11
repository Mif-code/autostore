"use client";

import { useEffect, useState } from "react";

import type { Carro } from "@/types/Carro";

interface LeadModalProps {
  readonly carro: Carro;
  readonly onFechar: () => void;
  readonly onLeadCriado?: () => void;
}

interface FormularioLead {
  readonly nome: string;
  readonly email: string;
  readonly telefone: string;
  readonly mensagem: string;
}

interface RespostaCadastroLead {
  readonly sucesso: boolean;
  readonly mensagem: string;
}

const FORMULARIO_INICIAL: FormularioLead = {
  nome: "",
  email: "",
  telefone: "",
  mensagem: "",
};

export default function LeadModal({
  carro,
  onFechar,
  onLeadCriado,
}: LeadModalProps) {
  const [formulario, setFormulario] =
    useState<FormularioLead>(FORMULARIO_INICIAL);

  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [cadastroConcluido, setCadastroConcluido] =
    useState(false);

  const nomeVeiculo = `${carro.montadora} ${carro.modelo}`;

  useEffect(() => {
    function fecharComEscape(event: KeyboardEvent): void {
      if (event.key === "Escape" && !enviando) {
        onFechar();
      }
    }

    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", fecharComEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [enviando, onFechar]);

  function atualizarCampo(
    campo: keyof FormularioLead,
    valor: string,
  ): void {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }));

    if (mensagemErro) {
      setMensagemErro("");
    }
  }

  async function enviarFormulario(): Promise<void> {
    if (enviando) {
      return;
    }

    setEnviando(true);
    setMensagemErro("");

    try {
      const respostaHttp = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formulario.nome,
          email: formulario.email,
          telefone: formulario.telefone,
          veiculoId: carro.id,
          mensagem: formulario.mensagem,
        }),
      });

      const dados =
        (await respostaHttp.json()) as RespostaCadastroLead;

      if (!respostaHttp.ok || !dados.sucesso) {
        throw new Error(
          dados.mensagem ||
            "Não foi possível registrar seu interesse.",
        );
      }

      setCadastroConcluido(true);
      onLeadCriado?.();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Não foi possível registrar seu interesse.";

      setMensagemErro(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-100 bg-slate-950/60 backdrop-blur-sm"
      />

      <dialog
        open
        aria-labelledby="titulo-modal-interesse"
        className="fixed left-1/2 top-1/2 z-100 m-0 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Tenho interesse
            </p>

            <h2
              id="titulo-modal-interesse"
              className="mt-1 text-2xl font-bold text-slate-900"
            >
              {nomeVeiculo}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Preencha seus dados para que a equipe entre em contato.
            </p>
          </div>

          <button
            type="button"
            aria-label="Fechar formulário"
            disabled={enviando}
            onClick={onFechar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>

        {cadastroConcluido ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Interesse registrado!
            </h3>

            <p className="mt-2 text-slate-600">
              Seus dados foram salvos e a equipe poderá entrar em
              contato sobre o {nomeVeiculo}.
            </p>

            <button
              type="button"
              onClick={onFechar}
              className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form
            className="space-y-5 px-6 py-6"
            onSubmit={(event) => {
              event.preventDefault();
              void enviarFormulario();
            }}
          >
            <div>
              <label
                htmlFor="lead-nome"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nome completo
              </label>

              <input
                id="lead-nome"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                disabled={enviando}
                value={formulario.nome}
                onChange={(event) =>
                  atualizarCampo("nome", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder="Digite seu nome"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="lead-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  E-mail
                </label>

                <input
                  id="lead-email"
                  type="email"
                  maxLength={150}
                  autoComplete="email"
                  disabled={enviando}
                  value={formulario.email}
                  onChange={(event) =>
                    atualizarCampo("email", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-telefone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Telefone
                </label>

                <input
                  id="lead-telefone"
                  type="tel"
                  maxLength={30}
                  autoComplete="tel"
                  disabled={enviando}
                  value={formulario.telefone}
                  onChange={(event) =>
                    atualizarCampo(
                      "telefone",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  placeholder="(15) 99999-9999"
                />
              </div>
            </div>

            <p className="-mt-2 text-xs text-slate-500">
              Informe pelo menos um contato: e-mail ou telefone.
            </p>

            <div>
              <label
                htmlFor="lead-mensagem"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mensagem{" "}
                <span className="font-normal text-slate-400">
                  (opcional)
                </span>
              </label>

              <textarea
                id="lead-mensagem"
                rows={4}
                maxLength={500}
                disabled={enviando}
                value={formulario.mensagem}
                onChange={(event) =>
                  atualizarCampo(
                    "mensagem",
                    event.target.value,
                  )
                }
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                placeholder={`Gostaria de receber mais informações sobre o ${nomeVeiculo}.`}
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {formulario.mensagem.length}/500
              </p>
            </div>

            {mensagemErro && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {mensagemErro}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={enviando}
                onClick={onFechar}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={enviando}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enviando
                  ? "Enviando..."
                  : "Registrar interesse"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
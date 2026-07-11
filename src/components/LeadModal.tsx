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

function obterTextoBotao(
  enviando: boolean,
): string {
  if (enviando) {
    return "Enviando...";
  }

  return "Enviar interesse";
}

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
    function fecharComEscape(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape" && !enviando) {
        onFechar();
      }
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      fecharComEscape,
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      window.removeEventListener(
        "keydown",
        fecharComEscape,
      );
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
      const respostaHttp = await fetch(
        "/api/leads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: formulario.nome.trim(),
            email: formulario.email.trim(),
            telefone: formulario.telefone.trim(),
            veiculoId: carro.id,
            mensagem: formulario.mensagem.trim(),
          }),
        },
      );

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
        className="fixed left-1/2 top-1/2 z-100 m-0 max-h-[92vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        {cadastroConcluido ? (
          <div className="px-7 py-10 text-center">
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

            <h2
              id="titulo-modal-interesse"
              className="mt-5 text-2xl font-bold text-slate-900"
            >
              Interesse registrado!
            </h2>

            <p className="mt-3 leading-relaxed text-slate-600">
              Seus dados foram salvos e a equipe
              poderá entrar em contato sobre o{" "}
              {nomeVeiculo}.
            </p>

            <button
              type="button"
              onClick={onFechar}
              className="mt-7 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form
            className="px-6 py-6 sm:px-7"
            onSubmit={(event) => {
              event.preventDefault();
              void enviarFormulario();
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="titulo-modal-interesse"
                  className="text-2xl font-bold text-slate-900"
                >
                  Tenho interesse
                </h2>

                <p className="mt-1 text-base text-slate-500">
                  A loja entra em contato sobre o
                  veículo escolhido.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar formulário"
                disabled={enviando}
                onClick={onFechar}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="mt-5 space-y-3">
              <div>
                <label
                  htmlFor="lead-nome"
                  className="mb-1 block text-base font-medium text-slate-900"
                >
                  Nome{" "}
                  <span className="text-red-600">
                    *
                  </span>
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
                    atualizarCampo(
                      "nome",
                      event.target.value,
                    )
                  }
                  placeholder="Seu nome completo"
                  className="h-13 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-email"
                  className="mb-1 block text-base font-medium text-slate-900"
                >
                  E-mail{" "}
                  <span className="text-red-600">
                    *
                  </span>
                </label>

                <input
                  id="lead-email"
                  type="email"
                  required
                  maxLength={150}
                  autoComplete="email"
                  disabled={enviando}
                  value={formulario.email}
                  onChange={(event) =>
                    atualizarCampo(
                      "email",
                      event.target.value,
                    )
                  }
                  placeholder="voce@email.com"
                  className="h-13 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-telefone"
                  className="mb-1 block text-base font-medium text-slate-900"
                >
                  Telefone{" "}
                  <span className="text-red-600">
                    *
                  </span>
                </label>

                <input
                  id="lead-telefone"
                  type="tel"
                  required
                  minLength={8}
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
                  placeholder="(11) 99999-0000"
                  className="h-13 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-veiculo"
                  className="mb-1 block text-base font-medium text-slate-900"
                >
                  Veículo de interesse{" "}
                  <span className="text-red-600">
                    *
                  </span>
                </label>

                <select
                  id="lead-veiculo"
                  value={String(carro.id)}
                  disabled
                  className="h-14 w-full cursor-not-allowed rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none disabled:opacity-100"
                >
                  <option value={String(carro.id)}>
                    {nomeVeiculo} — {carro.ano} ·{" "}
                    {carro.categoria}
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="lead-mensagem"
                  className="mb-1 block text-base font-medium text-slate-900"
                >
                  Mensagem{" "}
                  <span className="font-normal text-slate-500">
                    (opcional)
                  </span>
                </label>

                <textarea
                  id="lead-mensagem"
                  rows={3}
                  maxLength={500}
                  disabled={enviando}
                  value={formulario.mensagem}
                  onChange={(event) =>
                    atualizarCampo(
                      "mensagem",
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: prefiro contato por WhatsApp à tarde."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>
            </div>

            {mensagemErro && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {mensagemErro}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {obterTextoBotao(enviando)}
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              Seus dados são usados apenas para este
              atendimento.
            </p>
          </form>
        )}
      </dialog>
    </>
  );
}
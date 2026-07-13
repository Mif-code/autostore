import { NextResponse } from "next/server";

import {
  atualizarCarro,
  obterCarroPorId,
  removerCarro,
  type AtualizarCarroInput,
} from "../../../../lib/carro-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ContextoRota {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

class ErroValidacaoCarro extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErroValidacaoCarro";
  }
}

const CAMPOS_TEXTO = [
  "montadora",
  "modelo",
  "categoria",
  "motor",
  "potencia_cv",
  "cambio",
  "consumo",
  "preco_obs",
  "cores",
  "itens",
  "desc",
  "imagem_arquivo",
  "foto_referencia",
] as const;

const CAMPOS_TEXTO_OPCIONAIS = new Set([
  "preco_obs",
  "foto_referencia",
]);

function obterMensagemErro(
  error: unknown,
  mensagemPadrao: string,
): string {
  return error instanceof Error
    ? error.message
    : mensagemPadrao;
}

function obterId(valor: string): number {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroValidacaoCarro(
      "ID de veículo inválido.",
    );
  }

  return id;
}

function limparCamposTexto(
  corpo: Record<string, unknown>,
  dados: AtualizarCarroInput,
): void {
  const dadosEditaveis = dados as Record<
    string,
    unknown
  >;

  for (const campo of CAMPOS_TEXTO) {
    const valorRecebido = corpo[campo];

    if (valorRecebido === undefined) {
      continue;
    }

    if (typeof valorRecebido !== "string") {
      throw new ErroValidacaoCarro(
        `O campo ${campo} deve ser texto.`,
      );
    }

    const valorLimpo = valorRecebido.trim();

    if (
      !valorLimpo &&
      !CAMPOS_TEXTO_OPCIONAIS.has(campo)
    ) {
      throw new ErroValidacaoCarro(
        `O campo ${campo} não pode ficar vazio.`,
      );
    }

    dadosEditaveis[campo] = valorLimpo;
  }
}

function limparAno(
  corpo: Record<string, unknown>,
  dados: AtualizarCarroInput,
): void {
  if (corpo.ano === undefined) {
    return;
  }

  if (
    typeof corpo.ano !== "number" ||
    !Number.isInteger(corpo.ano) ||
    corpo.ano < 1900 ||
    corpo.ano > 2100
  ) {
    throw new ErroValidacaoCarro(
      "Informe um ano válido.",
    );
  }

  dados.ano = corpo.ano;
}

function limparPreco(
  corpo: Record<string, unknown>,
  dados: AtualizarCarroInput,
): void {
  if (corpo.preco_a_partir_rs === undefined) {
    return;
  }

  if (
    typeof corpo.preco_a_partir_rs !== "number" ||
    !Number.isFinite(
      corpo.preco_a_partir_rs,
    ) ||
    corpo.preco_a_partir_rs <= 0
  ) {
    throw new ErroValidacaoCarro(
      "Informe um preço válido.",
    );
  }

  dados.preco_a_partir_rs =
    corpo.preco_a_partir_rs;
}

function limparImagens(
  corpo: Record<string, unknown>,
  dados: AtualizarCarroInput,
): void {
  if (corpo.imagens === undefined) {
    return;
  }

  if (
    !Array.isArray(corpo.imagens) ||
    !corpo.imagens.every(
      (item) => typeof item === "string",
    )
  ) {
    throw new ErroValidacaoCarro(
      "O campo imagens deve ser uma lista de textos.",
    );
  }

  dados.imagens = corpo.imagens
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function limparAtualizacao(
  corpo: Record<string, unknown>,
): AtualizarCarroInput {
  const dados: AtualizarCarroInput = {};

  limparCamposTexto(corpo, dados);
  limparAno(corpo, dados);
  limparPreco(corpo, dados);
  limparImagens(corpo, dados);

  if (Object.keys(dados).length === 0) {
    throw new ErroValidacaoCarro(
      "Informe pelo menos um campo para atualizar.",
    );
  }

  return dados;
}

export async function GET(
  _request: Request,
  contexto: ContextoRota,
) {
  try {
    const { id: valorId } =
      await contexto.params;

    const id = obterId(valorId);
    const carro = await obterCarroPorId(id);

    if (!carro) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Veículo não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      sucesso: true,
      carro,
    });
  } catch (error) {
    const status =
      error instanceof ErroValidacaoCarro
        ? 400
        : 500;

    return NextResponse.json(
      {
        sucesso: false,
        mensagem: obterMensagemErro(
          error,
          "Erro ao consultar carro.",
        ),
      },
      {
        status,
      },
    );
  }
}

export async function PUT(
  request: Request,
  contexto: ContextoRota,
) {
  try {
    const { id: valorId } =
      await contexto.params;

    const id = obterId(valorId);

    let corpo: Record<string, unknown>;

    try {
      corpo = (await request.json()) as Record<
        string,
        unknown
      >;
    } catch {
      throw new ErroValidacaoCarro(
        "O corpo da requisição deve conter um JSON válido.",
      );
    }

    const dadosAtualizacao =
      limparAtualizacao(corpo);

    const carro = await atualizarCarro(
      id,
      dadosAtualizacao,
    );

    if (!carro) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Veículo não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem:
        "Veículo atualizado com sucesso.",
      carro,
    });
  } catch (error) {
    const status =
      error instanceof ErroValidacaoCarro
        ? 400
        : 500;

    return NextResponse.json(
      {
        sucesso: false,
        mensagem: obterMensagemErro(
          error,
          "Erro ao atualizar carro.",
        ),
      },
      {
        status,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
  contexto: ContextoRota,
) {
  try {
    const { id: valorId } =
      await contexto.params;

    const id = obterId(valorId);
    const carro = await removerCarro(id);

    if (!carro) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Veículo não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem:
        "Veículo removido com sucesso.",
      carro,
    });
  } catch (error) {
    const status =
      error instanceof ErroValidacaoCarro
        ? 400
        : 500;

    return NextResponse.json(
      {
        sucesso: false,
        mensagem: obterMensagemErro(
          error,
          "Erro ao remover carro.",
        ),
      },
      {
        status,
      },
    );
  }
}
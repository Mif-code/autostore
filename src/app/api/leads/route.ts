import { NextResponse } from "next/server";

import carrosData from "@/data/carros_catalogo.json";
import {
  criarLead,
  excluirLead,
  listarLeads,
} from "@/lib/lead-store";
import type { Carro } from "@/types/Carro";
import type { CriarLeadInput } from "@/types/Lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CorpoCriarLead {
  readonly nome?: unknown;
  readonly email?: unknown;
  readonly telefone?: unknown;
  readonly veiculoId?: unknown;
  readonly mensagem?: unknown;
}

class ErroValidacaoLead extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErroValidacaoLead";
  }
}

const carros = carrosData as Carro[];

function obterMensagemDoErro(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocorreu um erro desconhecido ao processar o lead.";
}

function validarTextoObrigatorio(
  valor: unknown,
  nomeCampo: string,
  tamanhoMaximo: number,
): string {
  if (typeof valor !== "string" || !valor.trim()) {
    throw new ErroValidacaoLead(
      `O campo ${nomeCampo} é obrigatório.`,
    );
  }

  const texto = valor.trim();

  if (texto.length > tamanhoMaximo) {
    throw new ErroValidacaoLead(
      `O campo ${nomeCampo} deve possuir no máximo ${tamanhoMaximo} caracteres.`,
    );
  }

  return texto;
}

function validarTextoOpcional(
  valor: unknown,
  nomeCampo: string,
  tamanhoMaximo: number,
): string {
  if (valor === undefined || valor === null) {
    return "";
  }

  if (typeof valor !== "string") {
    throw new ErroValidacaoLead(
      `O campo ${nomeCampo} deve ser um texto válido.`,
    );
  }

  const texto = valor.trim();

  if (texto.length > tamanhoMaximo) {
    throw new ErroValidacaoLead(
      `O campo ${nomeCampo} deve possuir no máximo ${tamanhoMaximo} caracteres.`,
    );
  }

  return texto;
}

function validarEmail(email: string): void {
  if (!email) {
    return;
  }

  const partesEmail = email.split("@");

  if (partesEmail.length !== 2) {
    throw new ErroValidacaoLead(
      "Informe um endereço de e-mail válido.",
    );
  }

  const [usuario, dominio] = partesEmail;

  const emailValido =
    Boolean(usuario) &&
    Boolean(dominio) &&
    dominio.includes(".") &&
    !dominio.startsWith(".") &&
    !dominio.endsWith(".") &&
    !email.includes(" ");

  if (!emailValido) {
    throw new ErroValidacaoLead(
      "Informe um endereço de e-mail válido.",
    );
  }
}

function validarContato(
  email: string,
  telefone: string,
): void {
  if (!email && !telefone) {
    throw new ErroValidacaoLead(
      "Informe pelo menos um contato: e-mail ou telefone.",
    );
  }

  validarEmail(email);

  if (telefone && telefone.length < 8) {
    throw new ErroValidacaoLead(
      "Informe um telefone válido.",
    );
  }
}

function validarVeiculoId(valor: unknown): number {
  if (
    typeof valor !== "number" ||
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    throw new ErroValidacaoLead(
      "Selecione um veículo válido.",
    );
  }

  return valor;
}

function encontrarVeiculo(veiculoId: number): Carro {
  const veiculo = carros.find(
    (carro) => carro.id === veiculoId,
  );

  if (!veiculo) {
    throw new ErroValidacaoLead(
      "O veículo selecionado não foi encontrado no catálogo.",
    );
  }

  return veiculo;
}

function validarCorpoLead(
  corpo: CorpoCriarLead,
): CriarLeadInput {
  const nome = validarTextoObrigatorio(
    corpo.nome,
    "nome",
    100,
  );

  const email = validarTextoOpcional(
    corpo.email,
    "e-mail",
    150,
  ).toLowerCase();

  const telefone = validarTextoOpcional(
    corpo.telefone,
    "telefone",
    30,
  );

  const mensagem = validarTextoOpcional(
    corpo.mensagem,
    "mensagem",
    500,
  );

  validarContato(email, telefone);

  const veiculoId = validarVeiculoId(
    corpo.veiculoId,
  );

  const veiculo = encontrarVeiculo(veiculoId);

  return {
    nome,
    email,
    telefone,
    veiculoId: veiculo.id,
    veiculoNome: `${veiculo.montadora} ${veiculo.modelo}`,
    mensagem,
  };
}

export async function GET() {
  try {
    const leads = await listarLeads();

    return NextResponse.json({
      sucesso: true,
      totalLeads: leads.length,
      leads,
    });
  } catch (error) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: obterMensagemDoErro(error),
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    let corpo: CorpoCriarLead;

    try {
      corpo =
        (await request.json()) as CorpoCriarLead;
    } catch {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O corpo da requisição deve conter um JSON válido.",
        },
        {
          status: 400,
        },
      );
    }

    const dadosLead = validarCorpoLead(corpo);
    const lead = await criarLead(dadosLead);

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Interesse registrado com sucesso.",
        lead,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const status =
      error instanceof ErroValidacaoLead
        ? 400
        : 500;

    return NextResponse.json(
      {
        sucesso: false,
        mensagem: obterMensagemDoErro(error),
      },
      {
        status,
      },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const leadId = url.searchParams.get("id")?.trim();

    if (!leadId) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "Informe o identificador do lead que deseja excluir.",
        },
        {
          status: 400,
        },
      );
    }

    const leadExcluido = await excluirLead(leadId);

    if (!leadExcluido) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "O lead informado não foi encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Lead excluído com sucesso.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: obterMensagemDoErro(error),
      },
      {
        status: 500,
      },
    );
  }
}
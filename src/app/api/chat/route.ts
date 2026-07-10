import { NextResponse } from "next/server";

import { gerarRespostaAutoStoreAI } from "@/lib/autostore-ai";
import { chaveGeminiConfigurada } from "@/lib/embeddings";
import { indiceVetorialExiste } from "@/lib/vector-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CorpoRequisicaoChat {
  readonly pergunta?: unknown;
}

class ErroValidacaoChat extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErroValidacaoChat";
  }
}

function obterMensagemDoErro(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocorreu um erro desconhecido ao processar a pergunta.";
}

function validarPergunta(valor: unknown): string {
  if (typeof valor !== "string") {
    throw new ErroValidacaoChat(
      "Envie uma pergunta válida para o AutoStoreAI.",
    );
  }

  const pergunta = valor.trim();

  if (!pergunta) {
    throw new ErroValidacaoChat(
      "A pergunta não pode estar vazia.",
    );
  }

  if (pergunta.length > 1000) {
    throw new ErroValidacaoChat(
      "A pergunta deve possuir no máximo 1000 caracteres.",
    );
  }

  return pergunta;
}

function definirStatusDoErro(error: unknown): number {
  if (error instanceof ErroValidacaoChat) {
    return 400;
  }

  const mensagem = obterMensagemDoErro(error);

  if (mensagem.includes("GEMINI_API_KEY")) {
    return 503;
  }

  if (
    mensagem.includes("índice vetorial") ||
    mensagem.includes("indexação")
  ) {
    return 409;
  }

  return 500;
}

export async function GET() {
  try {
    const chaveConfigurada = chaveGeminiConfigurada();
    const indiceExiste = await indiceVetorialExiste();

    const chatDisponivel = chaveConfigurada && indiceExiste;

    return NextResponse.json({
      sucesso: true,
      chaveConfigurada,
      indiceExiste,
      chatDisponivel,
      mensagem: chatDisponivel
        ? "O AutoStoreAI está pronto para responder perguntas."
        : "O AutoStoreAI ficará disponível após configurar a chave e gerar o índice vetorial.",
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
    if (!chaveGeminiConfigurada()) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "A GEMINI_API_KEY ainda não está configurada.",
        },
        {
          status: 503,
        },
      );
    }

    const indiceExiste = await indiceVetorialExiste();

    if (!indiceExiste) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "O índice vetorial ainda não foi criado. Execute primeiro a indexação do RAG.",
        },
        {
          status: 409,
        },
      );
    }

    let corpo: CorpoRequisicaoChat;

    try {
      corpo = (await request.json()) as CorpoRequisicaoChat;
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

    const pergunta = validarPergunta(corpo.pergunta);

    const resultado = await gerarRespostaAutoStoreAI(pergunta);

    return NextResponse.json({
      sucesso: true,
      mensagem: "Pergunta processada corretamente.",
      resultado: {
        pergunta: resultado.pergunta,
        resposta: resultado.resposta,
        modelo: resultado.modelo,
        fontes: resultado.fontes.map((fonte) => ({
          id: fonte.id,
          arquivo: fonte.arquivo,
          trecho: fonte.trecho,
          similaridade: fonte.similaridade,
          conteudo: fonte.conteudo,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: obterMensagemDoErro(error),
      },
      {
        status: definirStatusDoErro(error),
      },
    );
  }
}
import { NextResponse } from "next/server";

import { realizarBuscaSemantica } from "@/lib/busca-semantica";
import { chaveGeminiConfigurada } from "@/lib/embeddings";
import { indiceVetorialExiste } from "@/lib/vector-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CorpoBuscaSemantica {
  readonly pergunta?: unknown;
  readonly quantidadeResultados?: unknown;
}

function obterMensagemDoErro(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocorreu um erro desconhecido durante a busca semântica.";
}

function validarPergunta(valor: unknown): string {
  if (typeof valor !== "string" || !valor.trim()) {
    throw new Error(
      "Envie uma pergunta válida para realizar a busca semântica.",
    );
  }

  return valor.trim();
}

function validarQuantidadeResultados(valor: unknown): number {
  if (valor === undefined) {
    return 4;
  }

  if (
    typeof valor !== "number" ||
    !Number.isInteger(valor) ||
    valor <= 0 ||
    valor > 10
  ) {
    throw new Error(
      "A quantidade de resultados deve ser um número inteiro entre 1 e 10.",
    );
  }

  return valor;
}

export async function GET() {
  try {
    const chaveConfigurada = chaveGeminiConfigurada();
    const indiceExiste = await indiceVetorialExiste();

    return NextResponse.json({
      sucesso: true,
      chaveConfigurada,
      indiceExiste,
      buscaDisponivel: chaveConfigurada && indiceExiste,
      mensagem:
        chaveConfigurada && indiceExiste
          ? "A busca semântica está pronta para uso."
          : "A busca semântica ficará disponível após configurar a chave e gerar o índice vetorial.",
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

    const corpo = (await request.json()) as CorpoBuscaSemantica;

    const pergunta = validarPergunta(corpo.pergunta);

    const quantidadeResultados = validarQuantidadeResultados(
      corpo.quantidadeResultados,
    );

    const resultado = await realizarBuscaSemantica(
      pergunta,
      quantidadeResultados,
    );

    return NextResponse.json({
      sucesso: true,
      mensagem:
        resultado.totalResultados > 0
          ? "Busca semântica realizada corretamente."
          : "Nenhum trecho relevante foi encontrado.",
      resultado: {
        pergunta: resultado.pergunta,
        totalResultados: resultado.totalResultados,
        contexto: resultado.contexto,
        fontes: resultado.fontes.map((fonte) => ({
          id: fonte.id,
          arquivo: fonte.fonte,
          trecho: fonte.indice + 1,
          similaridade: Number(fonte.similaridade.toFixed(4)),
          conteudo: fonte.conteudo,
        })),
      },
    });
  } catch (error) {
    const mensagem = obterMensagemDoErro(error);

    const status =
      mensagem.includes("pergunta") ||
      mensagem.includes("quantidade")
        ? 400
        : 500;

    return NextResponse.json(
      {
        sucesso: false,
        mensagem,
      },
      {
        status,
      },
    );
  }
}
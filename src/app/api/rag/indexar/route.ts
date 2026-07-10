import { NextResponse } from "next/server";

import {
  chaveGeminiConfigurada,
  gerarEmbeddingsDosChunks,
} from "@/lib/embeddings";
import { carregarChunksDoRag } from "@/lib/rag";
import {
  carregarIndiceVetorial,
  indiceVetorialExiste,
  salvarIndiceVetorial,
} from "@/lib/vector-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function obterMensagemDoErro(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocorreu um erro desconhecido durante a indexação.";
}

export async function GET() {
  try {
    const chaveConfigurada = chaveGeminiConfigurada();
    const indiceExiste = await indiceVetorialExiste();

    if (!indiceExiste) {
      return NextResponse.json({
        sucesso: true,
        chaveConfigurada,
        indiceExiste: false,
        totalChunks: 0,
        mensagem:
          "O índice vetorial ainda não foi criado. Use uma requisição POST após configurar a GEMINI_API_KEY.",
      });
    }

    const chunksVetorizados = await carregarIndiceVetorial();

    return NextResponse.json({
      sucesso: true,
      chaveConfigurada,
      indiceExiste: true,
      totalChunks: chunksVetorizados.length,
      dimensoesEmbedding:
        chunksVetorizados[0]?.embedding.length ?? 0,
      mensagem: "O índice vetorial está disponível.",
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

export async function POST() {
  try {
    if (!chaveGeminiConfigurada()) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "A GEMINI_API_KEY ainda não está configurada. Aguarde a chave ser disponibilizada e adicione-a ao arquivo .env.local.",
        },
        {
          status: 503,
        },
      );
    }

    const chunks = await carregarChunksDoRag();

    if (chunks.length === 0) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem:
            "Nenhum chunk foi encontrado para realizar a indexação.",
        },
        {
          status: 422,
        },
      );
    }

    const chunksVetorizados =
      await gerarEmbeddingsDosChunks(chunks);

    await salvarIndiceVetorial(chunksVetorizados);

    return NextResponse.json({
      sucesso: true,
      mensagem: "Índice vetorial criado e salvo corretamente.",
      totalChunks: chunksVetorizados.length,
      dimensoesEmbedding:
        chunksVetorizados[0]?.embedding.length ?? 0,
      fonte: chunksVetorizados[0]?.fonte ?? null,
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
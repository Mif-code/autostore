import { NextResponse } from "next/server";

import { carregarChunksDoRag } from "@/lib/rag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chunks = await carregarChunksDoRag();

    const amostras = chunks.slice(0, 3).map((chunk) => ({
      id: chunk.id,
      fonte: chunk.fonte,
      indice: chunk.indice,
      quantidadeCaracteres: chunk.conteudo.length,
      conteudo: chunk.conteudo.slice(0, 500),
    }));

    return NextResponse.json({
      sucesso: true,
      mensagem: "PDF técnico processado corretamente.",
      totalChunks: chunks.length,
      amostras,
    });
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao processar o PDF técnico.";

    return NextResponse.json(
      {
        sucesso: false,
        mensagem,
      },
      {
        status: 500,
      },
    );
  }
}
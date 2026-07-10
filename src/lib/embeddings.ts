import { GoogleGenAI } from "@google/genai";

import type { RagChunk } from "@/lib/rag";

const MODELO_EMBEDDING = "gemini-embedding-001";
const QUANTIDADE_PADRAO_RESULTADOS = 4;

export interface ChunkVetorizado extends RagChunk {
  readonly embedding: number[];
}

export interface ResultadoBuscaVetorial {
  readonly chunk: ChunkVetorizado;
  readonly similaridade: number;
}

function obterChaveGemini(): string {
  const chave = process.env.GEMINI_API_KEY?.trim();

  if (!chave) {
    throw new Error(
      "A variável GEMINI_API_KEY ainda não está configurada.",
    );
  }

  return chave;
}

function criarClienteGemini(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: obterChaveGemini(),
  });
}

function validarEmbedding(
  embedding: number[] | undefined,
  contexto: string,
): number[] {
  if (!embedding || embedding.length === 0) {
    throw new Error(
      `O Gemini não retornou um embedding válido para ${contexto}.`,
    );
  }

  return embedding;
}

export function chaveGeminiConfigurada(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function gerarEmbeddingsDosChunks(
  chunks: RagChunk[],
): Promise<ChunkVetorizado[]> {
  if (chunks.length === 0) {
    return [];
  }

  const cliente = criarClienteGemini();

  const resposta = await cliente.models.embedContent({
    model: MODELO_EMBEDDING,
    contents: chunks.map((chunk) => chunk.conteudo),
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
    },
  });

  const embeddings = resposta.embeddings ?? [];

  if (embeddings.length !== chunks.length) {
    throw new Error(
      "A quantidade de embeddings retornada não corresponde à quantidade de chunks enviados.",
    );
  }

  return chunks.map((chunk, indice) => ({
    ...chunk,
    embedding: validarEmbedding(
      embeddings[indice]?.values,
      `o chunk ${chunk.id}`,
    ),
  }));
}

export async function gerarEmbeddingDaPergunta(
  pergunta: string,
): Promise<number[]> {
  const perguntaLimpa = pergunta.trim();

  if (!perguntaLimpa) {
    throw new Error(
      "A pergunta não pode estar vazia para gerar o embedding.",
    );
  }

  const cliente = criarClienteGemini();

  const resposta = await cliente.models.embedContent({
    model: MODELO_EMBEDDING,
    contents: perguntaLimpa,
    config: {
      taskType: "RETRIEVAL_QUERY",
    },
  });

  const embeddings = resposta.embeddings ?? [];

  return validarEmbedding(
    embeddings[0]?.values,
    "a pergunta do usuário",
  );
}

export function calcularSimilaridadeCosseno(
  vetorA: number[],
  vetorB: number[],
): number {
  if (vetorA.length === 0 || vetorB.length === 0) {
    throw new Error(
      "Os vetores usados na similaridade não podem estar vazios.",
    );
  }

  if (vetorA.length !== vetorB.length) {
    throw new Error(
      "Os vetores usados na similaridade precisam ter o mesmo tamanho.",
    );
  }

  let produtoEscalar = 0;
  let normaA = 0;
  let normaB = 0;

  for (let indice = 0; indice < vetorA.length; indice += 1) {
    const valorA = vetorA[indice] ?? 0;
    const valorB = vetorB[indice] ?? 0;

    produtoEscalar += valorA * valorB;
    normaA += valorA * valorA;
    normaB += valorB * valorB;
  }

  const denominador = Math.sqrt(normaA) * Math.sqrt(normaB);

  if (denominador === 0) {
    return 0;
  }

  return produtoEscalar / denominador;
}

export function buscarChunksMaisRelevantes(
  embeddingPergunta: number[],
  chunksVetorizados: ChunkVetorizado[],
  quantidade = QUANTIDADE_PADRAO_RESULTADOS,
): ResultadoBuscaVetorial[] {
  if (quantidade <= 0) {
    throw new Error(
      "A quantidade de resultados deve ser maior que zero.",
    );
  }

  return chunksVetorizados
    .map((chunk) => ({
      chunk,
      similaridade: calcularSimilaridadeCosseno(
        embeddingPergunta,
        chunk.embedding,
      ),
    }))
    .sort(
      (resultadoA, resultadoB) =>
        resultadoB.similaridade - resultadoA.similaridade,
    )
    .slice(0, quantidade);
}
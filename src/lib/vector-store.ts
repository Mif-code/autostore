import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ChunkVetorizado } from "@/lib/embeddings";

const PASTA_RAG = path.join(process.cwd(), "data", "rag");

const CAMINHO_INDICE = path.join(
  PASTA_RAG,
  "indice-vetorial.json",
);

interface ArquivoIndiceVetorial {
  readonly versao: number;
  readonly modelo: string;
  readonly criadoEm: string;
  readonly totalChunks: number;
  readonly chunks: ChunkVetorizado[];
}

const VERSAO_INDICE = 1;
const MODELO_EMBEDDING = "gemini-embedding-001";

function validarChunkVetorizado(
  valor: unknown,
): valor is ChunkVetorizado {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const chunk = valor as Partial<ChunkVetorizado>;

  return (
    typeof chunk.id === "string" &&
    typeof chunk.fonte === "string" &&
    typeof chunk.indice === "number" &&
    typeof chunk.conteudo === "string" &&
    Array.isArray(chunk.embedding) &&
    chunk.embedding.length > 0 &&
    chunk.embedding.every(
      (numero) => typeof numero === "number",
    )
  );
}

function validarArquivoIndice(
  valor: unknown,
): valor is ArquivoIndiceVetorial {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const arquivo = valor as Partial<ArquivoIndiceVetorial>;

  return (
    arquivo.versao === VERSAO_INDICE &&
    typeof arquivo.modelo === "string" &&
    typeof arquivo.criadoEm === "string" &&
    typeof arquivo.totalChunks === "number" &&
    Array.isArray(arquivo.chunks) &&
    arquivo.chunks.length === arquivo.totalChunks &&
    arquivo.chunks.every(validarChunkVetorizado)
  );
}

export async function salvarIndiceVetorial(
  chunks: ChunkVetorizado[],
): Promise<void> {
  if (chunks.length === 0) {
    throw new Error(
      "Não é possível salvar um índice vetorial sem chunks.",
    );
  }

  await mkdir(PASTA_RAG, {
    recursive: true,
  });

  const arquivo: ArquivoIndiceVetorial = {
    versao: VERSAO_INDICE,
    modelo: MODELO_EMBEDDING,
    criadoEm: new Date().toISOString(),
    totalChunks: chunks.length,
    chunks,
  };

  await writeFile(
    CAMINHO_INDICE,
    JSON.stringify(arquivo, null, 2),
    "utf8",
  );
}

export async function carregarIndiceVetorial(): Promise<
  ChunkVetorizado[]
> {
  try {
    const conteudoArquivo = await readFile(
      CAMINHO_INDICE,
      "utf8",
    );

    const dados: unknown = JSON.parse(conteudoArquivo);

    if (!validarArquivoIndice(dados)) {
      throw new Error(
        "O arquivo do índice vetorial possui uma estrutura inválida.",
      );
    }

    return dados.chunks;
  } catch (error) {
    const codigoErro =
      error &&
      typeof error === "object" &&
      "code" in error
        ? String(error.code)
        : "";

    if (codigoErro === "ENOENT") {
      throw new Error(
        "O índice vetorial ainda não foi criado. Execute a indexação do RAG primeiro.",
      );
    }

    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao carregar o índice.";

    throw new Error(
      `Não foi possível carregar o índice vetorial: ${mensagem}`,
    );
  }
}

export async function indiceVetorialExiste(): Promise<boolean> {
  try {
    await carregarIndiceVetorial();
    return true;
  } catch {
    return false;
  }
}
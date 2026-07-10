import { readFile } from "node:fs/promises";
import path from "node:path";

import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

const NOME_ARQUIVO_PDF = "RAG-AutoStore_Base_Tecnica.pdf";

const CAMINHO_PDF = path.join(
  process.cwd(),
  "data",
  "rag",
  NOME_ARQUIVO_PDF,
);

const TAMANHO_MAXIMO_CHUNK = 220;
const SOBREPOSICAO_CHUNK = 40;

export interface RagChunk {
  readonly id: string;
  readonly fonte: string;
  readonly indice: number;
  readonly conteudo: string;
}

function limparTexto(texto: string): string {
  return texto
    .replaceAll("\r", "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extrairTextoDoPdf(): Promise<string> {
  let parser: PDFParse | null = null;

  try {
    const arquivoPdf = await readFile(CAMINHO_PDF);

    parser = new PDFParse({
      data: arquivoPdf,
    });

    const resultado = await parser.getText();
    const textoLimpo = limparTexto(resultado.text);

    if (!textoLimpo) {
      throw new Error(
        "O PDF técnico foi encontrado, mas nenhum texto pôde ser extraído.",
      );
    }

    return textoLimpo;
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro desconhecido durante a leitura do PDF.";

    throw new Error(`Não foi possível ler o PDF técnico: ${mensagem}`);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

export function dividirTextoEmChunks(
  texto: string,
  tamanhoMaximo = TAMANHO_MAXIMO_CHUNK,
  sobreposicao = SOBREPOSICAO_CHUNK,
): RagChunk[] {
  if (tamanhoMaximo <= 0) {
    throw new Error(
      "O tamanho máximo do chunk deve ser maior que zero.",
    );
  }

  if (sobreposicao < 0 || sobreposicao >= tamanhoMaximo) {
    throw new Error(
      "A sobreposição deve ser maior ou igual a zero e menor que o tamanho do chunk.",
    );
  }

  const palavras = limparTexto(texto)
    .split(/\s+/)
    .filter((palavra) => palavra.length > 0);

  if (palavras.length === 0) {
    return [];
  }

  const chunks: RagChunk[] = [];
  const passo = tamanhoMaximo - sobreposicao;

  for (
    let inicio = 0, indice = 0;
    inicio < palavras.length;
    inicio += passo, indice += 1
  ) {
    const fim = Math.min(
      inicio + tamanhoMaximo,
      palavras.length,
    );

    const conteudo = palavras
      .slice(inicio, fim)
      .join(" ");

    chunks.push({
      id: `autostore-rag-${indice + 1}`,
      fonte: NOME_ARQUIVO_PDF,
      indice,
      conteudo,
    });

    if (fim === palavras.length) {
      break;
    }
  }

  return chunks;
}

export async function carregarChunksDoRag(): Promise<RagChunk[]> {
  const textoPdf = await extrairTextoDoPdf();
  const chunks = dividirTextoEmChunks(textoPdf);

  if (chunks.length === 0) {
    throw new Error(
      "O texto do PDF foi extraído, mas nenhum chunk foi criado.",
    );
  }

  return chunks;
}
import {
  buscarChunksMaisRelevantes,
  gerarEmbeddingDaPergunta,
  type ResultadoBuscaVetorial,
} from "@/lib/embeddings";
import { carregarIndiceVetorial } from "@/lib/vector-store";

const QUANTIDADE_PADRAO_RESULTADOS = 4;
const LIMITE_MINIMO_SIMILARIDADE = 0;

export interface FonteSemantica {
  readonly id: string;
  readonly fonte: string;
  readonly indice: number;
  readonly conteudo: string;
  readonly similaridade: number;
}

export interface ResultadoBuscaSemantica {
  readonly pergunta: string;
  readonly totalResultados: number;
  readonly contexto: string;
  readonly fontes: FonteSemantica[];
}

function validarPergunta(pergunta: string): string {
  const perguntaLimpa = pergunta.trim();

  if (!perguntaLimpa) {
    throw new Error(
      "A pergunta não pode estar vazia para realizar a busca semântica.",
    );
  }

  return perguntaLimpa;
}

function validarQuantidadeResultados(quantidade: number): void {
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error(
      "A quantidade de resultados da busca semântica deve ser um número inteiro maior que zero.",
    );
  }
}

function converterResultadoEmFonte(
  resultado: ResultadoBuscaVetorial,
): FonteSemantica {
  return {
    id: resultado.chunk.id,
    fonte: resultado.chunk.fonte,
    indice: resultado.chunk.indice,
    conteudo: resultado.chunk.conteudo,
    similaridade: resultado.similaridade,
  };
}

function montarContexto(fontes: FonteSemantica[]): string {
  return fontes
    .map(
      (fonte, indice) =>
        `[Fonte ${indice + 1} — ${fonte.fonte} — trecho ${
          fonte.indice + 1
        }]\n${fonte.conteudo}`,
    )
    .join("\n\n");
}

export async function realizarBuscaSemantica(
  pergunta: string,
  quantidadeResultados = QUANTIDADE_PADRAO_RESULTADOS,
): Promise<ResultadoBuscaSemantica> {
  const perguntaLimpa = validarPergunta(pergunta);

  validarQuantidadeResultados(quantidadeResultados);

  const chunksVetorizados = await carregarIndiceVetorial();

  if (chunksVetorizados.length === 0) {
    throw new Error(
      "O índice vetorial está vazio. Execute novamente a indexação do RAG.",
    );
  }

  const embeddingPergunta =
    await gerarEmbeddingDaPergunta(perguntaLimpa);

  const resultados = buscarChunksMaisRelevantes(
    embeddingPergunta,
    chunksVetorizados,
    quantidadeResultados,
  );

  const fontes = resultados
    .filter(
      (resultado) =>
        resultado.similaridade >= LIMITE_MINIMO_SIMILARIDADE,
    )
    .map(converterResultadoEmFonte);

  if (fontes.length === 0) {
    return {
      pergunta: perguntaLimpa,
      totalResultados: 0,
      contexto: "",
      fontes: [],
    };
  }

  return {
    pergunta: perguntaLimpa,
    totalResultados: fontes.length,
    contexto: montarContexto(fontes),
    fontes,
  };
}
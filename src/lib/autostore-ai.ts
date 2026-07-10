import { GoogleGenAI } from "@google/genai";

import {
  realizarBuscaSemantica,
  type FonteSemantica,
} from "@/lib/busca-semantica";

const MODELO_GERACAO = "gemini-3.1-flash-lite";
const QUANTIDADE_FONTES = 4;

const INSTRUCAO_SISTEMA = `
Você é o AutoStoreAI, assistente virtual de uma loja de veículos.

Regras obrigatórias:
- Responda somente com base no contexto técnico fornecido.
- Não invente preços, especificações, versões, cores ou veículos.
- Se o contexto não tiver informação suficiente, diga claramente que não encontrou essa informação na base.
- Se a pergunta estiver fora do catálogo de veículos, informe educadamente que você só responde sobre os carros da AutoStore.
- Seja objetivo, claro e responda em português do Brasil.
- Quando comparar veículos, use apenas as informações presentes no contexto.
- Não mencione embeddings, chunks, busca vetorial ou detalhes internos do sistema.
`.trim();

export interface FonteRespostaAutoStoreAI {
  readonly id: string;
  readonly arquivo: string;
  readonly trecho: number;
  readonly similaridade: number;
  readonly conteudo: string;
}

export interface RespostaAutoStoreAI {
  readonly pergunta: string;
  readonly resposta: string;
  readonly modelo: string;
  readonly fontes: FonteRespostaAutoStoreAI[];
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

function validarPergunta(pergunta: string): string {
  const perguntaLimpa = pergunta.trim();

  if (!perguntaLimpa) {
    throw new Error(
      "A pergunta não pode estar vazia.",
    );
  }

  if (perguntaLimpa.length > 1000) {
    throw new Error(
      "A pergunta deve ter no máximo 1000 caracteres.",
    );
  }

  return perguntaLimpa;
}

function criarClienteGemini(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: obterChaveGemini(),
  });
}

function montarPrompt(
  pergunta: string,
  contexto: string,
): string {
  return `
Use exclusivamente o contexto abaixo para responder.

CONTEXTO RECUPERADO:
${contexto}

PERGUNTA DO USUÁRIO:
${pergunta}

Responda de maneira objetiva e não acrescente informações que não estejam no contexto.
`.trim();
}

function converterFonte(
  fonte: FonteSemantica,
): FonteRespostaAutoStoreAI {
  return {
    id: fonte.id,
    arquivo: fonte.fonte,
    trecho: fonte.indice + 1,
    similaridade: Number(
      fonte.similaridade.toFixed(4),
    ),
    conteudo: fonte.conteudo,
  };
}

export async function gerarRespostaAutoStoreAI(
  pergunta: string,
): Promise<RespostaAutoStoreAI> {
  const perguntaLimpa = validarPergunta(pergunta);

  const buscaSemantica = await realizarBuscaSemantica(
    perguntaLimpa,
    QUANTIDADE_FONTES,
  );

  if (
    buscaSemantica.totalResultados === 0 ||
    !buscaSemantica.contexto
  ) {
    return {
      pergunta: perguntaLimpa,
      resposta:
        "Não encontrei informações suficientes na base técnica para responder a essa pergunta.",
      modelo: MODELO_GERACAO,
      fontes: [],
    };
  }

  const cliente = criarClienteGemini();

  const respostaGemini =
    await cliente.models.generateContent({
      model: MODELO_GERACAO,
      contents: montarPrompt(
        perguntaLimpa,
        buscaSemantica.contexto,
      ),
      config: {
        systemInstruction: INSTRUCAO_SISTEMA,
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    });

  const textoResposta = respostaGemini.text?.trim();

  if (!textoResposta) {
    throw new Error(
      "O Gemini não retornou uma resposta válida.",
    );
  }

  return {
    pergunta: perguntaLimpa,
    resposta: textoResposta,
    modelo: MODELO_GERACAO,
    fontes: buscaSemantica.fontes.map(
      converterFonte,
    ),
  };
}
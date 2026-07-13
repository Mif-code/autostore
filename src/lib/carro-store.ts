import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import carrosIniciais from "@/data/carros_catalogo.json";
import type { Carro } from "@/types/Carro";

const DIRETORIO_CARROS = path.join(process.cwd(), "data", "carros");
const CAMINHO_CARROS = path.join(DIRETORIO_CARROS, "carros.json");

export type CriarCarroInput = Omit<Carro, "id">;
export type AtualizarCarroInput = Partial<CriarCarroInput>;

class ErroArmazenamentoCarros extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErroArmazenamentoCarros";
  }
}

function carroEhValido(valor: unknown): valor is Carro {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const carro = valor as Partial<Carro>;

  return (
    typeof carro.id === "number" &&
    Number.isInteger(carro.id) &&
    carro.id > 0 &&
    typeof carro.montadora === "string" &&
    typeof carro.modelo === "string" &&
    typeof carro.categoria === "string" &&
    typeof carro.ano === "number" &&
    Number.isInteger(carro.ano) &&
    typeof carro.motor === "string" &&
    typeof carro.potencia_cv === "string" &&
    typeof carro.cambio === "string" &&
    typeof carro.consumo === "string" &&
    typeof carro.preco_a_partir_rs === "number" &&
    Number.isFinite(carro.preco_a_partir_rs) &&
    typeof carro.preco_obs === "string" &&
    typeof carro.cores === "string" &&
    typeof carro.itens === "string" &&
    typeof carro.desc === "string" &&
    typeof carro.imagem_arquivo === "string" &&
    Array.isArray(carro.imagens) &&
    carro.imagens.every((imagem) => typeof imagem === "string") &&
    typeof carro.foto_referencia === "string"
  );
}

async function garantirArquivoDeCarros(): Promise<void> {
  await mkdir(DIRETORIO_CARROS, { recursive: true });

  try {
    await readFile(CAMINHO_CARROS, "utf-8");
  } catch {
    await writeFile(
      CAMINHO_CARROS,
      JSON.stringify(carrosIniciais, null, 2),
      "utf-8",
    );
  }
}

async function lerCarros(): Promise<Carro[]> {
  await garantirArquivoDeCarros();

  const conteudo = await readFile(CAMINHO_CARROS, "utf-8");

  let dados: unknown;

  try {
    dados = JSON.parse(conteudo);
  } catch {
    throw new ErroArmazenamentoCarros(
      "O arquivo de carros contém um JSON inválido.",
    );
  }

  if (!Array.isArray(dados) || !dados.every(carroEhValido)) {
    throw new ErroArmazenamentoCarros(
      "O arquivo de carros possui um formato inválido.",
    );
  }

  return dados;
}

async function salvarCarros(carros: Carro[]): Promise<void> {
  await garantirArquivoDeCarros();
  await writeFile(
    CAMINHO_CARROS,
    JSON.stringify(carros, null, 2),
    "utf-8",
  );
}

export async function listarCarros(): Promise<Carro[]> {
  const carros = await lerCarros();
  return [...carros].sort((a, b) => a.id - b.id);
}

export async function obterCarroPorId(id: number): Promise<Carro | null> {
  const carros = await lerCarros();
  return carros.find((carro) => carro.id === id) ?? null;
}

export async function criarCarro(dados: CriarCarroInput): Promise<Carro> {
  const carros = await lerCarros();
  const maiorId = carros.reduce((maior, carro) => Math.max(maior, carro.id), 0);

  const novoCarro: Carro = {
    id: maiorId + 1,
    ...dados,
  };

  carros.push(novoCarro);
  await salvarCarros(carros);
  return novoCarro;
}

export async function atualizarCarro(
  id: number,
  dados: AtualizarCarroInput,
): Promise<Carro | null> {
  const carros = await lerCarros();
  const indice = carros.findIndex((carro) => carro.id === id);

  if (indice < 0) {
    return null;
  }

  const carroAtualizado: Carro = {
    ...carros[indice],
    ...dados,
    id,
  };

  carros[indice] = carroAtualizado;
  await salvarCarros(carros);
  return carroAtualizado;
}

export async function removerCarro(id: number): Promise<Carro | null> {
  const carros = await lerCarros();
  const carro = carros.find((item) => item.id === id);

  if (!carro) {
    return null;
  }

  await salvarCarros(carros.filter((item) => item.id !== id));
  return carro;
}

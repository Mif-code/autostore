import { NextResponse } from "next/server";

import {
  criarCarro,
  listarCarros,
  type CriarCarroInput,
} from "../../../lib/carro-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class ErroValidacaoCarro extends Error {}

function texto(valor: unknown, campo: string, max = 500): string {
  if (typeof valor !== "string" || !valor.trim()) {
    throw new ErroValidacaoCarro(`O campo ${campo} é obrigatório.`);
  }

  const resultado = valor.trim();
  if (resultado.length > max) {
    throw new ErroValidacaoCarro(`O campo ${campo} excede ${max} caracteres.`);
  }
  return resultado;
}

function numeroPositivo(valor: unknown, campo: string): number {
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    throw new ErroValidacaoCarro(`O campo ${campo} deve ser um número positivo.`);
  }
  return valor;
}

function anoValido(valor: unknown): number {
  const ano = numeroPositivo(valor, "ano");
  if (!Number.isInteger(ano) || ano < 1900 || ano > 2100) {
    throw new ErroValidacaoCarro("Informe um ano válido.");
  }
  return ano;
}

function listaImagens(valor: unknown): string[] {
  if (!Array.isArray(valor)) {
    return [];
  }
  return valor
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validarCorpo(corpo: Record<string, unknown>): CriarCarroInput {
  return {
    montadora: texto(corpo.montadora, "montadora", 100),
    modelo: texto(corpo.modelo, "modelo", 100),
    categoria: texto(corpo.categoria, "categoria", 100),
    ano: anoValido(corpo.ano),
    motor: texto(corpo.motor, "motor", 150),
    potencia_cv: texto(corpo.potencia_cv, "potência", 100),
    cambio: texto(corpo.cambio, "câmbio", 100),
    consumo: texto(corpo.consumo, "consumo", 150),
    preco_a_partir_rs: numeroPositivo(corpo.preco_a_partir_rs, "preço"),
    preco_obs: typeof corpo.preco_obs === "string" ? corpo.preco_obs.trim() : "",
    cores: texto(corpo.cores, "cores", 300),
    itens: texto(corpo.itens, "itens", 1000),
    desc: texto(corpo.desc, "descrição", 2000),
    imagem_arquivo: texto(corpo.imagem_arquivo, "imagem principal", 300),
    imagens: listaImagens(corpo.imagens),
    foto_referencia:
      typeof corpo.foto_referencia === "string" ? corpo.foto_referencia.trim() : "",
  };
}

export async function GET() {
  try {
    const carros = await listarCarros();
    return NextResponse.json({ sucesso: true, total: carros.length, carros });
  } catch (error) {
    return NextResponse.json(
      { sucesso: false, mensagem: error instanceof Error ? error.message : "Erro ao listar carros." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const corpo = (await request.json()) as Record<string, unknown>;
    const dados = validarCorpo(corpo);
    const carro = await criarCarro(dados);
    return NextResponse.json(
      { sucesso: true, mensagem: "Veículo cadastrado com sucesso.", carro },
      { status: 201 },
    );
  } catch (error) {
    const status = error instanceof ErroValidacaoCarro ? 400 : 500;
    return NextResponse.json(
      { sucesso: false, mensagem: error instanceof Error ? error.message : "Erro ao criar carro." },
      { status },
    );
  }
}

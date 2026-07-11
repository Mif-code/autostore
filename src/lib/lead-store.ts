import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CriarLeadInput, Lead } from "@/types/Lead";

const DIRETORIO_LEADS = path.join(
  process.cwd(),
  "data",
  "leads",
);

const CAMINHO_LEADS = path.join(
  DIRETORIO_LEADS,
  "leads.json",
);

class ErroArmazenamentoLeads extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErroArmazenamentoLeads";
  }
}

function leadEhValido(valor: unknown): valor is Lead {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const lead = valor as Partial<Lead>;

  return (
    typeof lead.id === "string" &&
    typeof lead.nome === "string" &&
    typeof lead.email === "string" &&
    typeof lead.telefone === "string" &&
    typeof lead.veiculoId === "number" &&
    typeof lead.veiculoNome === "string" &&
    typeof lead.mensagem === "string" &&
    typeof lead.criadoEm === "string"
  );
}

async function garantirArquivoDeLeads(): Promise<void> {
  await mkdir(DIRETORIO_LEADS, {
    recursive: true,
  });

  try {
    await readFile(CAMINHO_LEADS, "utf-8");
  } catch {
    await writeFile(
      CAMINHO_LEADS,
      "[]",
      "utf-8",
    );
  }
}

async function lerLeads(): Promise<Lead[]> {
  await garantirArquivoDeLeads();

  const conteudo = await readFile(
    CAMINHO_LEADS,
    "utf-8",
  );

  if (!conteudo.trim()) {
    return [];
  }

  let dados: unknown;

  try {
    dados = JSON.parse(conteudo);
  } catch {
    throw new ErroArmazenamentoLeads(
      "O arquivo de leads contém um JSON inválido.",
    );
  }

  if (!Array.isArray(dados)) {
    throw new ErroArmazenamentoLeads(
      "O arquivo de leads possui um formato inválido.",
    );
  }

  if (!dados.every(leadEhValido)) {
    throw new ErroArmazenamentoLeads(
      "O arquivo possui um ou mais leads com dados inválidos.",
    );
  }

  return dados;
}

async function salvarLeads(
  leads: Lead[],
): Promise<void> {
  await garantirArquivoDeLeads();

  await writeFile(
    CAMINHO_LEADS,
    JSON.stringify(leads, null, 2),
    "utf-8",
  );
}

export async function listarLeads(): Promise<Lead[]> {
  const leads = await lerLeads();

  return [...leads].sort((leadA, leadB) =>
    leadB.criadoEm.localeCompare(leadA.criadoEm),
  );
}

export async function criarLead(
  dados: CriarLeadInput,
): Promise<Lead> {
  const leads = await lerLeads();

  const novoLead: Lead = {
    id: randomUUID(),
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    telefone: dados.telefone.trim(),
    veiculoId: dados.veiculoId,
    veiculoNome: dados.veiculoNome.trim(),
    mensagem: dados.mensagem?.trim() ?? "",
    criadoEm: new Date().toISOString(),
  };

  leads.push(novoLead);

  await salvarLeads(leads);

  return novoLead;
}
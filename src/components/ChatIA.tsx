"use client";

import { useState } from "react";

import carrosData from "@/data/carros_catalogo.json";
import { Carro } from "@/types/Carro";

interface Mensagem {
  readonly id: number;
  readonly autor: "usuario" | "ia";
  readonly texto: string;
}

interface IntencoesBusca {
  readonly comparacao: boolean;
  readonly maisBarato: boolean;
  readonly maisCaro: boolean;
  readonly ate150Mil: boolean;
  readonly suv: boolean;
  readonly economico: boolean;
  readonly familia: boolean;
  readonly eletrico: boolean;
  readonly picape: boolean;
  readonly preco: boolean;
  readonly consumo: boolean;
  readonly cores: boolean;
}

interface CarroPontuado {
  readonly carro: Carro;
  readonly pontos: number;
}

const carros = carrosData as Carro[];

function formatarPreco(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function encontrarCarroPorModelo(texto: string): Carro | undefined {
  const textoNormalizado = normalizarTexto(texto);

  const carrosOrdenados = [...carros].sort(
    (carroA, carroB) => carroB.modelo.length - carroA.modelo.length,
  );

  return carrosOrdenados.find((carro) =>
    textoNormalizado.includes(normalizarTexto(carro.modelo)),
  );
}

function encontrarCarrosMencionados(texto: string): Carro[] {
  let textoRestante = normalizarTexto(texto);

  const carrosOrdenados = [...carros].sort(
    (carroA, carroB) => carroB.modelo.length - carroA.modelo.length,
  );

  const encontrados: Carro[] = [];

  for (const carro of carrosOrdenados) {
    const modeloNormalizado = normalizarTexto(carro.modelo);

    if (textoRestante.includes(modeloNormalizado)) {
      encontrados.push(carro);
      textoRestante = textoRestante.replace(modeloNormalizado, " ");
    }
  }

  return encontrados;
}

function identificarIntencoes(textoBusca: string): IntencoesBusca {
  return {
    comparacao:
      textoBusca.includes("compare") ||
      textoBusca.includes("comparar") ||
      textoBusca.includes("comparacao"),

    maisBarato:
      textoBusca.includes("mais barato") ||
      textoBusca.includes("menor preco"),

    maisCaro:
      textoBusca.includes("mais caro") ||
      textoBusca.includes("maior preco"),

    ate150Mil:
      textoBusca.includes("150 mil") ||
      textoBusca.includes("150.000") ||
      textoBusca.includes("150000"),

    suv: textoBusca.includes("suv"),

    economico: textoBusca.includes("economico"),

    familia: textoBusca.includes("familia"),

    eletrico: textoBusca.includes("eletrico"),

    picape:
      textoBusca.includes("picape") ||
      textoBusca.includes("pickup"),

    preco:
      textoBusca.includes("preco") ||
      textoBusca.includes("valor"),

    consumo: textoBusca.includes("consumo"),

    cores:
      textoBusca.includes("cor") ||
      textoBusca.includes("cores"),
  };
}

function gerarComparacao(carrosComparados: Carro[]): string {
  const carroA = carrosComparados[0];
  const carroB = carrosComparados[1];

  if (!carroA || !carroB) {
    return "Para fazer uma comparação, informe dois modelos disponíveis no catálogo. Exemplo: compare Corolla Cross e T-Cross.";
  }

  const maisBarato =
    carroA.preco_a_partir_rs <= carroB.preco_a_partir_rs
      ? carroA
      : carroB;

  return `Comparando ${carroA.montadora} ${carroA.modelo} e ${
    carroB.montadora
  } ${carroB.modelo}: ${carroA.modelo}: ${
    carroA.categoria
  }, motor ${carroA.motor}, consumo ${
    carroA.consumo
  }, preço a partir de ${formatarPreco(
    carroA.preco_a_partir_rs,
  )}. ${carroB.modelo}: ${carroB.categoria}, motor ${
    carroB.motor
  }, consumo ${carroB.consumo}, preço a partir de ${formatarPreco(
    carroB.preco_a_partir_rs,
  )}. Pelo preço, o melhor custo inicial é o ${maisBarato.montadora} ${
    maisBarato.modelo
  }.`;
}

function encontrarSUVMaisBarato(): Carro | undefined {
  return carros
    .filter((carro) =>
      normalizarTexto(carro.categoria).includes("suv"),
    )
    .sort(
      (carroA, carroB) =>
        carroA.preco_a_partir_rs - carroB.preco_a_partir_rs,
    )[0];
}

function encontrarCarroMaisBarato(): Carro | undefined {
  return [...carros].sort(
    (carroA, carroB) =>
      carroA.preco_a_partir_rs - carroB.preco_a_partir_rs,
  )[0];
}

function encontrarCarroMaisCaro(): Carro | undefined {
  return [...carros].sort(
    (carroA, carroB) =>
      carroB.preco_a_partir_rs - carroA.preco_a_partir_rs,
  )[0];
}

function gerarRespostaPorFaixaDePreco(): string {
  const encontrados = carros
    .filter((carro) => carro.preco_a_partir_rs <= 150000)
    .sort(
      (carroA, carroB) =>
        carroA.preco_a_partir_rs - carroB.preco_a_partir_rs,
    )
    .slice(0, 3);

  if (encontrados.length === 0) {
    return "Não encontrei veículos de até R$ 150.000 no catálogo.";
  }

  const opcoes = encontrados
    .map(
      (carro) =>
        `${carro.montadora} ${carro.modelo} (${
          carro.categoria
        }) por ${formatarPreco(carro.preco_a_partir_rs)}`,
    )
    .join("; ");

  return `Encontrei opções até R$ 150.000: ${opcoes}.`;
}

function gerarRespostaSobreModelo(
  carro: Carro,
  intencoes: IntencoesBusca,
): string {
  if (intencoes.preco) {
    return `O ${carro.montadora} ${carro.modelo} parte de ${formatarPreco(
      carro.preco_a_partir_rs,
    )}.`;
  }

  if (intencoes.consumo) {
    return `O consumo informado para o ${carro.montadora} ${carro.modelo} é: ${carro.consumo}.`;
  }

  if (intencoes.cores) {
    return `As cores disponíveis para o ${carro.montadora} ${carro.modelo} são: ${carro.cores}.`;
  }

  return `Encontrei o ${carro.montadora} ${carro.modelo}. Ele é um ${
    carro.categoria
  }, possui motor ${carro.motor}, consumo ${
    carro.consumo
  } e preço a partir de ${formatarPreco(carro.preco_a_partir_rs)}.`;
}

function calcularPontuacao(
  carro: Carro,
  textoBusca: string,
  intencoes: IntencoesBusca,
): number {
  let pontos = 0;

  const categoria = normalizarTexto(carro.categoria);
  const motor = normalizarTexto(carro.motor);
  const consumo = normalizarTexto(carro.consumo);
  const montadora = normalizarTexto(carro.montadora);

  if (intencoes.suv && categoria.includes("suv")) {
    pontos += 5;
  }

  if (intencoes.economico && consumo.includes("econom")) {
    pontos += 3;
  }

  if (intencoes.familia && categoria.includes("suv")) {
    pontos += 3;
  }

  if (intencoes.eletrico && motor.includes("eletrico")) {
    pontos += 5;
  }

  if (intencoes.picape && categoria.includes("picape")) {
    pontos += 6;
  }

  if (textoBusca.includes(montadora)) {
    pontos += 4;
  }

  return pontos;
}

function gerarRecomendacoes(
  textoBusca: string,
  intencoes: IntencoesBusca,
): string {
  const carrosPontuados: CarroPontuado[] = carros.map((carro) => ({
    carro,
    pontos: calcularPontuacao(carro, textoBusca, intencoes),
  }));

  const melhores = carrosPontuados
    .filter((item) => item.pontos > 0)
    .sort(
      (itemA, itemB) =>
        itemB.pontos - itemA.pontos ||
        itemA.carro.preco_a_partir_rs -
          itemB.carro.preco_a_partir_rs,
    )
    .slice(0, 3);

  if (melhores.length === 0) {
    return "Não encontrei uma opção ideal para essa busca. Tente perguntar por SUV, elétrico, picape, econômico, marca, modelo, preço, consumo, cores ou comparação.";
  }

  const recomendacoes = melhores
    .map(
      ({ carro }) =>
        `${carro.montadora} ${carro.modelo} (${
          carro.categoria
        }) a partir de ${formatarPreco(carro.preco_a_partir_rs)}`,
    )
    .join("; ");

  return `Com base no catálogo, recomendo: ${recomendacoes}.`;
}

function gerarResposta(pergunta: string): string {
  const textoBusca = normalizarTexto(pergunta);
  const intencoes = identificarIntencoes(textoBusca);
  const carrosMencionados = encontrarCarrosMencionados(pergunta);

  if (intencoes.comparacao) {
    return gerarComparacao(carrosMencionados);
  }

  if (intencoes.maisBarato && intencoes.suv) {
    const suvMaisBarato = encontrarSUVMaisBarato();

    if (!suvMaisBarato) {
      return "Não encontrei SUVs disponíveis no catálogo.";
    }

    return `O SUV com menor preço no catálogo é o ${
      suvMaisBarato.montadora
    } ${suvMaisBarato.modelo}, a partir de ${formatarPreco(
      suvMaisBarato.preco_a_partir_rs,
    )}.`;
  }

  if (intencoes.maisBarato) {
    const carroMaisBarato = encontrarCarroMaisBarato();

    if (!carroMaisBarato) {
      return "Não encontrei veículos disponíveis no catálogo.";
    }

    return `O carro mais barato do catálogo é o ${
      carroMaisBarato.montadora
    } ${carroMaisBarato.modelo}, a partir de ${formatarPreco(
      carroMaisBarato.preco_a_partir_rs,
    )}.`;
  }

  if (intencoes.maisCaro) {
    const carroMaisCaro = encontrarCarroMaisCaro();

    if (!carroMaisCaro) {
      return "Não encontrei veículos disponíveis no catálogo.";
    }

    return `O carro mais caro do catálogo é o ${
      carroMaisCaro.montadora
    } ${carroMaisCaro.modelo}, a partir de ${formatarPreco(
      carroMaisCaro.preco_a_partir_rs,
    )}.`;
  }

  if (intencoes.ate150Mil) {
    return gerarRespostaPorFaixaDePreco();
  }

  const carroEncontrado = encontrarCarroPorModelo(pergunta);

  if (carroEncontrado) {
    return gerarRespostaSobreModelo(carroEncontrado, intencoes);
  }

  return gerarRecomendacoes(textoBusca, intencoes);
}

export default function ChatIA() {
  const [pergunta, setPergunta] = useState("");

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 1,
      autor: "ia",
      texto:
        "Olá! Me diga o que você procura em um carro. Exemplo: quero um SUV econômico para família.",
    },
  ]);

  function enviarPergunta(event: {
    preventDefault: () => void;
  }): void {
    event.preventDefault();

    const perguntaAtual = pergunta.trim();

    if (!perguntaAtual) {
      return;
    }

    const novaMensagemUsuario: Mensagem = {
      id: Date.now(),
      autor: "usuario",
      texto: perguntaAtual,
    };

    const respostaIA: Mensagem = {
      id: Date.now() + 1,
      autor: "ia",
      texto: gerarResposta(perguntaAtual),
    };

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      novaMensagemUsuario,
      respostaIA,
    ]);

    setPergunta("");
  }

  return (
    <section className="flex min-h-130 flex-col">
      <div className="flex-1 space-y-4 rounded-2xl bg-zinc-50 p-5">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`flex ${
              mensagem.autor === "usuario"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-3/4 rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                mensagem.autor === "usuario"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-700 shadow-sm"
              }`}
            >
              {mensagem.texto}
            </div>
          </div>
        ))}
      </div>

      <form
        className="mt-5 flex gap-3"
        onSubmit={enviarPergunta}
      >
        <input
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600"
          type="text"
          aria-label="Pergunta para o VroomAI"
          placeholder="Pergunte sobre preços, consumo, cores, comparações..."
          value={pergunta}
          onChange={(event) => setPergunta(event.target.value)}
        />

        <button
          className="rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          type="submit"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
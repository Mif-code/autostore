"use client";

import { useState } from "react";

import carrosData from "@/data/carros_catalogo.json";
import { Carro } from "@/types/Carro";

interface Mensagem {
  readonly id: number;
  readonly autor: "usuario" | "ia";
  readonly texto: string;
}

const carros = carrosData as Carro[];

function formatarPreco(valor: number) {
  return `R$ ${valor.toLocaleString("pt-BR")}`;
}

function normalizarTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function encontrarCarroPorModelo(texto: string) {
  const textoNormalizado = normalizarTexto(texto);

  const carrosOrdenados = [...carros].sort(
    (a, b) => b.modelo.length - a.modelo.length
  );

  return carrosOrdenados.find((carro) =>
    textoNormalizado.includes(normalizarTexto(carro.modelo))
  );
}

function encontrarCarrosMencionados(texto: string) {
  let textoRestante = normalizarTexto(texto);

  const carrosOrdenados = [...carros].sort(
    (a, b) => b.modelo.length - a.modelo.length
  );

  const encontrados: Carro[] = [];

  for (const carro of carrosOrdenados) {
    const modeloNormalizado = normalizarTexto(carro.modelo);

    if (textoRestante.includes(modeloNormalizado)) {
      encontrados.push(carro);

      // Remove o modelo já encontrado para evitar:
      // "Corolla" ser encontrado dentro de "Corolla Cross".
      textoRestante = textoRestante.replace(modeloNormalizado, " ");
    }
  }

  return encontrados;
}

function gerarComparacao(carrosComparados: Carro[]) {
  const [carroA, carroB] = carrosComparados;

  const maisBarato =
    carroA.preco_a_partir_rs <= carroB.preco_a_partir_rs ? carroA : carroB;

  return `Comparando ${carroA.montadora} ${carroA.modelo} e ${
    carroB.montadora
  } ${carroB.modelo}: ${carroA.modelo}: ${
    carroA.categoria
  }, motor ${carroA.motor}, consumo ${
    carroA.consumo
  }, preço a partir de ${formatarPreco(
    carroA.preco_a_partir_rs
  )}. ${carroB.modelo}: ${carroB.categoria}, motor ${
    carroB.motor
  }, consumo ${carroB.consumo}, preço a partir de ${formatarPreco(
    carroB.preco_a_partir_rs
  )}. Pelo preço, o melhor custo inicial é o ${maisBarato.montadora} ${
    maisBarato.modelo
  }.`;
}

function gerarResposta(pergunta: string) {
  const textoBusca = normalizarTexto(pergunta);

  const buscaComparacao =
    textoBusca.includes("compare") ||
    textoBusca.includes("comparar") ||
    textoBusca.includes("comparacao");

  const buscaMaisBarato =
    textoBusca.includes("mais barato") ||
    textoBusca.includes("menor preco");

  const buscaMaisCaro =
    textoBusca.includes("mais caro") ||
    textoBusca.includes("maior preco");

  const buscaAte150 =
    textoBusca.includes("150 mil") ||
    textoBusca.includes("150.000") ||
    textoBusca.includes("150000");

  const buscaSUV = textoBusca.includes("suv");

  const buscaEconomico = textoBusca.includes("economico");

  const buscaFamilia = textoBusca.includes("familia");

  const buscaEletrico = textoBusca.includes("eletrico");

  const buscaPicape =
    textoBusca.includes("picape") || textoBusca.includes("pickup");

  const buscaPreco =
    textoBusca.includes("preco") || textoBusca.includes("valor");

  const buscaConsumo = textoBusca.includes("consumo");

  const buscaCores =
    textoBusca.includes("cor") || textoBusca.includes("cores");

  const carrosMencionados = encontrarCarrosMencionados(pergunta);

  // COMPARAÇÃO ENTRE DOIS VEÍCULOS
  if (buscaComparacao && carrosMencionados.length >= 2) {
    return gerarComparacao(carrosMencionados.slice(0, 2));
  }

  // COMPARAÇÃO SOLICITADA, MAS NÃO ENCONTROU DOIS CARROS
  if (buscaComparacao && carrosMencionados.length < 2) {
    return "Para fazer uma comparação, informe dois modelos disponíveis no catálogo. Exemplo: compare Corolla Cross e T-Cross.";
  }

  // SUV MAIS BARATO
  if (buscaMaisBarato && buscaSUV) {
    const suvs = carros
      .filter((carro) =>
        normalizarTexto(carro.categoria).includes("suv")
      )
      .sort((a, b) => a.preco_a_partir_rs - b.preco_a_partir_rs);

    if (suvs.length === 0) {
      return "Não encontrei SUVs disponíveis no catálogo.";
    }

    const suv = suvs[0];

    return `O SUV com menor preço no catálogo é o ${suv.montadora} ${
      suv.modelo
    }, a partir de ${formatarPreco(suv.preco_a_partir_rs)}.`;
  }

  // CARRO MAIS BARATO
  if (buscaMaisBarato) {
    const carro = [...carros].sort(
      (a, b) => a.preco_a_partir_rs - b.preco_a_partir_rs
    )[0];

    return `O carro mais barato do catálogo é o ${carro.montadora} ${
      carro.modelo
    }, a partir de ${formatarPreco(carro.preco_a_partir_rs)}.`;
  }

  // CARRO MAIS CARO
  if (buscaMaisCaro) {
    const carro = [...carros].sort(
      (a, b) => b.preco_a_partir_rs - a.preco_a_partir_rs
    )[0];

    return `O carro mais caro do catálogo é o ${carro.montadora} ${
      carro.modelo
    }, a partir de ${formatarPreco(carro.preco_a_partir_rs)}.`;
  }

  // CARROS ATÉ R$ 150 MIL
  if (buscaAte150) {
    const encontrados = carros
      .filter((carro) => carro.preco_a_partir_rs <= 150000)
      .sort((a, b) => a.preco_a_partir_rs - b.preco_a_partir_rs)
      .slice(0, 3);

    if (encontrados.length === 0) {
      return "Não encontrei veículos de até R$ 150.000 no catálogo.";
    }

    return `Encontrei opções até R$ 150.000: ${encontrados
      .map(
        (carro) =>
          `${carro.montadora} ${carro.modelo} (${
            carro.categoria
          }) por ${formatarPreco(carro.preco_a_partir_rs)}`
      )
      .join("; ")}.`;
  }

  const carroEncontrado = encontrarCarroPorModelo(pergunta);

  // PREÇO DE UM MODELO
  if (carroEncontrado && buscaPreco) {
    return `O ${carroEncontrado.montadora} ${
      carroEncontrado.modelo
    } parte de ${formatarPreco(carroEncontrado.preco_a_partir_rs)}.`;
  }

  // CONSUMO DE UM MODELO
  if (carroEncontrado && buscaConsumo) {
    return `O consumo informado para o ${carroEncontrado.montadora} ${carroEncontrado.modelo} é: ${carroEncontrado.consumo}.`;
  }

  // CORES DE UM MODELO
  if (carroEncontrado && buscaCores) {
    return `As cores disponíveis para o ${carroEncontrado.montadora} ${carroEncontrado.modelo} são: ${carroEncontrado.cores}.`;
  }

  // INFORMAÇÕES GERAIS SOBRE UM MODELO
  if (carroEncontrado) {
    return `Encontrei o ${carroEncontrado.montadora} ${
      carroEncontrado.modelo
    }. Ele é um ${carroEncontrado.categoria}, possui motor ${
      carroEncontrado.motor
    }, consumo ${carroEncontrado.consumo} e preço a partir de ${formatarPreco(
      carroEncontrado.preco_a_partir_rs
    )}.`;
  }

  // SISTEMA DE RECOMENDAÇÃO
  const carrosPontuados = carros.map((carro) => {
    let pontos = 0;

    const categoria = normalizarTexto(carro.categoria);
    const motor = normalizarTexto(carro.motor);
    const consumo = normalizarTexto(carro.consumo);
    const montadora = normalizarTexto(carro.montadora);

    if (buscaSUV && categoria.includes("suv")) {
      pontos += 5;
    }

    if (buscaEconomico && consumo.includes("econom")) {
      pontos += 3;
    }

    if (buscaFamilia && categoria.includes("suv")) {
      pontos += 3;
    }

    if (buscaEletrico && motor.includes("eletrico")) {
      pontos += 5;
    }

    if (buscaPicape && categoria.includes("picape")) {
      pontos += 6;
    }

    if (textoBusca.includes(montadora)) {
      pontos += 4;
    }

    return {
      carro,
      pontos,
    };
  });

  const melhores = carrosPontuados
    .filter((item) => item.pontos > 0)
    .sort(
      (a, b) =>
        b.pontos - a.pontos ||
        a.carro.preco_a_partir_rs - b.carro.preco_a_partir_rs
    )
    .slice(0, 3);

  if (melhores.length === 0) {
    return "Não encontrei uma opção ideal para essa busca. Tente perguntar por SUV, elétrico, picape, econômico, marca, modelo, preço, consumo, cores ou comparação.";
  }

  return `Com base no catálogo, recomendo: ${melhores
    .map(
      ({ carro }) =>
        `${carro.montadora} ${carro.modelo} (${
          carro.categoria
        }) a partir de ${formatarPreco(carro.preco_a_partir_rs)}`
    )
    .join("; ")}.`;
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

  function enviarPergunta(event: React.FormEvent<HTMLFormElement>) {
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
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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

      <form className="mt-5 flex gap-3" onSubmit={enviarPergunta}>
        <input
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600"
          type="text"
          placeholder="Pergunte sobre preços, consumo, cores, comparações..."
          value={pergunta}
          onChange={(event) => setPergunta(event.target.value)}
        />

        <button
          className="rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700"
          type="submit"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
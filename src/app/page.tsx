"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type SyntheticEvent,
  useMemo,
  useState,
} from "react";

import CarCard from "@/components/CarCard";
import CarrosselMarcas from "@/components/CarrosselMarcas";
import FilterSidebar, {
  identificarCombustivel,
  PRECO_MAXIMO_CATALOGO,
  type TipoCombustivel,
} from "@/components/FilterSidebar";
import Header from "@/components/Header";

import carrosData from "@/data/carros_catalogo.json";
import type { Carro } from "@/types/Carro";

type TipoOrdenacao =
  | "relevancia"
  | "ano-mais-recente"
  | "menor-preco"
  | "mais-economico"
  | "maior-preco";

interface FormularioContato {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  aceitaLgpd: boolean;
}

interface LinkRodape {
  nome: string;
  href: string;
}

interface ListaLinksRodapeProps {
  readonly titulo: string;
  readonly links: readonly LinkRodape[];
}

const carros = carrosData as Carro[];

const LIMITE_COMPARACAO = 3;

const FORMULARIO_INICIAL: FormularioContato = {
  nome: "",
  email: "",
  telefone: "",
  mensagem: "",
  aceitaLgpd: false,
};

const ENDERECO_FICTICIO =
  "Avenida Vroomly, 500 - Jardim Automotivo, Sorocaba - SP";

const URL_MAPA =
  "https://www.google.com/maps/search/?api=1&query=Avenida+Vroomly+500+Jardim+Automotivo+Sorocaba+SP";

const URL_MAPA_EMBED =
  "https://www.google.com/maps?q=Sorocaba,+SP&output=embed";

const larguraOrdenacao: Record<TipoOrdenacao, string> = {
  relevancia: "11rem",
  "ano-mais-recente": "13.5rem",
  "menor-preco": "11.5rem",
  "mais-economico": "12.8rem",
  "maior-preco": "11.5rem",
};

const linksRodapeInstitucionais: readonly LinkRodape[] = [
  {
    nome: "Início",
    href: "/",
  },
  {
    nome: "Sobre nós",
    href: "/#sobre-nos",
  },
  {
    nome: "Catálogo",
    href: "/#catalogo",
  },
  {
    nome: "Fale conosco",
    href: "/#contato",
  },
  {
    nome: "Localização",
    href: "/#endereco",
  },
];

const linksRodapeServicos: readonly LinkRodape[] = [
  {
    nome: "VroomAI",
    href: "/chat/new",
  },
  {
    nome: "Comparar veículos",
    href: "/comparar",
  },
  {
    nome: "Veículos disponíveis",
    href: "/#catalogo",
  },
  {
    nome: "Central de leads",
    href: "/leads",
  },
  {
    nome: "Administração",
    href: "/admin/carros",
  },
];

const linksRodapeAjuda: readonly LinkRodape[] = [
  {
    nome: "Perguntas frequentes",
    href: "/#faq",
  },
  {
    nome: "Termos de uso",
    href: "/#termos-de-uso",
  },
  {
    nome: "Política de privacidade",
    href: "/#politica-privacidade",
  },
  {
    nome: "Segurança dos dados",
    href: "/#seguranca",
  },
  {
    nome: "Atendimento",
    href: "/#contato",
  },
];

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replaceAll("\u0301", "")
    .replaceAll("\u0300", "")
    .replaceAll("\u0302", "")
    .replaceAll("\u0303", "")
    .replaceAll("\u0308", "")
    .replaceAll("\u0327", "")
    .toLowerCase()
    .trim();
}

function obterTextoQuantidade(quantidade: number): string {
  if (quantidade === 1) {
    return "1 veículo encontrado";
  }

  return `${quantidade} veículos encontrados`;
}

function obterPontuacaoRelevancia(
  carro: Carro,
  textoBusca: string,
): number {
  if (!textoBusca) {
    return 0;
  }

  const montadora = normalizarTexto(carro.montadora);
  const modelo = normalizarTexto(carro.modelo);
  const categoria = normalizarTexto(carro.categoria);
  const motor = normalizarTexto(carro.motor);
  const cambio = normalizarTexto(carro.cambio);
  const potencia = normalizarTexto(carro.potencia_cv);

  let pontuacao = 0;

  if (modelo === textoBusca) {
    pontuacao += 100;
  } else if (modelo.startsWith(textoBusca)) {
    pontuacao += 80;
  } else if (modelo.includes(textoBusca)) {
    pontuacao += 60;
  }

  if (montadora === textoBusca) {
    pontuacao += 50;
  } else if (montadora.startsWith(textoBusca)) {
    pontuacao += 40;
  } else if (montadora.includes(textoBusca)) {
    pontuacao += 30;
  }

  if (categoria.includes(textoBusca)) {
    pontuacao += 20;
  }

  if (motor.includes(textoBusca)) {
    pontuacao += 15;
  }

  if (cambio.includes(textoBusca)) {
    pontuacao += 10;
  }

  if (potencia.includes(textoBusca)) {
    pontuacao += 5;
  }

  return pontuacao;
}

function obterPontuacaoEconomia(carro: Carro): number {
  const textoCompleto = normalizarTexto(
    `${carro.categoria} ${carro.motor} ${carro.consumo}`,
  );

  const valoresNumericos =
    carro.consumo
      .replaceAll(",", ".")
      .match(/\d+(?:\.\d+)?/g)
      ?.map(Number) ?? [];

  const maiorValor =
    valoresNumericos.length > 0
      ? Math.max(...valoresNumericos)
      : 0;

  if (textoCompleto.includes("eletrico")) {
    return 3000 + maiorValor;
  }

  if (textoCompleto.includes("hibrido")) {
    return 2000 + maiorValor;
  }

  return 1000 + maiorValor;
}

function IconeLocalizacao() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconeTelefone() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function IconeRelogio() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconeRota() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 5h5v5" />
      <path d="m19 5-9 9" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  );
}

function IconeMensagem() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

function IconeFacebook() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M13.7 22v-8h2.8l.4-3.2h-3.2V8.7c0-.9.3-1.6 1.7-1.6h1.7V4.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.4v2.4H7.6V14h2.8v8h3.3Z" />
    </svg>
  );
}

function IconeInstagram() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function IconeYoutube() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M21.5 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.5-4.8ZM10 15.2V8.8l5.5 3.2-5.5 3.2Z" />
    </svg>
  );
}

function IconeLinkedin() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M6.5 8.2H3.2V21h3.3V8.2ZM4.8 3A1.9 1.9 0 1 0 4.8 6.8 1.9 1.9 0 0 0 4.8 3ZM21 13.7c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2V8.2H9.3V21h3.3v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2.1 1.9 2.1 3.4V21H21v-7.3Z" />
    </svg>
  );
}

function IconeEscudo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 20 7v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V7l8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IlustracaoLojaCompacta() {
  return (
    <div className="relative h-64 overflow-hidden rounded-2xl bg-linear-to-b from-sky-300 via-sky-100 to-slate-200">
      <div className="absolute left-8 top-6 h-8 w-16 rounded-full bg-white/45 blur-xl" />

      <div className="absolute right-8 top-10 h-9 w-20 rounded-full bg-white/50 blur-xl" />

      <div className="absolute inset-x-0 bottom-0 h-16 bg-slate-400" />

      <div className="absolute inset-x-0 bottom-14 h-4 bg-slate-300" />

      <div className="absolute bottom-16 left-1/2 w-[80%] -translate-x-1/2">
        <div className="relative mx-auto h-24 w-32 rounded-t-lg border border-slate-300 bg-white shadow-lg">
          <div className="grid h-10 grid-cols-4 gap-1 p-2">
            <div className="bg-slate-700" />
            <div className="bg-slate-700" />
            <div className="bg-slate-700" />
            <div className="bg-slate-700" />
          </div>

          <div className="h-3 bg-blue-800" />

          <div className="grid grid-cols-3 gap-1.5 p-2">
            <div className="h-6 bg-slate-700" />
            <div className="h-6 bg-slate-700" />
            <div className="h-6 bg-slate-700" />
          </div>
        </div>

        <div className="relative -mt-1 rounded-lg border border-blue-950 bg-blue-800 px-4 py-3 shadow-xl">
          <div className="flex items-center justify-center rounded-md bg-white px-4 py-2">
            <Image
              src="/vroomly-logo.png"
              alt="Vroomly AutoStore"
              width={150}
              height={45}
              className="h-auto w-32 object-contain"
            />
          </div>

          <div className="mt-2 grid grid-cols-4 gap-1.5">
            <div className="h-8 rounded-t-md bg-slate-900" />
            <div className="h-8 rounded-t-md bg-slate-900" />
            <div className="h-8 rounded-t-md bg-slate-900" />
            <div className="h-8 rounded-t-md bg-slate-900" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-[8%] h-6 w-14 rounded-full bg-white shadow-lg">
        <div className="absolute -top-2 left-3 h-4 w-8 rounded-t-full bg-slate-200" />
        <div className="absolute -bottom-1 left-2 h-2.5 w-2.5 rounded-full bg-slate-950" />
        <div className="absolute -bottom-1 right-2 h-2.5 w-2.5 rounded-full bg-slate-950" />
      </div>

      <div className="absolute bottom-5 right-[8%] h-6 w-14 rounded-full bg-blue-700 shadow-lg">
        <div className="absolute -top-2 left-3 h-4 w-8 rounded-t-full bg-blue-400" />
        <div className="absolute -bottom-1 left-2 h-2.5 w-2.5 rounded-full bg-slate-950" />
        <div className="absolute -bottom-1 right-2 h-2.5 w-2.5 rounded-full bg-slate-950" />
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[8px] font-bold text-slate-700 shadow-md backdrop-blur">
        Imagem ilustrativa · Vroomly AutoStore
      </div>
    </div>
  );
}

function ListaLinksRodape({
  titulo,
  links,
}: Readonly<ListaLinksRodapeProps>) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200">
        {titulo}
      </h3>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${titulo}-${link.nome}`}>
            <Link
              href={link.href}
              className="text-sm text-slate-300 transition hover:text-white hover:underline"
            >
              {link.nome}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [busca, setBusca] = useState("");

  const [ordenacao, setOrdenacao] =
    useState<TipoOrdenacao>("relevancia");

  const [montadorasSelecionadas, setMontadorasSelecionadas] =
    useState<string[]>([]);

  const [categoriasSelecionadas, setCategoriasSelecionadas] =
    useState<string[]>([]);

  const [
    combustiveisSelecionados,
    setCombustiveisSelecionados,
  ] = useState<TipoCombustivel[]>([]);

  const [precoMaximo, setPrecoMaximo] = useState(
    PRECO_MAXIMO_CATALOGO,
  );

  const [carrosSelecionados, setCarrosSelecionados] =
    useState<number[]>([]);

  const [formularioContato, setFormularioContato] =
    useState<FormularioContato>(FORMULARIO_INICIAL);

  const [contatoEnviado, setContatoEnviado] =
    useState(false);

  const carrosExibidos = useMemo(() => {
    const textoBusca = normalizarTexto(busca);

    const carrosFiltrados = carros.filter((carro) => {
      const correspondeBusca =
        !textoBusca ||
        [
          carro.montadora,
          carro.modelo,
          carro.categoria,
          carro.motor,
          carro.cambio,
          carro.potencia_cv,
        ].some((campo) =>
          normalizarTexto(campo).includes(textoBusca),
        );

      const correspondeMontadora =
        montadorasSelecionadas.length === 0 ||
        montadorasSelecionadas.includes(carro.montadora);

      const correspondeCategoria =
        categoriasSelecionadas.length === 0 ||
        categoriasSelecionadas.includes(carro.categoria);

      const combustivel = identificarCombustivel(carro);

      const correspondeCombustivel =
        combustiveisSelecionados.length === 0 ||
        combustiveisSelecionados.includes(combustivel);

      const correspondePreco =
        carro.preco_a_partir_rs <= precoMaximo;

      return (
        correspondeBusca &&
        correspondeMontadora &&
        correspondeCategoria &&
        correspondeCombustivel &&
        correspondePreco
      );
    });

    if (ordenacao === "ano-mais-recente") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          carroB.ano - carroA.ano ||
          carroA.id - carroB.id,
      );
    }

    if (ordenacao === "menor-preco") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          carroA.preco_a_partir_rs -
          carroB.preco_a_partir_rs,
      );
    }

    if (ordenacao === "mais-economico") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          obterPontuacaoEconomia(carroB) -
            obterPontuacaoEconomia(carroA) ||
          carroA.preco_a_partir_rs -
            carroB.preco_a_partir_rs,
      );
    }

    if (ordenacao === "maior-preco") {
      return [...carrosFiltrados].sort(
        (carroA, carroB) =>
          carroB.preco_a_partir_rs -
          carroA.preco_a_partir_rs,
      );
    }

    return [...carrosFiltrados].sort(
      (carroA, carroB) =>
        obterPontuacaoRelevancia(carroB, textoBusca) -
          obterPontuacaoRelevancia(carroA, textoBusca) ||
        carros.findIndex((carro) => carro.id === carroA.id) -
          carros.findIndex((carro) => carro.id === carroB.id),
    );
  }, [
    busca,
    categoriasSelecionadas,
    combustiveisSelecionados,
    montadorasSelecionadas,
    ordenacao,
    precoMaximo,
  ]);

  const hrefComparacao =
    `/comparar?ids=${carrosSelecionados.join(",")}`;

  const existemFiltrosAtivos =
    montadorasSelecionadas.length > 0 ||
    categoriasSelecionadas.length > 0 ||
    combustiveisSelecionados.length > 0 ||
    precoMaximo < PRECO_MAXIMO_CATALOGO;

  function alternarMontadora(montadora: string): void {
    setMontadorasSelecionadas((atuais) =>
      atuais.includes(montadora)
        ? atuais.filter((item) => item !== montadora)
        : [...atuais, montadora],
    );
  }

  function alternarCategoria(categoria: string): void {
    setCategoriasSelecionadas((atuais) =>
      atuais.includes(categoria)
        ? atuais.filter((item) => item !== categoria)
        : [...atuais, categoria],
    );
  }

  function alternarCombustivel(
    combustivel: TipoCombustivel,
  ): void {
    setCombustiveisSelecionados((atuais) =>
      atuais.includes(combustivel)
        ? atuais.filter((item) => item !== combustivel)
        : [...atuais, combustivel],
    );
  }

  function limparFiltrosLaterais(): void {
    setMontadorasSelecionadas([]);
    setCategoriasSelecionadas([]);
    setCombustiveisSelecionados([]);
    setPrecoMaximo(PRECO_MAXIMO_CATALOGO);
  }

  function limparPesquisaCompleta(): void {
    setBusca("");
    setOrdenacao("relevancia");
    limparFiltrosLaterais();
  }

  function alternarComparacao(carroId: number): void {
    setCarrosSelecionados((atuais) => {
      if (atuais.includes(carroId)) {
        return atuais.filter((id) => id !== carroId);
      }

      if (atuais.length >= LIMITE_COMPARACAO) {
        return atuais;
      }

      return [...atuais, carroId];
    });
  }

  function limparComparacao(): void {
    setCarrosSelecionados([]);
  }

  function enviarContato(
    event: SyntheticEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    setContatoEnviado(true);
    setFormularioContato(FORMULARIO_INICIAL);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <Header />

        <CarrosselMarcas
          montadorasSelecionadas={montadorasSelecionadas}
          onAlternarMontadora={alternarMontadora}
        />

        <section className="pb-5 pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-160">
              <label
                htmlFor="busca-veiculos"
                className="sr-only"
              >
                Buscar veículos
              </label>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                id="busca-veiculos"
                type="search"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Buscar por modelo, montadora ou motor"
                className="h-14 w-full rounded-full border border-slate-300 bg-white pl-12 pr-5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div
              className="relative w-full shrink-0 transition-[width] duration-200 lg:w-auto"
              style={{
                width: larguraOrdenacao[ordenacao],
              }}
            >
              <label htmlFor="ordenacao" className="sr-only">
                Ordenar veículos
              </label>

              <select
                id="ordenacao"
                value={ordenacao}
                onChange={(event) =>
                  setOrdenacao(
                    event.target.value as TipoOrdenacao,
                  )
                }
                className="h-14 w-full appearance-none whitespace-nowrap rounded-full border border-slate-300 bg-white pl-6 pr-12 text-base font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="ano-mais-recente">
                  Ano mais recente
                </option>
                <option value="relevancia">
                  Relevância
                </option>
                <option value="menor-preco">
                  Menor preço
                </option>
                <option value="mais-economico">
                  Mais econômico
                </option>
                <option value="maior-preco">
                  Maior preço
                </option>
              </select>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 10 5 5 5-5" />
              </svg>
            </div>
          </div>

          {busca.trim() && (
            <p className="mt-3 text-xs text-slate-500">
              Resultados para &quot;{busca}&quot;
            </p>
          )}

          {montadorasSelecionadas.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">
                Montadoras selecionadas:
              </span>

              {montadorasSelecionadas.map((montadora) => (
                <button
                  key={montadora}
                  type="button"
                  onClick={() => alternarMontadora(montadora)}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-200"
                >
                  {montadora}
                  <span aria-hidden="true">×</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setMontadorasSelecionadas([])
                }
                className="text-xs font-semibold text-slate-500 transition hover:text-blue-700"
              >
                Limpar marcas
              </button>
            </div>
          )}

          {carrosSelecionados.length > 0 && (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-900">
                  {carrosSelecionados.length} de{" "}
                  {LIMITE_COMPARACAO} veículos selecionados
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Selecione de dois a três veículos para
                  comparar.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={limparComparacao}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Limpar seleção
                </button>

                {carrosSelecionados.length >= 2 ? (
                  <Link
                    href={hrefComparacao}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Comparar veículos
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-500"
                  >
                    Comparar veículos
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <section id="catalogo" className="scroll-mt-28">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Catálogo
            </h1>

            <p className="text-sm text-slate-500 sm:text-base">
              {obterTextoQuantidade(carrosExibidos.length)}
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-24">
              <FilterSidebar
                carros={carros}
                montadorasSelecionadas={
                  montadorasSelecionadas
                }
                categoriasSelecionadas={
                  categoriasSelecionadas
                }
                combustiveisSelecionados={
                  combustiveisSelecionados
                }
                precoMaximo={precoMaximo}
                onAlternarMontadora={alternarMontadora}
                onAlternarCategoria={alternarCategoria}
                onAlternarCombustivel={
                  alternarCombustivel
                }
                onPrecoMaximoChange={setPrecoMaximo}
                onLimparFiltros={limparFiltrosLaterais}
              />
            </div>

            <div className="min-w-0">
              {carrosExibidos.length > 0 ? (
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {carrosExibidos.map((carro) => {
                    const selecionado =
                      carrosSelecionados.includes(carro.id);

                    const comparacaoDesabilitada =
                      !selecionado &&
                      carrosSelecionados.length >=
                        LIMITE_COMPARACAO;

                    return (
                      <CarCard
                        key={carro.id}
                        carro={carro}
                        selecionado={selecionado}
                        comparacaoDesabilitada={
                          comparacaoDesabilitada
                        }
                        onAlternarComparacao={
                          alternarComparacao
                        }
                      />
                    );
                  })}
                </section>
              ) : (
                <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">
                    Nenhum veículo encontrado
                  </h2>

                  <p className="mt-2 text-slate-600">
                    Tente alterar a pesquisa ou selecionar
                    outros filtros.
                  </p>

                  <button
                    type="button"
                    onClick={limparPesquisaCompleta}
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Limpar pesquisa e filtros
                  </button>
                </section>
              )}
            </div>
          </div>
        </section>

        {existemFiltrosAtivos && (
          <div className="mt-6 text-center lg:hidden">
            <button
              type="button"
              onClick={limparFiltrosLaterais}
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}

        <div className="grid items-stretch gap-6 pt-10 lg:grid-cols-2">
          <section id="contato" className="scroll-mt-36">
            <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid h-full md:grid-cols-[0.78fr_1.22fr]">
                <div className="bg-slate-800 p-4 text-white sm:p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <IconeMensagem />
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-200">
                    Contato demonstrativo
                  </p>

                  <h2 className="mt-1.5 text-xl font-bold tracking-tight">
                    Entre em contato
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-slate-200">
                    Preencha o formulário e nossa equipe
                    entrará em contato.
                  </p>

                  <div className="mt-5 border-t border-white/20 pt-4">
                    <p className="text-xs font-bold">
                      Vroomly AutoStore
                    </p>

                    <a
                      href="tel:+551533332026"
                      className="mt-2 block text-sm font-bold text-white transition hover:text-slate-200"
                    >
                      (15) 3333-2026
                    </a>

                    <a
                      href="mailto:contato@vroomly.com.br"
                      className="mt-1 block break-all text-[10px] text-slate-200 transition hover:text-white"
                    >
                      contato@vroomly.com.br
                    </a>

                    <p className="mt-3 text-[9px] leading-4 text-slate-300">
                      Informações fictícias utilizadas para
                      demonstração.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={enviarContato}
                  className="flex h-full flex-col bg-slate-50 p-4 sm:p-5"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contato-nome"
                        className="mb-1 block text-[10px] font-bold text-slate-700"
                      >
                        Nome{" "}
                        <span className="text-red-600">*</span>
                      </label>

                      <input
                        id="contato-nome"
                        type="text"
                        required
                        value={formularioContato.nome}
                        onChange={(event) => {
                          setContatoEnviado(false);

                          setFormularioContato(
                            (formularioAtual) => ({
                              ...formularioAtual,
                              nome: event.target.value,
                            }),
                          );
                        }}
                        placeholder="Seu nome"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contato-telefone"
                        className="mb-1 block text-[10px] font-bold text-slate-700"
                      >
                        Telefone{" "}
                        <span className="text-red-600">*</span>
                      </label>

                      <input
                        id="contato-telefone"
                        type="tel"
                        required
                        value={formularioContato.telefone}
                        onChange={(event) => {
                          setContatoEnviado(false);

                          setFormularioContato(
                            (formularioAtual) => ({
                              ...formularioAtual,
                              telefone: event.target.value,
                            }),
                          );
                        }}
                        placeholder="(15) 99999-9999"
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label
                      htmlFor="contato-email"
                      className="mb-1 block text-[10px] font-bold text-slate-700"
                    >
                      E-mail{" "}
                      <span className="text-red-600">*</span>
                    </label>

                    <input
                      id="contato-email"
                      type="email"
                      required
                      value={formularioContato.email}
                      onChange={(event) => {
                        setContatoEnviado(false);

                        setFormularioContato(
                          (formularioAtual) => ({
                            ...formularioAtual,
                            email: event.target.value,
                          }),
                        );
                      }}
                      placeholder="seuemail@exemplo.com"
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div className="mt-3">
                    <label
                      htmlFor="contato-mensagem"
                      className="mb-1 block text-[10px] font-bold text-slate-700"
                    >
                      Mensagem{" "}
                      <span className="text-red-600">*</span>
                    </label>

                    <textarea
                      id="contato-mensagem"
                      required
                      rows={3}
                      value={formularioContato.mensagem}
                      onChange={(event) => {
                        setContatoEnviado(false);

                        setFormularioContato(
                          (formularioAtual) => ({
                            ...formularioAtual,
                            mensagem: event.target.value,
                          }),
                        );
                      }}
                      placeholder="Como podemos ajudar?"
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <label className="mt-3 flex cursor-pointer items-start gap-2 text-[9px] leading-4 text-slate-600">
                    <input
                      type="checkbox"
                      required
                      checked={formularioContato.aceitaLgpd}
                      onChange={(event) => {
                        setContatoEnviado(false);

                        setFormularioContato(
                          (formularioAtual) => ({
                            ...formularioAtual,
                            aceitaLgpd: event.target.checked,
                          }),
                        );
                      }}
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-slate-800"
                    />

                    <span>
                      Concordo com o uso das informações
                      somente para esta demonstração.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="mt-3 w-full rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
                  >
                    Enviar mensagem
                  </button>

                  {contatoEnviado && (
                    <output className="mt-3 block rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[10px] font-semibold text-green-800">
                      Mensagem enviada com sucesso! Formulário
                      demonstrativo.
                    </output>
                  )}
                </form>
              </div>
            </div>
          </section>

          <section id="endereco" className="scroll-mt-36">
            <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid h-full md:grid-cols-[1.15fr_0.85fr]">
                <div className="p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800">
                    Localização demonstrativa
                  </p>

                  <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950">
                    Vamos conversar?
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    Fale com nossa equipe de vendas
                  </p>

                  <a
                    href="tel:+551533332026"
                    className="mt-3 inline-flex items-center gap-2 text-base font-bold text-slate-800 transition hover:text-slate-950"
                  >
                    <IconeTelefone />
                    (15) 3333-2026
                  </a>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0 text-slate-800">
                        <IconeLocalizacao />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-950">
                          Vroomly AutoStore
                        </h3>

                        <a
                          href={URL_MAPA}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 block text-[11px] leading-4 text-slate-600 transition hover:text-slate-800 hover:underline"
                        >
                          {ENDERECO_FICTICIO}
                        </a>

                        <p className="mt-0.5 text-[9px] font-semibold text-amber-700">
                          Endereço fictício utilizado para
                          demonstração.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2">
                    <div className="mt-0.5 shrink-0 text-slate-800">
                      <IconeRelogio />
                    </div>

                    <div className="grid flex-1 grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                      <span className="text-slate-600">
                        Segunda a sexta
                      </span>
                      <strong className="text-slate-950">
                        9h às 19h
                      </strong>
                      <span className="text-slate-600">
                        Sábado
                      </span>
                      <strong className="text-slate-950">
                        9h às 16h
                      </strong>
                      <span className="text-slate-600">
                        Domingo
                      </span>
                      <strong className="text-slate-950">
                        Fechado
                      </strong>
                    </div>
                  </div>

                  <a
                    href={URL_MAPA}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-[10px] font-bold text-white shadow-sm transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
                  >
                    <IconeRota />
                    Abrir endereço no mapa
                  </a>
                </div>

                <div className="relative min-h-52 overflow-hidden bg-slate-200 md:min-h-full">
                  <iframe
                    title="Mapa ilustrativo da Vroomly AutoStore"
                    src={URL_MAPA_EMBED}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                  />

                  <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold text-slate-700 shadow-md backdrop-blur">
                    Mapa ilustrativo · Sorocaba/SP
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section
          id="sobre-nos"
          className="scroll-mt-36 pb-8 pt-8"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid items-center gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
                  Sobre nós
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Sobre a Vroomly AutoStore
                </h2>

                <h3 className="mt-4 text-base font-bold text-slate-700">
                  Nossa história
                </h3>

                <div className="mt-3 max-w-3xl space-y-2 text-xs leading-5 text-slate-600 sm:text-sm">
                  <p>
                    A{" "}
                    <strong className="text-slate-900">
                      Vroomly AutoStore
                    </strong>{" "}
                    nasceu em Sorocaba com o objetivo de
                    utilizar a tecnologia para tornar a escolha
                    de um veículo mais fácil, rápida e segura.
                  </p>

                  <p>
                    Criada como uma plataforma digital, a
                    Vroomly permite pesquisar veículos,
                    consultar informações técnicas e comparar
                    diferentes modelos antes da decisão de
                    compra.
                  </p>

                  <p>
                    Com a evolução da inteligência artificial,
                    desenvolvemos a{" "}
                    <strong className="text-blue-700">
                      VroomAI
                    </strong>
                    {", "}uma assistente virtual preparada para
                    responder dúvidas e indicar veículos de
                    acordo com as necessidades de cada cliente.
                  </p>

                  <p>
                    Hoje, reunimos catálogo, comparação e
                    inteligência artificial em uma experiência
                    moderna, simples e intuitiva.
                  </p>
                </div>

                <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold text-blue-800 sm:text-sm">
                    Tecnologia para pesquisar. Inteligência
                    para comparar. Confiança para escolher.
                  </p>
                </div>

                <p className="mt-3 text-[9px] font-semibold text-amber-700">
                  História e empresa fictícias criadas para
                  demonstração deste projeto.
                </p>
              </div>

              <div>
                <IlustracaoLojaCompacta />

                <div className="mt-4 flex items-center justify-end gap-2">
                  <span className="mr-1 text-xs font-semibold text-slate-500">
                    Siga-nos
                  </span>

                  <a
                    href="#sobre-nos"
                    aria-label="Facebook demonstrativo"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
                  >
                    <IconeFacebook />
                  </a>

                  <a
                    href="#sobre-nos"
                    aria-label="Instagram demonstrativo"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
                  >
                    <IconeInstagram />
                  </a>

                  <a
                    href="#sobre-nos"
                    aria-label="YouTube demonstrativo"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
                  >
                    <IconeYoutube />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-slate-800 text-white">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[0.9fr_0.9fr_0.9fr_1.2fr]">
            <ListaLinksRodape
              titulo="Vroomly"
              links={linksRodapeInstitucionais}
            />

            <ListaLinksRodape
              titulo="Serviços"
              links={linksRodapeServicos}
            />

            <ListaLinksRodape
              titulo="Ajuda"
              links={linksRodapeAjuda}
            />

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200">
                Acompanhe a Vroomly
              </h3>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="#rodape"
                  aria-label="YouTube demonstrativo"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 transition hover:-translate-y-1 hover:bg-blue-100 hover:text-blue-800"
                >
                  <IconeYoutube />
                </a>

                <a
                  href="#rodape"
                  aria-label="LinkedIn demonstrativo"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 transition hover:-translate-y-1 hover:bg-blue-100 hover:text-blue-800"
                >
                  <IconeLinkedin />
                </a>

                <a
                  href="#rodape"
                  aria-label="Facebook demonstrativo"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 transition hover:-translate-y-1 hover:bg-blue-100 hover:text-blue-800"
                >
                  <IconeFacebook />
                </a>

                <a
                  href="#rodape"
                  aria-label="Instagram demonstrativo"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 transition hover:-translate-y-1 hover:bg-blue-100 hover:text-blue-800"
                >
                  <IconeInstagram />
                </a>
              </div>

              <p className="mt-5 text-sm font-semibold text-slate-200">
                Pagamento demonstrativo:
              </p>

              <div className="mt-3 rounded-xl bg-white p-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-blue-700 px-3 py-1.5 text-[10px] font-black italic text-white">
                    VISA
                  </span>

                  <span className="rounded-md bg-red-600 px-3 py-1.5 text-[10px] font-black text-white">
                    MASTER
                  </span>

                  <span className="rounded-md bg-sky-600 px-3 py-1.5 text-[10px] font-black text-white">
                    ELO
                  </span>

                  <span className="rounded-md bg-slate-700 px-3 py-1.5 text-[10px] font-black text-white">
                    PIX
                  </span>

                  <span className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-black text-slate-700">
                    BOLETO
                  </span>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-blue-400/30 bg-blue-950/50 px-4 py-3">
                <div className="text-blue-300">
                  <IconeEscudo />
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Site demonstrativo seguro
                  </p>

                  <p className="mt-0.5 text-[10px] text-blue-200">
                    Projeto Vroomly AutoStore
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid items-center gap-6 border-t border-slate-600 pt-8 lg:grid-cols-[320px_1fr]">
            <Link
              href="/"
              aria-label="Ir para o início"
              className="inline-flex w-fit items-center rounded-xl bg-white px-5 py-3"
            >
              <Image
                src="/vroomly-logo.png"
                alt="Vroomly AutoStore"
                width={210}
                height={64}
                className="h-auto w-48 object-contain"
              />
            </Link>

            <div className="text-sm leading-6 text-slate-300">
              <p>
                A{" "}
                <strong className="text-white">
                  Vroomly AutoStore
                </strong>{" "}
                é uma plataforma demonstrativa desenvolvida
                para facilitar a pesquisa, comparação e escolha
                de veículos. O projeto reúne catálogo digital,
                ferramentas de comparação e a assistente
                inteligente VroomAI.
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Informações institucionais, contatos, endereço,
                redes sociais e formas de pagamento são
                fictícios e utilizados somente para
                demonstração.
              </p>
            </div>
          </div>
        </div>

        <div
          id="rodape"
          className="border-t border-slate-700 bg-slate-900"
        >
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-2 px-5 py-4 text-center text-xs text-slate-300 sm:px-6 md:flex-row md:text-left lg:px-8">
            <p>
              Copyright © 2026{" "}
              <strong className="text-white">
                Vroomly AutoStore
              </strong>
              {". "}Todos os direitos reservados.
            </p>

            <p>
              Plataforma fictícia criada para demonstração
              acadêmica.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
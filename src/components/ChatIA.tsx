"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from "react";

import ChatSidebar from "@/components/ChatSidebar";

import carrosData from "@/data/carros_catalogo.json";
import type { Carro } from "@/types/Carro";

interface FonteRag {
  readonly id: string;
  readonly arquivo: string;
  readonly trecho: number;
  readonly similaridade: number;
  readonly conteudo: string;
}

interface Mensagem {
  readonly id: string;
  readonly autor: "usuario" | "ia";
  readonly texto: string;
  readonly fontes?: FonteRag[];
  readonly veiculosRelacionados?: number[];
  readonly opcoesRefinamento?: string[];
  readonly opcoesVeiculos?: number[];
}

interface Conversa {
  readonly id: string;
  readonly titulo: string;
  readonly atualizadaEm: string;
  readonly mensagens: Mensagem[];
}

interface EstadoChat {
  readonly conversas: Conversa[];
  readonly conversaAtivaId: string;
  readonly historicoCarregado: boolean;
}

interface RespostaChat {
  readonly sucesso: boolean;
  readonly mensagem: string;
  readonly resultado?: {
    readonly pergunta: string;
    readonly resposta: string;
    readonly modelo: string;
    readonly fontes: FonteRag[];
  };
}

interface SugestoesPerguntasProps {
  readonly enviando: boolean;
  readonly onSelecionar: (sugestao: string) => void;
}

interface IconeAssistenteProps {
  readonly tamanho?: "pequeno" | "grande";
}

interface CardVeiculoChatProps {
  readonly carro: Carro;
}

interface FontesDiscretasProps {
  readonly fontes: FonteRag[];
}

const carros = carrosData as Carro[];

const CHAVE_HISTORICO = "autostore-ai-conversas";

const SUGESTOES_PERGUNTAS = [
  "Carros elétricos",
  "Melhor custo-benefício",
  "SUVs disponíveis",
];

const OPCOES_REFINAMENTO = [
  "Quero um SUV",
  "Quero um sedã",
  "Quero um carro elétrico",
  "Busco melhor custo-benefício",
];

const ESTADO_INICIAL: EstadoChat = {
  conversas: [],
  conversaAtivaId: "",
  historicoCarregado: false,
};

function criarId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function criarNovaConversa(): Conversa {
  return {
    id: criarId(),
    titulo: "Nova conversa",
    atualizadaEm: new Date().toISOString(),
    mensagens: [],
  };
}

function criarTituloConversa(pergunta: string): string {
  const limite = 42;

  if (pergunta.length <= limite) {
    return pergunta;
  }

  return `${pergunta.slice(0, limite).trim()}...`;
}

function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatarSimilaridade(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}

function separarLista(valor: string): string[] {
  return valor
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function identificarEnergia(carro: Carro): string {
  const texto = normalizarTexto(
    `${carro.motor} ${carro.desc}`,
  );

  if (texto.includes("hibrido")) {
    return "Híbrido";
  }

  if (
    texto.includes("eletrico") ||
    texto.includes("bateria")
  ) {
    return "Elétrico";
  }

  if (texto.includes("diesel")) {
    return "Diesel";
  }

  if (texto.includes("flex")) {
    return "Flex";
  }

  return "Gasolina";
}

function obterClasseEnergia(energia: string): string {
  if (
    energia === "Elétrico" ||
    energia === "Híbrido"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function obterClasseCor(cor: string): string {
  const corNormalizada = normalizarTexto(cor);

  if (corNormalizada.includes("branco")) {
    return "border-slate-300 bg-white";
  }

  if (corNormalizada.includes("prata")) {
    return "border-slate-400 bg-slate-300";
  }

  if (corNormalizada.includes("cinza")) {
    return "border-slate-500 bg-slate-500";
  }

  if (corNormalizada.includes("preto")) {
    return "border-slate-900 bg-slate-900";
  }

  if (corNormalizada.includes("azul")) {
    return "border-blue-900 bg-blue-900";
  }

  if (corNormalizada.includes("vermelho")) {
    return "border-red-700 bg-red-700";
  }

  if (corNormalizada.includes("verde")) {
    return "border-emerald-700 bg-emerald-700";
  }

  return "border-slate-400 bg-slate-200";
}

function perguntaPedeRecomendacao(
  pergunta: string,
): boolean {
  const texto = normalizarTexto(pergunta);

  const expressoes = [
    "qual carro",
    "qual veiculo",
    "me recomenda",
    "voce recomenda",
    "qual recomenda",
    "quero um carro",
    "quero comprar",
    "me ajude a escolher",
    "ajude a escolher",
    "qual devo comprar",
    "qual e melhor",
    "carro bom",
    "veiculo bom",
  ];

  return expressoes.some((expressao) =>
    texto.includes(expressao),
  );
}

function perguntaTemRestricaoClara(
  pergunta: string,
): boolean {
  const texto = normalizarTexto(pergunta);

  const mencionaModelo = carros.some((carro) => {
    const modelo = normalizarTexto(carro.modelo);
    const nomeCompleto = normalizarTexto(
      `${carro.montadora} ${carro.modelo}`,
    );

    return (
      texto.includes(nomeCompleto) ||
      texto.includes(modelo)
    );
  });

  const criteriosClaros = [
    "suv",
    "seda",
    "sedan",
    "hatch",
    "picape",
    "eletrico",
    "hibrido",
    "diesel",
    "flex",
    "gasolina",
    "autonomia",
    "consumo",
    "potencia",
    "preco",
    "orcamento",
    "custo-beneficio",
    "custo beneficio",
    "mais barato",
    "mais economico",
  ];

  const mencionaCriterio = criteriosClaros.some(
    (criterio) => texto.includes(criterio),
  );

  const mencionaValor = /\d/.test(texto);

  return (
    mencionaModelo ||
    mencionaCriterio ||
    mencionaValor
  );
}

function perguntaEhAmbigua(
  pergunta: string,
): boolean {
  return (
    perguntaPedeRecomendacao(pergunta) &&
    !perguntaTemRestricaoClara(pergunta)
  );
}

function encontrarOpcoesPorMontadora(
  pergunta: string,
): Carro[] {
  const texto = normalizarTexto(pergunta);

  const montadoras = Array.from(
    new Set(
      carros.map((carro) => carro.montadora),
    ),
  );

  const montadoraEncontrada = montadoras.find(
    (montadora) =>
      texto.includes(normalizarTexto(montadora)),
  );

  if (!montadoraEncontrada) {
    return [];
  }

  const carrosDaMontadora = carros.filter(
    (carro) =>
      normalizarTexto(carro.montadora) ===
      normalizarTexto(montadoraEncontrada),
  );

  const modeloFoiInformado =
    carrosDaMontadora.some((carro) => {
      const modelo = normalizarTexto(carro.modelo);
      const nomeCompleto = normalizarTexto(
        `${carro.montadora} ${carro.modelo}`,
      );

      return (
        texto.includes(nomeCompleto) ||
        texto.includes(modelo)
      );
    });

  if (modeloFoiInformado) {
    return [];
  }

  return carrosDaMontadora.slice(0, 3);
}

function encontrarVeiculosRelacionados(
  pergunta: string,
  resposta: string,
): number[] {
  const textoCompleto = normalizarTexto(
    `${pergunta} ${resposta}`,
  );

  const carrosOrdenados = [...carros].sort(
    (carroA, carroB) =>
      carroB.modelo.length - carroA.modelo.length,
  );

  const idsEncontrados: number[] = [];

  carrosOrdenados.forEach((carro) => {
    const modelo = normalizarTexto(carro.modelo);

    const nomeCompleto = normalizarTexto(
      `${carro.montadora} ${carro.modelo}`,
    );

    const encontrou =
      textoCompleto.includes(nomeCompleto) ||
      textoCompleto.includes(modelo);

    if (
      encontrou &&
      !idsEncontrados.includes(carro.id)
    ) {
      idsEncontrados.push(carro.id);
    }
  });

  return idsEncontrados.slice(0, 3);
}

function mensagemEhValida(
  valor: unknown,
): valor is Mensagem {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const mensagem = valor as Partial<Mensagem>;

  const veiculosValidos =
    mensagem.veiculosRelacionados === undefined ||
    (Array.isArray(mensagem.veiculosRelacionados) &&
      mensagem.veiculosRelacionados.every(
        (id) => typeof id === "number",
      ));

  const opcoesValidas =
    mensagem.opcoesRefinamento === undefined ||
    (Array.isArray(mensagem.opcoesRefinamento) &&
      mensagem.opcoesRefinamento.every(
        (opcao) => typeof opcao === "string",
      ));

  const opcoesVeiculosValidas =
    mensagem.opcoesVeiculos === undefined ||
    (Array.isArray(mensagem.opcoesVeiculos) &&
      mensagem.opcoesVeiculos.every(
        (id) => typeof id === "number",
      ));

  return (
    typeof mensagem.id === "string" &&
    (mensagem.autor === "usuario" ||
      mensagem.autor === "ia") &&
    typeof mensagem.texto === "string" &&
    veiculosValidos &&
    opcoesValidas &&
    opcoesVeiculosValidas
  );
}

function conversaEhValida(
  valor: unknown,
): valor is Conversa {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const conversa = valor as Partial<Conversa>;

  return (
    typeof conversa.id === "string" &&
    typeof conversa.titulo === "string" &&
    typeof conversa.atualizadaEm === "string" &&
    Array.isArray(conversa.mensagens) &&
    conversa.mensagens.every(mensagemEhValida)
  );
}

function carregarConversasSalvas(): Conversa[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const conteudoSalvo =
      window.localStorage.getItem(
        CHAVE_HISTORICO,
      );

    if (!conteudoSalvo) {
      return [];
    }

    const dados: unknown =
      JSON.parse(conteudoSalvo);

    if (!Array.isArray(dados)) {
      return [];
    }

    return dados.filter(conversaEhValida);
  } catch {
    return [];
  }
}

function IconeAssistente({
  tamanho = "pequeno",
}: IconeAssistenteProps) {
  const classes =
    tamanho === "grande"
      ? "h-16 w-16 rounded-2xl"
      : "h-12 w-12 rounded-xl";

  const tamanhoImagem =
    tamanho === "grande"
      ? "64px"
      : "48px";

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-blue-50 ${classes}`}
    >
      <Image
        src="/vroom-ai-icon.png"
        alt="VroomAI"
        fill
        sizes={tamanhoImagem}
        className="object-contain p-1"
      />
    </div>
  );
}

function IconeEnviar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  );
}

function IconeSugestao() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
      <path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z" />
    </svg>
  );
}

function CardVeiculoChat({
  carro,
}: CardVeiculoChatProps) {
  const energia = identificarEnergia(carro);
  const cores = separarLista(carro.cores).slice(0, 4);
  const itens = separarLista(carro.itens).slice(0, 3);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <Image
          src={`/${carro.imagem_arquivo}`}
          alt={`${carro.montadora} ${carro.modelo}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              {carro.montadora}
            </p>

            <h3 className="mt-1 truncate text-xl font-bold text-slate-950">
              {carro.modelo}
            </h3>
          </div>

          <span className="shrink-0 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {carro.categoria}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="mr-auto text-2xl font-bold text-slate-950">
            {formatarPreco(
              carro.preco_a_partir_rs,
            )}
          </p>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${obterClasseEnergia(
              energia,
            )}`}
          >
            {energia}
          </span>
        </div>

        <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">
              Consumo / autonomia
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {carro.consumo}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Potência
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {carro.potencia_cv}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Câmbio
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {carro.cambio}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Ano
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {carro.ano}
            </p>
          </div>
        </div>

        {cores.length > 0 && (
          <div className="mt-5">
            <p className="text-xs text-slate-500">
              Cores disponíveis
            </p>

            <div className="mt-2 flex items-center gap-2">
              {cores.map((cor) => (
                <span
                  key={cor}
                  title={cor}
                  aria-label={cor}
                  className={`h-5 w-5 rounded-full border ${obterClasseCor(
                    cor,
                  )}`}
                />
              ))}
            </div>
          </div>
        )}

        {itens.length > 0 && (
          <div className="mt-5 space-y-2">
            {itens.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 text-emerald-600"
                >
                  ✓
                </span>

                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            href={`/carros/${carro.id}`}
            className="flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-blue-500 hover:text-blue-600"
          >
            Ver detalhes
          </Link>

          <Link
            href={`/comparar?ids=${carro.id}`}
            className="flex items-center justify-center rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Comparar
          </Link>
        </div>
      </div>
    </article>
  );
}

function FontesDiscretas({
  fontes,
}: FontesDiscretasProps) {
  const fontesUnicas = fontes.filter(
    (fonte, indice, lista) =>
      lista.findIndex(
        (item) =>
          item.arquivo === fonte.arquivo &&
          item.trecho === fonte.trecho,
      ) === indice,
  );

  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <p className="mb-2 text-xs font-medium text-slate-500">
        Fontes:
      </p>

      <div className="flex flex-wrap gap-2">
        {fontesUnicas.map((fonte) => (
          <span
            key={`${fonte.id}-${fonte.trecho}`}
            title={`${fonte.arquivo} · Trecho ${
              fonte.trecho
            } · Relevância ${formatarSimilaridade(
              fonte.similaridade,
            )}\n\n${fonte.conteudo}`}
            className="inline-flex max-w-full cursor-help items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 4h12l4 4v12H4V4Z" />
              <path d="M16 4v4h4" />
              <path d="M8 13h8" />
              <path d="M8 17h5" />
            </svg>

            <span className="max-w-52 truncate">
              {fonte.arquivo.replace(".pdf", "")}
            </span>

            <span className="shrink-0 text-slate-400">
              · Trecho {fonte.trecho}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SugestoesPerguntas({
  enviando,
  onSelecionar,
}: SugestoesPerguntasProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SUGESTOES_PERGUNTAS.map((sugestao) => (
        <button
          key={sugestao}
          type="button"
          disabled={enviando}
          onClick={() => onSelecionar(sugestao)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IconeSugestao />

          {sugestao}
        </button>
      ))}
    </div>
  );
}

export default function ChatIA() {
  const [pergunta, setPergunta] =
    useState("");

  const [enviando, setEnviando] =
    useState(false);

  const [estadoChat, setEstadoChat] =
    useState<EstadoChat>(ESTADO_INICIAL);

  const fimMensagensRef =
    useRef<HTMLDivElement>(null);

  const {
    conversas,
    conversaAtivaId,
    historicoCarregado,
  } = estadoChat;

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      const conversasSalvas =
        carregarConversasSalvas();

      if (conversasSalvas.length > 0) {
        setEstadoChat({
          conversas: conversasSalvas,
          conversaAtivaId:
            conversasSalvas[0].id,
          historicoCarregado: true,
        });

        return;
      }

      const novaConversa =
        criarNovaConversa();

      setEstadoChat({
        conversas: [novaConversa],
        conversaAtivaId: novaConversa.id,
        historicoCarregado: true,
      });
    }, 0);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, []);

  useEffect(() => {
    if (
      !historicoCarregado ||
      conversas.length === 0
    ) {
      return;
    }

    window.localStorage.setItem(
      CHAVE_HISTORICO,
      JSON.stringify(conversas),
    );
  }, [conversas, historicoCarregado]);

  const conversaAtiva = useMemo(
    () =>
      conversas.find(
        (conversa) =>
          conversa.id === conversaAtivaId,
      ),
    [conversas, conversaAtivaId],
  );

  const conversasResumo = useMemo(
    () =>
      conversas.map((conversa) => ({
        id: conversa.id,
        titulo: conversa.titulo,
        atualizadaEm:
          conversa.atualizadaEm,
      })),
    [conversas],
  );

  useEffect(() => {
    fimMensagensRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    conversaAtiva?.mensagens.length,
    enviando,
  ]);

  function atualizarConversa(
    conversaId: string,
    atualizar: (
      conversa: Conversa,
    ) => Conversa,
  ): void {
    setEstadoChat((estadoAtual) => ({
      ...estadoAtual,
      conversas:
        estadoAtual.conversas.map(
          (conversa) =>
            conversa.id === conversaId
              ? atualizar(conversa)
              : conversa,
        ),
    }));
  }

  function adicionarMensagem(
    conversaId: string,
    mensagem: Mensagem,
    titulo?: string,
  ): void {
    atualizarConversa(
      conversaId,
      (conversa) => ({
        ...conversa,
        titulo: titulo ?? conversa.titulo,
        atualizadaEm:
          new Date().toISOString(),
        mensagens: [
          ...conversa.mensagens,
          mensagem,
        ],
      }),
    );
  }

  function iniciarNovaConversa(): void {
    if (enviando) {
      return;
    }

    const novaConversa =
      criarNovaConversa();

    setEstadoChat((estadoAtual) => ({
      ...estadoAtual,
      conversas: [
        novaConversa,
        ...estadoAtual.conversas,
      ],
      conversaAtivaId: novaConversa.id,
    }));

    setPergunta("");
  }

  function limparHistorico(): void {
    if (enviando) {
      return;
    }

    const confirmou = window.confirm(
      "Deseja realmente apagar todo o histórico de conversas?",
    );

    if (!confirmou) {
      return;
    }

    const novaConversa =
      criarNovaConversa();

    window.localStorage.removeItem(
      CHAVE_HISTORICO,
    );

    setEstadoChat({
      conversas: [novaConversa],
      conversaAtivaId: novaConversa.id,
      historicoCarregado: true,
    });

    setPergunta("");
  }

  function selecionarConversa(
    conversaId: string,
  ): void {
    if (enviando) {
      return;
    }

    setEstadoChat((estadoAtual) => ({
      ...estadoAtual,
      conversaAtivaId: conversaId,
    }));

    setPergunta("");
  }

  async function processarPergunta(
    perguntaAtual: string,
  ): Promise<void> {
    const perguntaLimpa =
      perguntaAtual.trim();

    if (
      !perguntaLimpa ||
      enviando ||
      !conversaAtiva
    ) {
      return;
    }

    const conversaId = conversaAtiva.id;

    const mensagemUsuario: Mensagem = {
      id: criarId(),
      autor: "usuario",
      texto: perguntaLimpa,
    };

    const titulo =
      conversaAtiva.titulo ===
      "Nova conversa"
        ? criarTituloConversa(
            perguntaLimpa,
          )
        : conversaAtiva.titulo;

    adicionarMensagem(
      conversaId,
      mensagemUsuario,
      titulo,
    );

    setPergunta("");

    const opcoesDaMontadora =
      encontrarOpcoesPorMontadora(
        perguntaLimpa,
      );

    if (opcoesDaMontadora.length > 1) {
      const nomeMontadora =
        opcoesDaMontadora[0].montadora;

      adicionarMensagem(conversaId, {
        id: criarId(),
        autor: "ia",
        texto: `Por favor, escolha qual dos modelos da ${nomeMontadora} você gostaria de conhecer melhor:`,
        opcoesVeiculos:
          opcoesDaMontadora.map(
            (carro) => carro.id,
          ),
      });

      return;
    }

    if (perguntaEhAmbigua(perguntaLimpa)) {
      adicionarMensagem(conversaId, {
        id: criarId(),
        autor: "ia",
        texto:
          "Posso ajudar você a escolher uma opção da nossa base. Para oferecer uma recomendação mais adequada, escolha uma preferência abaixo ou informe categoria, faixa de preço, tipo de energia ou uso principal do veículo.",
        opcoesRefinamento:
          OPCOES_REFINAMENTO,
      });

      return;
    }

    setEnviando(true);

    try {
      const respostaHttp = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            pergunta: perguntaLimpa,
          }),
        },
      );

      const dados =
        (await respostaHttp.json()) as RespostaChat;

      if (
        !respostaHttp.ok ||
        !dados.sucesso ||
        !dados.resultado
      ) {
        throw new Error(
          dados.mensagem ||
            "Não foi possível obter uma resposta do VroomAI.",
        );
      }

      const veiculosRelacionados =
        encontrarVeiculosRelacionados(
          perguntaLimpa,
          dados.resultado.resposta,
        );

      adicionarMensagem(conversaId, {
        id: criarId(),
        autor: "ia",
        texto:
          dados.resultado.resposta,
        fontes:
          dados.resultado.fontes,
        veiculosRelacionados,
      });
    } catch (error) {
      adicionarMensagem(conversaId, {
        id: criarId(),
        autor: "ia",
        texto:
          error instanceof Error
            ? error.message
            : "Não foi possível processar sua pergunta.",
      });
    } finally {
      setEnviando(false);
    }
  }

  async function enviarPergunta(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    await processarPergunta(pergunta);
  }

  async function usarSugestao(
    sugestao: string,
  ): Promise<void> {
    await processarPergunta(sugestao);
  }

  if (
    !historicoCarregado ||
    !conversaAtiva
  ) {
    return (
      <div className="flex min-h-150 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          Carregando conversas...
        </p>
      </div>
    );
  }

  const conversaVazia =
    conversaAtiva.mensagens.length === 0;

  return (
    <div className="grid min-h-[calc(100vh-118px)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <ChatSidebar
        conversas={conversasResumo}
        conversaAtivaId={conversaAtivaId}
        onNovaConversa={
          iniciarNovaConversa
        }
        onSelecionarConversa={
          selecionarConversa
        }
        onLimparHistorico={
          limparHistorico
        }
      />

      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex h-24 shrink-0 items-center justify-between border-b border-slate-200 px-7">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              aria-label="Abrir menu de conversas"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            <IconeAssistente />

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-950">
                VroomAI
              </h1>

              <p className="truncate text-sm text-slate-500">
                Catálogo da loja · respostas em
                tempo real
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 sm:flex">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3H3v5" />
              <path d="m3 3 6 6" />
              <path d="M16 21h5v-5" />
              <path d="m21 21-6-6" />
            </svg>

            Flutuante auto
          </div>
        </header>

        {conversaVazia ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-12">
            <IconeAssistente
              tamanho="grande"
            />

            <h2 className="mt-6 text-center text-3xl font-semibold tracking-tight text-slate-950">
              Como posso ajudar?
            </h2>

            <div className="mt-5">
              <SugestoesPerguntas
                enviando={enviando}
                onSelecionar={(sugestao) =>
                  void usarSugestao(
                    sugestao,
                  )
                }
              />
            </div>

            <form
              className="mt-6 flex h-18 w-full max-w-3xl items-center rounded-2xl border border-slate-200 bg-white px-3 pl-6 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"
              onSubmit={enviarPergunta}
            >
              <input
                type="text"
                aria-label="Pergunta para o VroomAI"
                placeholder="Pergunte sobre preços, consumo, cores, comparações..."
                value={pergunta}
                disabled={enviando}
                maxLength={1000}
                onChange={(event) =>
                  setPergunta(
                    event.target.value,
                  )
                }
                className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                aria-label="Enviar pergunta"
                disabled={
                  enviando ||
                  !pergunta.trim()
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                <IconeEnviar />
              </button>
            </form>
          </div>
        ) : (
          <>
            <div
              className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 px-8 py-7"
              aria-live="polite"
            >
              {conversaAtiva.mensagens.map(
                (mensagem) => {
                  const veiculosDaMensagem =
                    mensagem.veiculosRelacionados
                      ?.map((carroId) =>
                        carros.find(
                          (carro) =>
                            carro.id === carroId,
                        ),
                      )
                      .filter(
                        (
                          carro,
                        ): carro is Carro =>
                          carro !== undefined,
                      ) ?? [];

                  return (
                    <div
                      key={mensagem.id}
                      className={`flex ${
                        mensagem.autor ===
                        "usuario"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[86%] rounded-2xl px-5 py-4 text-sm leading-7 ${
                          mensagem.autor ===
                          "usuario"
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700 shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">
                          {mensagem.texto}
                        </p>

                        {mensagem.autor ===
                          "ia" &&
                          mensagem.opcoesVeiculos &&
                          mensagem.opcoesVeiculos
                            .length > 0 && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Só para confirmar
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                Qual destes veículos
                                você gostaria de
                                conhecer?
                              </p>

                              <div className="mt-4 space-y-2">
                                {mensagem.opcoesVeiculos.map(
                                  (
                                    carroId,
                                    indice,
                                  ) => {
                                    const carro =
                                      carros.find(
                                        (
                                          item,
                                        ) =>
                                          item.id ===
                                          carroId,
                                      );

                                    if (!carro) {
                                      return null;
                                    }

                                    return (
                                      <button
                                        key={
                                          carro.id
                                        }
                                        type="button"
                                        disabled={
                                          enviando
                                        }
                                        onClick={() =>
                                          void usarSugestao(
                                            `Quero saber mais sobre o ${carro.montadora} ${carro.modelo}.`,
                                          )
                                        }
                                        className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-700">
                                          {indice +
                                            1}
                                        </span>

                                        <span className="min-w-0 flex-1">
                                          <strong className="block truncate text-sm text-slate-900">
                                            {
                                              carro.montadora
                                            }{" "}
                                            {
                                              carro.modelo
                                            }
                                          </strong>

                                          <span className="mt-0.5 block text-xs text-slate-500">
                                            {formatarPreco(
                                              carro.preco_a_partir_rs,
                                            )}
                                          </span>
                                        </span>

                                        <svg
                                          aria-hidden="true"
                                          viewBox="0 0 24 24"
                                          className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                        >
                                          <path d="m9 18 6-6-6-6" />
                                        </svg>
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          )}

                        {mensagem.autor ===
                          "ia" &&
                          mensagem.opcoesRefinamento &&
                          mensagem
                            .opcoesRefinamento
                            .length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {mensagem.opcoesRefinamento.map(
                                (opcao) => (
                                  <button
                                    key={
                                      opcao
                                    }
                                    type="button"
                                    disabled={
                                      enviando
                                    }
                                    onClick={() =>
                                      void usarSugestao(
                                        opcao,
                                      )
                                    }
                                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {opcao}
                                  </button>
                                ),
                              )}
                            </div>
                          )}

                        {mensagem.autor ===
                          "ia" &&
                          veiculosDaMensagem.length >
                            0 && (
                            <div
                              className={`mt-5 grid gap-4 ${
                                veiculosDaMensagem.length >
                                1
                                  ? "xl:grid-cols-2"
                                  : "grid-cols-1"
                              }`}
                            >
                              {veiculosDaMensagem.map(
                                (carro) => (
                                  <CardVeiculoChat
                                    key={
                                      carro.id
                                    }
                                    carro={
                                      carro
                                    }
                                  />
                                ),
                              )}
                            </div>
                          )}

                        {mensagem.fontes &&
                          mensagem.fontes.length >
                            0 && (
                            <FontesDiscretas
                              fontes={
                                mensagem.fontes
                              }
                            />
                          )}
                      </div>
                    </div>
                  );
                },
              )}

              {enviando && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-blue-50">
                      <Image
                        src="/vroom-ai-icon.png"
                        alt="VroomAI"
                        fill
                        sizes="28px"
                        className="object-contain p-0.5"
                      />
                    </div>

                    VroomAI está analisando os
                    documentos...
                  </div>
                </div>
              )}

              <div ref={fimMensagensRef} />
            </div>

            <div className="border-t border-slate-200 bg-white px-6 py-4">
              <SugestoesPerguntas
                enviando={enviando}
                onSelecionar={(sugestao) =>
                  void usarSugestao(
                    sugestao,
                  )
                }
              />

              <form
                className="mx-auto mt-4 flex h-18 w-full max-w-3xl items-center rounded-2xl border border-slate-200 bg-white px-3 pl-6 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"
                onSubmit={enviarPergunta}
              >
                <input
                  type="text"
                  aria-label="Pergunta para o VroomAI"
                  placeholder="Pergunte sobre preços, consumo, cores, comparações..."
                  value={pergunta}
                  disabled={enviando}
                  maxLength={1000}
                  onChange={(event) =>
                    setPergunta(
                      event.target.value,
                    )
                  }
                  className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
                />

                <button
                  type="submit"
                  aria-label="Enviar pergunta"
                  disabled={
                    enviando ||
                    !pergunta.trim()
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  <IconeEnviar />
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
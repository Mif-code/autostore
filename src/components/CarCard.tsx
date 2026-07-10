import Image from "next/image";
import Link from "next/link";

import type { Carro } from "@/types/Carro";

interface CarCardProps {
  readonly carro: Carro;
  readonly selecionado: boolean;
  readonly comparacaoDesabilitada: boolean;
  readonly onAlternarComparacao: (carroId: number) => void;
}

export default function CarCard({
  carro,
  selecionado,
  comparacaoDesabilitada,
  onAlternarComparacao,
}: CarCardProps) {
  const nomeCompleto = `${carro.montadora} ${carro.modelo}`;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        selecionado
          ? "border-blue-600 ring-2 ring-blue-100"
          : "border-zinc-200"
      }`}
    >
      <div className="relative h-56 w-full">
        <Image
          src={`/${carro.imagem_arquivo}`}
          alt={nomeCompleto}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {selecionado && (
          <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">
            Selecionado
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-sm font-medium text-blue-600">
          {carro.montadora}
        </p>

        <h2 className="mt-1 text-2xl font-bold text-zinc-900">
          {carro.modelo}
        </h2>

        <div className="mt-4 space-y-2 text-sm text-zinc-600">
          <p>Ano: {carro.ano}</p>
          <p>Categoria: {carro.categoria}</p>
          <p>Motor: {carro.motor}</p>
        </div>

        <p className="mt-5 text-xl font-bold text-zinc-900">
          R$ {carro.preco_a_partir_rs.toLocaleString("pt-BR")}
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/carros/${carro.id}`}
            className="flex flex-1 items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Ver detalhes
          </Link>

          <button
            type="button"
            aria-pressed={selecionado}
            disabled={comparacaoDesabilitada}
            onClick={() => onAlternarComparacao(carro.id)}
            className={`flex flex-1 items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              selecionado
                ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                : "border-blue-600 bg-white text-blue-600 hover:bg-blue-50"
            } disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400`}
          >
            {selecionado ? "Remover" : "Comparar"}
          </button>
        </div>
      </div>
    </article>
  );
}
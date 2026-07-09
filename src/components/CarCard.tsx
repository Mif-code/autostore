import Image from "next/image";
import { Carro } from "@/types/Carro";

interface CarCardProps {
  readonly carro: Carro;
}

export default function CarCard({ carro }: CarCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-56 w-full">
        <Image
          src={`/${carro.imagem_arquivo}`}
          alt={`${carro.montadora} ${carro.modelo}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="p-5">
        <p className="text-sm font-medium text-blue-600">{carro.montadora}</p>

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
      </div>
    </article>
  );
}
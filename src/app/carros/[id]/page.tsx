import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import carrosData from "@/data/carros_catalogo.json";
import { Carro } from "@/types/Carro";

interface CarroDetalhesPageProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export default async function CarroDetalhesPage({
  params,
}: CarroDetalhesPageProps) {
  const { id } = await params;

  const carros = carrosData as Carro[];
  const carro = carros.find((item) => item.id === Number(id));

  if (!carro) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link href="/" className="text-sm font-semibold text-blue-600">
          ← Voltar para os veículos
        </Link>

        <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="relative h-96 w-full">
            <Image
              src={`/${carro.imagem_arquivo}`}
              alt={`${carro.montadora} ${carro.modelo}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          <div className="p-8">
            <p className="text-sm font-medium text-blue-600">
              {carro.montadora}
            </p>

            <h1 className="mt-2 text-4xl font-bold text-zinc-900">
              {carro.modelo}
            </h1>

            <p className="mt-4 text-2xl font-bold text-zinc-900">
              R$ {carro.preco_a_partir_rs.toLocaleString("pt-BR")}
            </p>

            <div className="mt-8 grid gap-4 text-zinc-700 md:grid-cols-2">
              <p>Ano: {carro.ano}</p>
              <p>Categoria: {carro.categoria}</p>
              <p>Motor: {carro.motor}</p>
              <p>Potência: {carro.potencia_cv}</p>
              <p>Câmbio: {carro.cambio}</p>
              <p>Consumo: {carro.consumo}</p>
              <p>Cores: {carro.cores}</p>
              <p>Itens: {carro.itens}</p>
            </div>

            <p className="mt-8 text-zinc-700">{carro.desc}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";

import CarDetails from "@/components/CarDetails";
import Header from "@/components/Header";

import carrosData from "@/data/carros_catalogo.json";
import type { Carro } from "@/types/Carro";

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

  const carro = carros.find(
    (item) => item.id === Number(id),
  );

  if (!carro) {
    notFound();
  }

  const semelhantes = carros
    .filter(
      (item) =>
        item.id !== carro.id &&
        (item.categoria === carro.categoria ||
          item.montadora === carro.montadora),
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <Header />

        <div className="py-7">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            <span aria-hidden="true">←</span>{" "}
            Voltar ao catálogo
          </Link>

          <div className="mt-5">
            <CarDetails
              carro={carro}
              semelhantes={semelhantes}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
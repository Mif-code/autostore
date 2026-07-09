"use client";

import { useState } from "react";
import Link from "next/link";

import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CarCard from "@/components/CarCard";

import carrosData from "@/data/carros_catalogo.json";
import { Carro } from "@/types/Carro";

export default function Home() {
  const [busca, setBusca] = useState("");

  const carros = carrosData as Carro[];

  const carrosFiltrados = carros.filter((carro) => {
    const textoBusca = busca.toLowerCase();

    return (
      carro.montadora.toLowerCase().includes(textoBusca) ||
      carro.modelo.toLowerCase().includes(textoBusca) ||
      carro.categoria.toLowerCase().includes(textoBusca)
    );
  });

  return (
    <main className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Header />

        <div className="my-8 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchBar
              busca={busca}
              onBuscaChange={setBusca}
            />
          </div>

          <Link
            href="/chat/new"
            className="flex min-h-18 items-center justify-center rounded-2xl bg-blue-600 px-8 font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Conversar com VroomAI
          </Link>
        </div>

        {carrosFiltrados.length > 0 ? (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {carrosFiltrados.map((carro) => (
              <CarCard
                key={carro.id}
                carro={carro}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900">
              Nenhum veículo encontrado
            </h2>

            <p className="mt-2 text-zinc-600">
              Tente pesquisar por outra marca, modelo ou categoria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
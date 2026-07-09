"use client";

import { useState } from "react";
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

        <div className="my-8">
          <SearchBar busca={busca} onBuscaChange={setBusca} />
        </div>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {carrosFiltrados.map((carro) => (
            <CarCard key={carro.id} carro={carro} />
          ))}
        </section>
      </div>
    </main>
  );
}
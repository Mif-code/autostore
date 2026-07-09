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
    <main>
      <Header />

      <SearchBar busca={busca} onBuscaChange={setBusca} />

      <section>
        {carrosFiltrados.map((carro) => (
          <CarCard key={carro.id} carro={carro} />
        ))}
      </section>
    </main>
  );
}
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CarCard from "@/components/CarCard";
import carrosData from "@/data/carros_catalogo.json";
import { Carro } from "@/types/Carro";

export default function Home() {
  const carros = carrosData as Carro[];

  return (
    <main>
      <Header />
      <SearchBar />

      <section>
        {carros.map((carro) => (
          <CarCard key={carro.id} carro={carro} />
        ))}
      </section>
    </main>
  );
}
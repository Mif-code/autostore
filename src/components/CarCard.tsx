import { Carro } from "@/types/Carro";

interface CarCardProps {
  readonly carro: Carro;
}

export default function CarCard({ carro }: CarCardProps) {
  return (
    <article>
      <h2>
        {carro.montadora} {carro.modelo}
      </h2>

      <p>Ano: {carro.ano}</p>

      <p>Categoria: {carro.categoria}</p>

      <p>Motor: {carro.motor}</p>

      <p>
        Preço a partir de: R$ {carro.preco_a_partir_rs.toLocaleString("pt-BR")}
      </p>
    </article>
  );
}
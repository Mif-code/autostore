interface SearchBarProps {
  readonly busca: string;
  readonly onBuscaChange: (valor: string) => void;
}

export default function SearchBar({ busca, onBuscaChange }: SearchBarProps) {
  return (
    <section>
      <form onSubmit={(event) => event.preventDefault()}>
        <input
          type="text"
          placeholder="Digite marca, modelo ou categoria..."
          value={busca}
          onChange={(event) => onBuscaChange(event.target.value)}
        />

        <button type="submit">Buscar</button>
      </form>
    </section>
  );
}
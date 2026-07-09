interface SearchBarProps {
  readonly busca: string;
  readonly onBuscaChange: (valor: string) => void;
}

export default function SearchBar({ busca, onBuscaChange }: SearchBarProps) {
  return (
    <section className="w-full">
      <form
        className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600 focus:bg-white"
          type="text"
          placeholder="Digite marca, modelo ou categoria..."
          value={busca}
          onChange={(event) => onBuscaChange(event.target.value)}
        />

        <button
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          type="submit"
        >
          Buscar
        </button>
      </form>
    </section>
  );
}
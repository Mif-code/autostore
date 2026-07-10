interface SearchBarProps {
  readonly busca: string;
  readonly onBuscaChange: (valor: string) => void;
}

export default function SearchBar({
  busca,
  onBuscaChange,
}: SearchBarProps) {
  return (
    <form
      className="relative w-full"
      onSubmit={(event) => event.preventDefault()}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>

      <input
        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        type="search"
        aria-label="Pesquisar veículos"
        placeholder="Busque por marca, modelo, categoria ou motor"
        value={busca}
        onChange={(event) => onBuscaChange(event.target.value)}
      />
    </form>
  );
}
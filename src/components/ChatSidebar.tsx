interface ConversaResumo {
  readonly id: string;
  readonly titulo: string;
  readonly atualizadaEm: string;
}

interface ChatSidebarProps {
  readonly conversas: ConversaResumo[];
  readonly conversaAtivaId: string;
  readonly onNovaConversa: () => void;
  readonly onSelecionarConversa: (conversaId: string) => void;
}

function formatarData(dataIso: string): string {
  const data = new Date(dataIso);

  if (Number.isNaN(data.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

export default function ChatSidebar({
  conversas,
  conversaAtivaId,
  onNovaConversa,
  onSelecionarConversa,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full min-h-130 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={onNovaConversa}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>

        Nova conversa
      </button>

      <div className="mt-5">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Histórico
        </p>
      </div>

      <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
        {conversas.length > 0 ? (
          conversas.map((conversa) => {
            const ativa = conversa.id === conversaAtivaId;

            return (
              <button
                key={conversa.id}
                type="button"
                onClick={() =>
                  onSelecionarConversa(conversa.id)
                }
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  ativa
                    ? "border-blue-200 bg-blue-50"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p
                  className={`truncate text-sm font-semibold ${
                    ativa
                      ? "text-blue-700"
                      : "text-slate-800"
                  }`}
                >
                  {conversa.titulo}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatarData(conversa.atualizadaEm)}
                </p>
              </button>
            );
          })
        ) : (
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-sm font-medium text-slate-700">
              Nenhuma conversa salva
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Inicie uma conversa com o AutoStoreAI para criar o
              histórico.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs leading-relaxed text-slate-500">
          O histórico é salvo somente neste navegador.
        </p>
      </div>
    </aside>
  );
}
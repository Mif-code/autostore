export default function ChatIA() {
  return (
    <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-zinc-900">VroomAI</h2>

      <p className="mt-2 text-zinc-600">
        Assistente inteligente para ajudar o usuário a escolher o veículo ideal.
      </p>

      <div className="mt-5 rounded-xl bg-zinc-100 p-4 text-zinc-700">
        Olá! Me diga o que você procura em um carro. Exemplo: “quero um SUV
        econômico para família”.
      </div>

      <form className="mt-5 flex gap-3">
        <input
          className="flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none focus:border-blue-600"
          type="text"
          placeholder="Digite sua pergunta..."
        />

        <button
          className="rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700"
          type="submit"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
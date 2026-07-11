import Header from "@/components/Header";
import ChatIA from "@/components/ChatIA";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <Header />

        <section className="mt-7">
          <ChatIA />
        </section>
      </div>
    </main>
  );
}
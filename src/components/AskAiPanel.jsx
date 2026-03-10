import { useState } from "react";
import { Bot, SendHorizonal, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { askAi } from "../services/aiService";

const AskAiPanel = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ask me: Show today's appointments, Find customer John, or appointment trends."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", content: currentPrompt }]);
    setLoading(true);

    try {
      const response = await askAi(currentPrompt);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer },
        ...(response.result?.length
          ? [{ role: "assistant", content: `Data points returned: ${response.result.length}` }]
          : [])
      ]);
    } catch (error) {
      toast.error(error.message || "Failed to ask AI assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass neon-border rounded-2xl p-4">
      <div className="mb-4 flex items-center gap-2 text-white">
        <Bot size={16} className="text-electric" />
        <h3 className="font-display text-base font-semibold">Ask AI</h3>
      </div>

      <div className="mb-4 h-64 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role !== "user" ? <Bot size={16} className="mt-1 text-violet" /> : null}
            <p
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                message.role === "user" ? "bg-electric/20 text-blue-50" : "bg-white/5 text-blue-100"
              }`}
            >
              {message.content}
            </p>
            {message.role === "user" ? <UserRound size={16} className="mt-1 text-electric" /> : null}
          </div>
        ))}
        {loading ? <p className="text-sm text-blue-100/60">Thinking...</p> : null}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Type your CRM question..."
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-blue-100/45 focus:border-electric/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-electric to-violet px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <SendHorizonal size={16} />
        </button>
      </form>
    </section>
  );
};

export default AskAiPanel;

import React, { useState } from "react";
import api from "../lib/api";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about appointments, medicines, orders." },
  ]);

  async function send() {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: "me", text: q }]);
    setText("");
    try {
      const { data } = await api.post("/chatbot/ask", { text: q });
      setMessages((m) => [...m, { from: "bot", text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Sorry, I couldn't respond. Try again." }]);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-[320px] h-[420px] bg-white border border-slate-300 rounded-2xl shadow-lg flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-slate-800 text-white font-semibold flex items-center justify-between">
            <div>Help Bot</div>
            <button className="text-white/80 hover:text-white" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="flex-1 p-3 overflow-auto space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className={m.from === "me" ? "text-right" : "text-left"}>
                <div
                  className={
                    "inline-block px-3 py-2 rounded-2xl text-sm " +
                    (m.from === "me" ? "bg-sky-200" : "bg-slate-100")
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-200 flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-300"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type here..."
              onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
            />
            <button className="px-3 py-2 rounded-xl bg-slate-800 text-white" onClick={send}>
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="px-4 py-3 rounded-2xl bg-slate-800 text-white shadow-lg hover:opacity-90"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Chat"}
      </button>
    </div>
  );
}

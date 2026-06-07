"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
  error?: boolean;
}

function getTime() {
  const n = new Date();
  return `${n.getHours()}:${String(n.getMinutes()).padStart(2, "0")}`;
}

const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Olá! Sou o assistente da AutoFlow, alimentado por IA (Groq + LLaMA). Como posso te ajudar hoje?",
    isUser: false,
    time: getTime(),
  },
];

function PulseDot() {
  return (
    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
  );
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--text-dim)", animation: `bounce 1.2s ${delay}s infinite` }} />
  );
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = { id: Date.now(), text, isUser: true, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: SESSION_ID }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro desconhecido");

      const botMsg: Message = {
        id: Date.now() + 1,
        text: data.text,
        isUser: false,
        time: getTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: Date.now() + 1,
        text: "Não consegui conectar ao agente. Verifique se o fluxo n8n está ativo e publicado.",
        isUser: false,
        time: getTime(),
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 100) + "px";
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <div style={{ width: "393px", height: "852px", background: "var(--bg)", borderRadius: "44px", border: "1.5px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 0 80px rgba(0,230,118,0.06), 0 40px 80px rgba(0,0,0,0.6)" }}>

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px 8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "var(--text-dim)" }}>
          <span>9:41</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span>●●●</span>
            <div style={{ width: "22px", height: "11px", border: "1.5px solid var(--text-dim)", borderRadius: "3px", display: "flex", alignItems: "center", padding: "1.5px" }}>
              <div style={{ width: "75%", height: "100%", background: "var(--green)", borderRadius: "2px" }} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div style={{ padding: "12px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px", background: "var(--surface)" }}>
          <button style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--surface2)", border: "none", cursor: "pointer", color: "var(--text)", fontSize: "18px" }}>‹</button>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#00E676,#00BFA5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#000", flexShrink: 0 }}>AF</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 600 }}>AutoFlow Bot</div>
            <div style={{ fontSize: "11px", color: "var(--green)", display: "flex", alignItems: "center", gap: "4px", fontFamily: "'JetBrains Mono', monospace" }}>
              <PulseDot /> agente ativo
            </div>
          </div>
          <div style={{ fontSize: "10px", background: "rgba(0,230,118,0.1)", color: "var(--green)", border: "1px solid rgba(0,230,118,0.2)", padding: "3px 10px", borderRadius: "999px", fontFamily: "'JetBrains Mono', monospace" }}>
            Groq · LLaMA
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: "10px", scrollbarWidth: "none" }}>
          <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-dim)", fontFamily: "'JetBrains Mono', monospace" }}>
            HOJE · {getTime()}
          </div>

          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", gap: "3px", maxWidth: "78%", alignSelf: msg.isUser ? "flex-end" : "flex-start", alignItems: msg.isUser ? "flex-end" : "flex-start", animation: "fadeUp 0.3s ease" }}>
              <div style={{
                padding: "11px 15px", borderRadius: "18px", fontSize: "14px", lineHeight: 1.5,
                background: msg.error ? "#2a1a1a" : msg.isUser ? "var(--green)" : "var(--surface2)",
                color: msg.isUser ? "#000" : msg.error ? "#ff6b6b" : "var(--text)",
                fontWeight: msg.isUser ? 500 : 400,
                border: msg.isUser ? "none" : msg.error ? "1px solid #ff6b6b33" : "1px solid var(--border)",
                borderBottomRightRadius: msg.isUser ? "4px" : "18px",
                borderBottomLeftRadius: msg.isUser ? "18px" : "4px",
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: "4px" }}>
                {msg.time}
                {msg.isUser && <span style={{ color: "var(--green)" }}>✓✓</span>}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", padding: "12px 16px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "18px", borderBottomLeftRadius: "4px" }}>
              <TypingDot delay={0} />
              <TypingDot delay={0.2} />
              <TypingDot delay={0.4} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ flex: 1, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "24px", display: "flex", alignItems: "center", padding: "10px 16px" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isTyping ? "Aguardando resposta..." : "Digite uma mensagem..."}
              disabled={isTyping}
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: isTyping ? "var(--text-dim)" : "var(--text)", fontFamily: "'Syne', sans-serif", fontSize: "14px", resize: "none", lineHeight: 1.4, maxHeight: "100px", cursor: isTyping ? "not-allowed" : "text" }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={isTyping}
            aria-label="Enviar mensagem"
            style={{ width: "42px", height: "42px", borderRadius: "50%", background: isTyping ? "var(--surface2)" : "var(--green)", border: "none", cursor: isTyping ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isTyping ? "var(--text-dim)" : "#000"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }
        @keyframes bounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-5px); } }
        textarea::placeholder { color: var(--text-dim); }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  );
}
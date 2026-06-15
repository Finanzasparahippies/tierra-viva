"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AssistantChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy la abejita asistente de Tierra Viva. 🐝 ¿En qué puedo ayudarte hoy? Te puedo dar detalles de nuestros animales apadrinables, talleres de sustentabilidad o productos orgánicos.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to state
    const updatedMessages = [...messages, { role: "user", content: userMsg } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error("Fallo en la comunicación con el servidor");
      }

      const data = await response.json();
      const botReply = data.reply || "Lo lamento, no pude procesar tu respuesta en este momento.";
      
      setMessages((prev) => [...prev, { role: "assistant", content: botReply }]);
    } catch (error) {
      console.error("Error calling assistant API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento mucho, parece que tengo problemas de conexión con el santuario. Por favor, intenta de nuevo en unos momentos. 🌻",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end font-sans">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-zinc-800 rounded-2xl shadow-2xl mb-4 w-[340px] h-[450px] overflow-hidden flex flex-col transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="p-4 bg-emerald-800 dark:bg-emerald-950 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              {/* Animated Bee Icon */}
              <div className="bg-emerald-700/50 p-1.5 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-amber-300">
                  <ellipse cx="9" cy="8" rx="2" ry="4" transform="rotate(-30 9 8)" fill="#e0f2fe" opacity="0.8" />
                  <ellipse cx="14" cy="8" rx="2" ry="4" transform="rotate(30 14 8)" fill="#e0f2fe" opacity="0.8" />
                  <ellipse cx="12" cy="13" rx="5" ry="3.5" />
                  <path d="M10.5 10.5v5M13.5 10.5v5" stroke="#000" strokeWidth="1" />
                  <polygon points="16,13 18.5,13 16,14" fill="#000" />
                  <circle cx="8.5" cy="13" r="0.7" fill="#fff" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Asistente Zumbón</h4>
                <p className="text-[10px] text-emerald-200">En línea • Tierra Viva</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/10 w-7 h-7 rounded-full flex items-center justify-center transition-all text-lg font-bold"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-emerald-700 text-white rounded-tr-none" 
                      : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none border border-emerald-50/50 dark:border-zinc-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 text-zinc-500 rounded-2xl rounded-tl-none p-3 border border-emerald-50/50 dark:border-zinc-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-emerald-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntame sobre el rancho..."
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-emerald-100 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-700 transition-colors"
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-800 hover:bg-emerald-700 text-white p-2.5 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center shadow-md shadow-emerald-800/10 cursor-pointer"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Bubble Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all relative border border-white/10 cursor-pointer"
      >
        {isOpen ? (
          <span className="text-2xl font-bold">×</span>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}

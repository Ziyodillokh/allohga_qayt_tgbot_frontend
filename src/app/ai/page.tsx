"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Bot,
  User,
  Trash2,
  ArrowLeft,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/hooks";
import { aiApi } from "@/lib/api";
import { isTelegramWebApp } from "@/lib/telegram";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface AIUsage {
  used: number;
  limit: number;
  remaining: number;
}

export default function AIPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [usage, setUsage] = useState<AIUsage | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Note: No redirect - allow users to use AI even if not fully authenticated
  // Telegram WebApp users are auto-authenticated

  // Load chat history
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadHistory = async () => {
      try {
        const [historyRes, usageRes] = await Promise.all([
          aiApi.getHistory(1, 50),
          aiApi.getUsage(),
        ]);

        const history = historyRes.data.chats || historyRes.data || [];
        const formattedMessages: Message[] = [];

        history.reverse().forEach((chat: any) => {
          formattedMessages.push({
            id: `${chat.id}-user`,
            role: "user",
            content: chat.message,
            createdAt: chat.createdAt,
          });
          formattedMessages.push({
            id: `${chat.id}-assistant`,
            role: "assistant",
            content: chat.response,
            createdAt: chat.createdAt,
          });
        });

        setMessages(formattedMessages);
        setUsage(usageRes.data);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [isAuthenticated]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await aiApi.chat(userMessage.content);

      const assistantMessage: Message = {
        id: `${data.id}-assistant`,
        role: "assistant",
        content: data.response,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update usage
      if (usage) {
        setUsage({
          ...usage,
          used: usage.used + 1,
          remaining: usage.remaining - 1,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear history
  const clearHistory = async () => {
    if (!window.confirm("Chat tarixini o'chirmoqchimisiz?")) return;

    try {
      await aiApi.clearHistory();
      setMessages([]);
      toast.success("Tarix tozalandi");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Telegram WebApp ichida bo'lsa login so'ramaslik - avtomatik auth kutish
  // Faqat web saytda (Telegram tashqarisida) login so'rash
  if (!isAuthenticated && !isTelegramWebApp()) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#D4AF37]/30">
          <Bot className="w-10 h-10 text-[#0A0908]" />
        </div>
        <h2 className="text-xl font-bold text-[#FBF0B2] mb-2">Tavba AI</h2>
        <p className="text-[#D4AF37]/60 text-center mb-6">
          AI yordamchidan foydalanish uchun tizimga kirishingiz kerak
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-3 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-[#0A0908] font-bold rounded-full"
        >
          Tizimga kirish
        </button>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-[#D4AF37]/60 text-sm"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  // Telegram ichida auth kutilmoqda
  if (!isAuthenticated && isTelegramWebApp()) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#D4AF37]/60 text-sm">Telegram orqali kirilmoqda...</p>
        </div>
      </div>
    );
  }

  if (historyLoading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0908]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0F0E0A]/95 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-full bg-[#1A1812] text-[#FBF0B2] hover:bg-[#D4AF37]/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                <Bot className="w-5 h-5 text-[#0A0908]" />
              </div>
              <div>
                <h1 className="font-bold text-[#FBF0B2]">Tavba AI</h1>
                <p className="text-xs text-[#D4AF37]/60">Islomiy yordamchi</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {usage && (
              <div className="px-3 py-1 rounded-full bg-[#1A1812] border border-[#D4AF37]/30">
                <span className="text-xs text-[#D4AF37]">
                  {usage.remaining} so'rov qoldi
                </span>
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-2 text-[#D4AF37]/50 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#D4AF37]/30">
                <Sparkles className="w-10 h-10 text-[#0A0908]" />
              </div>
              <h2 className="text-xl font-bold text-[#FBF0B2] mb-2">
                Assalomu alaykum!
              </h2>
              <p className="text-[#D4AF37]/60 text-center max-w-md mb-6">
                Men Tavba AI - islomiy savollarga javob beruvchi sun'iy
                intellekt yordamchisiman. Menga Qur'on, hadis, fiqh, namoz va
                boshqa mavzularda savollar berishingiz mumkin.
              </p>

              {/* Example questions */}
              <div className="grid gap-2 w-full max-w-md">
                <p className="text-xs text-[#D4AF37]/40 text-center mb-2">
                  Misol savollar:
                </p>
                {[
                  "Namozning farzi nechta?",
                  "Subhanalloh zikrining fazilati qanday?",
                  "Tavba qilish shartlari nima?",
                  "Qur'on o'qishning odoblari",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-left px-4 py-3 rounded-xl bg-[#1A1812] border border-[#D4AF37]/20 text-[#FBF0B2] text-sm hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 inline mr-2 text-[#D4AF37]" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#0A0908]" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-[#D4AF37] text-[#0A0908]"
                      : "bg-[#1A1812] border border-[#D4AF37]/20 text-[#FBF0B2]"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 flex-shrink-0 bg-[#1A1812] border border-[#D4AF37]/30 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#0A0908]" />
              </div>
              <div className="bg-[#1A1812] border border-[#D4AF37]/20 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F0E0A]/95 backdrop-blur-md border-t border-[#D4AF37]/20 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-[#1A1812] rounded-2xl border border-[#D4AF37]/30 focus-within:border-[#D4AF37] transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Savol yozing..."
                rows={1}
                className="w-full bg-transparent text-[#FBF0B2] placeholder-[#D4AF37]/40 px-4 py-3 resize-none focus:outline-none text-sm"
                style={{ maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-3 rounded-full transition-all ${
                input.trim() && !loading
                  ? "bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-[#0A0908] shadow-lg shadow-[#D4AF37]/30 hover:shadow-[#D4AF37]/50"
                  : "bg-[#1A1812] text-[#D4AF37]/30"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-center text-[#D4AF37]/30 mt-3">
            Tavba AI islomiy savollarga javob beradi
          </p>
        </div>
      </div>
    </div>
  );
}

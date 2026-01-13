"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, Bot, User, Trash2, Copy, Check, Sparkles } from "lucide-react";
import { useAuth, useCategories } from "@/hooks";
import { aiApi } from "@/lib/api";
import { Button, Card, Avatar, Badge } from "@/components/ui";
import { cn, formatRelativeTime, getUploadUrl } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import toast from "react-hot-toast";

// Map category slugs to logo paths
const getCategoryLogo = (
  slug: string,
  apiIcon?: string | null
): string | null => {
  const logoMap: Record<string, string> = {
    python: "/img/Python-logo.png",
    javascript: "/img/JavaScript-logo.png",
    typescript: "/img/TypeScript-logo.png",
    java: "/img/Java-logo.png",
    cpp: "/img/c++-logo.png",
    "c++": "/img/c++-logo.png",
    go: "/img/Go-Logo_Aqua.png",
    golang: "/img/Go-Logo_Aqua.png",
    react: "/img/react-logo.png",
    nodejs: "/img/node.js-logo.png",
    "node.js": "/img/node.js-logo.png",
    nextjs: "/img/next.js-logo.png",
    "next.js": "/img/next.js-logo.png",
    nestjs: "/img/nestjs-logo.png",
    postgresql: "/img/postgreSql-logo.png",
    mongodb: "/img/mongodb-logo.png",
    sql: "/img/sql-logo.png",
    redis: "/img/redis-logo.png",
    git: "/img/git-logo.png",
    linux: "/img/linux-logo.png",
    "html-css": "/img/html-css-logo.png",
    rust: "/img/rust-logo.png",
    vue: "/img/vue.js-logo.png",
    express: "/img/express.js-logo.png",
    django: "/img/django-logo.png",
    tailwind: "/img/tailwind-css-logo.png",
    docker: "/img/docker-logo.png",
  };

  // First check static logos
  if (logoMap[slug?.toLowerCase()]) {
    return logoMap[slug?.toLowerCase()];
  }

  // Then check API icon - use getUploadUrl for proper URL
  if (apiIcon && apiIcon.startsWith("/")) {
    return getUploadUrl(apiIcon) || apiIcon;
  }

  return null;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface AIUsage {
  todayCount: number;
  dailyLimit: number;
  totalCount: number;
}

export default function AIPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { categories } = useCategories();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Load chat history
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadHistory = async () => {
      try {
        const [historyRes, usageRes] = await Promise.all([
          aiApi.getHistory(1, 50),
          aiApi.getUsage(),
        ]);

        const history = historyRes.data.chats || historyRes.data;
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
      // selectedCategory id, shuning uchun slug'ni topish kerak
      const categorySlug = selectedCategory
        ? categories.find((c) => c.id === selectedCategory)?.slug
        : undefined;
      const { data } = await aiApi.chat(userMessage.content, categorySlug);

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
          todayCount: usage.todayCount + 1,
          totalCount: usage.totalCount + 1,
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

  // Copy message
  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Nusxa olindi");
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

  if (authLoading || historyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                AI Yordamchi
              </h1>
              <p className="text-xs text-gray-500">
                Bilimdon AI • O'zbek tilida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {usage && (
              <Badge variant="info">
                {usage.todayCount}/{usage.dailyLimit} so'rov
              </Badge>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 px-4 py-2">
        <div className="container mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap",
                !selectedCategory
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              Umumiy
            </button>
            {categories.slice(0, 6).map((cat) => {
              const logoPath = getCategoryLogo(cat.slug, cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap",
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {logoPath ? (
                    <Image
                      src={logoPath}
                      alt={cat.name}
                      width={18}
                      height={18}
                      className="object-contain"
                      unoptimized={logoPath.startsWith("http")}
                    />
                  ) : cat.icon && !cat.icon.includes("/") ? (
                    <span>{cat.icon}</span>
                  ) : (
                    <span className="w-4 h-4 bg-indigo-500 rounded-full" />
                  )}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-indigo-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                AI Yordamchi bilan suhbatlashing
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Dasturlash, matematika, tillar va boshqa fanlar bo'yicha
                savollar bering
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Python da list comprehension nima?",
                  "React hooks qanday ishlaydi?",
                  "SQL JOIN turlarini tushuntir",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 group relative",
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ node, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            const inline = !match;
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code
                                className={cn(
                                  className,
                                  "bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"
                                )}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Copy button */}
                  <button
                    onClick={() => copyMessage(message.id, message.content)}
                    className={cn(
                      "absolute -bottom-8 right-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                      message.role === "user"
                        ? "text-gray-400 hover:text-gray-600"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {copiedId === message.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {message.role === "user" && (
                  <Avatar
                    key={user?.avatar || "no-avatar"}
                    src={user?.avatar}
                    name={user?.fullName || "User"}
                    size="sm"
                  />
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Savolingizni yozing..."
                className="w-full bg-transparent px-4 py-3 resize-none focus:outline-none max-h-32"
                rows={1}
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="h-12 w-12 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            AI javoblari har doim to'g'ri bo'lmasligi mumkin. Muhim
            ma'lumotlarni tekshiring.
          </p>
        </div>
      </div>
    </div>
  );
}

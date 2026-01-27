"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Bot,
  User,
  Trash2,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Mic,
  MicOff,
  Square,
  Image as ImageIcon,
  X,
  Download,
  Loader2,
  Volume2,
  StopCircle,
} from "lucide-react";
import { useAuth } from "@/hooks";
import { aiApi } from "@/lib/api";
import { isTelegramWebApp } from "@/lib/telegram";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "image" | "audio";
  imageUrl?: string;
  audioUrl?: string;
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

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioVisualizerBars, setAudioVisualizerBars] = useState<number[]>(
    Array(20).fill(5),
  );
  // Audio Gemini orqali transcribe qilinadi (O'zbek tilini to'liq qo'llab-quvvatlaydi)

  // Image Viewing
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
            type: "text",
            createdAt: chat.createdAt,
          });

          // Check if response contains image
          const imageMatch = chat.response?.match(/!\[.*?\]\((.*?)\)/);
          const isImageResponse =
            imageMatch || chat.response?.includes("data:image");

          formattedMessages.push({
            id: `${chat.id}-assistant`,
            role: "assistant",
            content: isImageResponse ? "" : chat.response,
            type: isImageResponse ? "image" : "text",
            imageUrl: imageMatch
              ? imageMatch[1]
              : chat.response?.includes("data:image")
                ? chat.response
                : undefined,
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

  // Audio Visualizer Animation
  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 20 bars from the frequency data
    const bars: number[] = [];
    const step = Math.floor(dataArray.length / 20);
    for (let i = 0; i < 20; i++) {
      const value = dataArray[i * step];
      bars.push(Math.max(5, (value / 255) * 40));
    }
    setAudioVisualizerBars(bars);

    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, [isRecording]);

  // Cleanup recording timer
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start Audio Recording - faqat audio yozamiz, Gemini transcribe qiladi
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Setup audio analyzer for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioVisualizerBars(Array(20).fill(5));
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start visualizer
      updateVisualizer();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Mikrofonga ruxsat berilmadi");
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Cancel Recording
  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
  };

  // Send Audio Message - Gemini o'zbek tilini to'liq qo'llab-quvvatlaydi
  const sendAudioMessage = async () => {
    if (!audioBlob) {
      toast.error("Ovoz yozilmadi");
      return;
    }

    setIsProcessingAudio(true);

    try {
      // Audio blob'ni base64 ga o'giramiz - Gemini o'zbek tilini yaxshi tushunadi
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      if (!audioBase64) {
        toast.error("Ovozni qayta ishlashda xatolik");
        setIsProcessingAudio(false);
        return;
      }

      const userMessage: Message = {
        id: `temp-audio-${Date.now()}`,
        role: "user",
        content: "🎤 Ovozli xabar (" + formatTime(recordingTime) + ")",
        type: "audio",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const savedRecordingTime = recordingTime;
      setAudioBlob(null);
      setRecordingTime(0);
      setLoading(true);

      console.log(
        "Sending audio to Gemini for transcription, size:",
        audioBase64.length,
      );

      // Audio'ni backend'ga yuboramiz - Gemini o'zbek tilida transcribe qiladi
      const { data } = await aiApi.chat(
        "[Ovozli xabar - transkripsiya qiling]",
        audioBase64,
      );

      console.log("AI response received:", data);

      const assistantMessage: Message = {
        id: `${data.id}-assistant`,
        role: "assistant",
        content: data.response,
        type: "text",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (usage) {
        setUsage({
          ...usage,
          used: usage.used + 1,
          remaining: usage.remaining - 1,
        });
      }
    } catch (error: any) {
      console.error("Audio send error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Ovozli xabarni yuborishda xatolik";
      toast.error(errorMsg);
    } finally {
      setIsProcessingAudio(false);
      setLoading(false);
    }
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input.trim(),
      type: "text",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");
    setLoading(true);

    try {
      const { data } = await aiApi.chat(messageText);

      // Check if AI returned an image
      const imageMatch = data.response?.match(/!\[.*?\]\((.*?)\)/);
      const isImageResponse =
        imageMatch ||
        data.response?.includes("data:image") ||
        (data.response?.includes("http") &&
          (data.response?.includes(".png") ||
            data.response?.includes(".jpg") ||
            data.response?.includes(".jpeg")));

      let imageUrl = undefined;
      let textContent = data.response;

      if (isImageResponse) {
        // Extract image URL
        if (imageMatch) {
          imageUrl = imageMatch[1];
          textContent = data.response.replace(/!\[.*?\]\(.*?\)/g, "").trim();
        } else if (data.response?.includes("data:image")) {
          const base64Match = data.response.match(
            /(data:image\/[^;]+;base64,[^\s"]+)/,
          );
          if (base64Match) {
            imageUrl = base64Match[1];
            textContent = data.response.replace(base64Match[1], "").trim();
          }
        } else {
          // Check for direct image URLs
          const urlMatch = data.response.match(
            /(https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp))/i,
          );
          if (urlMatch) {
            imageUrl = urlMatch[1];
            textContent = data.response.replace(urlMatch[1], "").trim();
          }
        }
      }

      const assistantMessage: Message = {
        id: `${data.id}-assistant`,
        role: "assistant",
        content: textContent || "",
        type: imageUrl ? "image" : "text",
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

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

  // Download image
  const downloadImage = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `tavba-ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render message content
  const renderMessageContent = (message: Message) => {
    if (message.type === "image" && message.imageUrl) {
      return (
        <div className="space-y-2">
          {message.content && (
            <p className="text-sm whitespace-pre-wrap leading-relaxed mb-2">
              {message.content}
            </p>
          )}
          <div className="relative group">
            <img
              src={message.imageUrl}
              alt="AI generated image"
              className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: "300px" }}
              onClick={() => setViewingImage(message.imageUrl!)}
              onError={(e) => {
                // If image fails to load, show as text
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => setViewingImage(message.imageUrl!)}
                className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => downloadImage(message.imageUrl!)}
                className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (message.type === "audio") {
      return (
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#D4AF37]" />
          <p className="text-sm">{message.content}</p>
        </div>
      );
    }

    return (
      <p className="text-sm whitespace-pre-wrap leading-relaxed">
        {message.content}
      </p>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && !isTelegramWebApp()) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#D4AF37]/30">
          <Bot className="w-10 h-10 text-[#0F0D0A]" />
        </div>
        <h2 className="text-xl font-bold text-[#FBF0B2] mb-2">Tavba AI</h2>
        <p className="text-[#D4AF37]/60 text-center mb-6">
          AI yordamchidan foydalanish uchun tizimga kirishingiz kerak
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-3 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-[#0F0D0A] font-bold rounded-full"
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

  if (!isAuthenticated && isTelegramWebApp()) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#D4AF37]/60 text-sm">
            Telegram orqali kirilmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (historyLoading) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0D0A]">
      {/* Premium Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] bg-gradient-radial from-[#D4AF37]/10 via-[#D4AF37]/3 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] bg-gradient-radial from-[#AA8232]/8 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0F0D0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="p-2.5 rounded-xl bg-[#1E1C18] border border-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                  <Bot className="w-6 h-6 text-[#0F0D0A]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#22c55e] rounded-full border-2 border-[#0F0D0A]"></div>
              </div>
              <div>
                <h1 className="font-bold text-[#FBF0B2] text-base">Tavba AI</h1>
                <p className="text-[10px] text-[#D4AF37]/50 uppercase tracking-wider">
                  Islomiy Yordamchi
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {usage && (
              <div className="px-3 py-1.5 rounded-xl bg-[#1E1C18] border border-[#D4AF37]/20">
                <span className="text-xs text-[#D4AF37] font-medium">
                  {usage.remaining}/{usage.limit}
                </span>
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="p-2.5 text-[#D4AF37]/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-36">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#D4AF37]/30 rotate-3">
                  <Sparkles className="w-12 h-12 text-[#0F0D0A]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center border-4 border-[#0F0D0A]">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 text-center">
                Assalomu alaykum!
              </h2>
              <p className="text-[#9A8866] text-center max-w-sm mb-8 text-sm leading-relaxed">
                Men Tavba AI - islomiy savollarga Qur'on va hadis asosida javob
                beruvchi sun'iy intellekt yordamchisiman.
              </p>

              {/* Example questions */}
              <div className="grid gap-2 w-full max-w-md">
                <p className="text-[10px] text-[#D4AF37]/40 text-center mb-2 uppercase tracking-wider">
                  Misol savollar
                </p>
                {[
                  { icon: "🕌", text: "Namozning farzi nechta?" },
                  { icon: "📿", text: "Subhanalloh zikrining fazilati" },
                  { icon: "💚", text: "Tavba qilish shartlari nima?" },
                  { icon: "📖", text: "Qur'on o'qishning odoblari" },
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q.text)}
                    className="text-left px-4 py-3.5 rounded-2xl bg-[#1E1C18]/80 border border-[#D4AF37]/10 text-[#FBF0B2] text-sm hover:border-[#D4AF37]/30 hover:bg-[#1E1C18] transition-all group flex items-center gap-3"
                  >
                    <span className="text-xl">{q.icon}</span>
                    <span className="flex-1">{q.text}</span>
                    <MessageCircle className="w-4 h-4 text-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {message.role === "assistant" && (
                  <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                    <Bot className="w-5 h-5 text-[#0F0D0A]" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-[#0F0D0A] shadow-lg shadow-[#D4AF37]/20"
                      : "bg-[#1E1C18] border border-[#D4AF37]/10 text-[#FBF0B2]"
                  }`}
                >
                  {renderMessageContent(message)}
                </div>

                {message.role === "user" && (
                  <div className="w-9 h-9 flex-shrink-0 bg-[#1E1C18] border border-[#D4AF37]/20 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-300">
              <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#0F0D0A]" />
              </div>
              <div className="bg-[#1E1C18] border border-[#D4AF37]/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5 items-center">
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

      {/* Audio Recording Overlay */}
      {isRecording && (
        <div className="fixed inset-0 z-50 bg-[#0F0D0A]/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              {/* Pulsing rings */}
              <div
                className="absolute inset-0 w-32 h-32 rounded-full bg-[#D4AF37]/20 animate-ping"
                style={{ animationDuration: "1.5s" }}
              ></div>
              <div
                className="absolute inset-0 w-32 h-32 rounded-full bg-[#D4AF37]/10 animate-ping"
                style={{ animationDuration: "2s", animationDelay: "0.5s" }}
              ></div>

              {/* Microphone button */}
              <div className="relative w-32 h-32 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center shadow-2xl shadow-[#D4AF37]/50">
                <Mic className="w-12 h-12 text-[#0F0D0A]" />
              </div>
            </div>

            {/* Audio Visualizer */}
            <div className="flex items-end justify-center gap-1 h-16 mb-6">
              {audioVisualizerBars.map((height, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-[#D4AF37] to-[#FBF0B2] rounded-full transition-all duration-75"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>

            {/* Recording Time */}
            <p className="text-3xl font-black text-[#D4AF37] mb-2 font-mono">
              {formatTime(recordingTime)}
            </p>
            <p className="text-[#9A8866] text-sm mb-4">
              Gapiring, men eshitayapman...
            </p>

            {/* Recording indicator */}
            <p className="text-[#D4AF37]/60 text-xs mb-6">
              O'zbek tilida gapiring - Gemini to'liq tushunadi
            </p>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={cancelRecording}
                className="p-4 rounded-full bg-[#1E1C18] border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={stopRecording}
                className="p-5 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-[#0F0D0A] shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl transition-all"
              >
                <StopCircle className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Preview - After Recording */}
      {audioBlob && !isRecording && (
        <div className="fixed bottom-24 left-4 right-4 z-40">
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-[#1E1C18] border border-[#D4AF37]/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">
                  🎤 Ovozli xabar tayyor
                </p>
                <p className="text-xs text-[#9A8866]">
                  {formatTime(recordingTime)} - Yuborish uchun bosing
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelRecording}
                  className="p-2.5 rounded-xl bg-[#0F0D0A] border border-[#D4AF37]/20 text-[#D4AF37]/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={sendAudioMessage}
                  disabled={isProcessingAudio}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-[#0F0D0A] font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#D4AF37]/30 disabled:opacity-50"
                >
                  {isProcessingAudio ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Yuborish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F0D0A]/95 backdrop-blur-xl border-t border-[#D4AF37]/10 px-4 py-4 safe-area-bottom">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            {/* Microphone Button */}
            <button
              onClick={startRecording}
              disabled={loading || isRecording}
              className="p-3 rounded-xl bg-[#1E1C18] border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all disabled:opacity-50"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1 bg-[#1E1C18] rounded-2xl border border-[#D4AF37]/20 focus-within:border-[#D4AF37]/50 transition-colors overflow-hidden">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Savol yozing..."
                rows={1}
                className="w-full bg-transparent text-[#FBF0B2] placeholder-[#D4AF37]/30 px-4 py-3 resize-none focus:outline-none text-sm"
                style={{ maxHeight: "120px" }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-3 rounded-xl transition-all ${
                input.trim() && !loading
                  ? "bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-[#0F0D0A] shadow-lg shadow-[#D4AF37]/30 hover:shadow-xl hover:shadow-[#D4AF37]/40"
                  : "bg-[#1E1C18] border border-[#D4AF37]/10 text-[#D4AF37]/30"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[10px] text-center text-[#D4AF37]/20 mt-3 uppercase tracking-wider">
            Tavba AI вЂў Islomiy Yordamchi
          </p>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(viewingImage);
            }}
            className="absolute top-4 left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Download className="w-6 h-6" />
          </button>
          <img
            src={viewingImage}
            alt="Full size image"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

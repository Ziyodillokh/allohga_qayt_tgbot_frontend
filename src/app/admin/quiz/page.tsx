"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { useAdminContext } from "@/contexts/AdminContext";
import toast from "react-hot-toast";

interface QuizQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  createdAt: string;
}

interface QuizSession {
  id: string;
  chatId: string;
  totalQuestions: number;
  startedAt: string;
  finishedAt: string | null;
}

export default function AdminQuiz() {
  const { token } = useAuth();
  const { isReadOnly } = useAdminContext();

  const [activeTab, setActiveTab] = useState<"upload" | "questions" | "sessions">("upload");
  const [questionsText, setQuestionsText] = useState("");
  const [importing, setImporting] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    fetchQuestionCount();
  }, []);

  useEffect(() => {
    if (activeTab === "questions") {
      fetchQuestions(currentPage);
    } else if (activeTab === "sessions") {
      fetchSessions();
    }
  }, [activeTab, currentPage]);

  const fetchQuestionCount = async () => {
    try {
      const res = await fetch(`${API}/quiz/questions/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuestionCount(data.count || 0);
    } catch {
      // ignore
    }
  };

  const fetchQuestions = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/quiz/questions?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotalQuestions(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Savollarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/quiz/sessions?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      toast.error("Sessiyalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!questionsText.trim()) {
      toast.error("Savollar matnini kiriting");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`${API}/quiz/questions/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: questionsText }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Import xatolik");
        return;
      }

      toast.success(
        `${data.imported} ta savol import qilindi${data.skipped > 0 ? `, ${data.skipped} ta o'tkazib yuborildi (dublikat)` : ""}`,
      );

      if (data.errors && data.errors.length > 0) {
        toast(
          `Xatolar: ${data.errors.slice(0, 3).join("; ")}${data.errors.length > 3 ? "..." : ""}`,
          { icon: "⚠️", duration: 5000 },
        );
      }

      setQuestionsText("");
      fetchQuestionCount();
    } catch {
      toast.error("Import xatolik");
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Bu savolni o'chirmoqchimisiz?")) return;

    try {
      await fetch(`${API}/quiz/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Savol o'chirildi");
      fetchQuestions(currentPage);
      fetchQuestionCount();
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Barcha quiz savollarini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi!")) return;
    if (!confirm("Rostdan ham barcha savollarni o'chirmoqchimisiz?")) return;

    try {
      const res = await fetch(`${API}/quiz/questions`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      toast.success(`${data.deleted} ta savol o'chirildi`);
      fetchQuestions(1);
      setCurrentPage(1);
      fetchQuestionCount();
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  const correctOptionLabel = (opt: string) => {
    return opt.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FBF0B2]">Quiz Boshqaruvi</h1>
          <p className="text-sm text-[#D4AF37]/60 mt-1">
            Telegram quiz savollarini yuklash va boshqarish
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#1E1C18] border border-[#D4AF37]/20">
            <span className="text-sm text-[#D4AF37]/60">Jami savollar: </span>
            <span className="text-sm font-bold text-[#FBF0B2]">{questionCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#D4AF37]/20 pb-1">
        {[
          { id: "upload" as const, label: "Savollarni Yuklash" },
          { id: "questions" as const, label: "Savollar Ro'yxati" },
          { id: "sessions" as const, label: "Quiz Sessiyalari" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#D4AF37]/20 text-[#FBF0B2] border border-[#D4AF37]/30 border-b-0"
                : "text-[#D4AF37]/60 hover:text-[#FBF0B2] hover:bg-[#D4AF37]/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          {/* Format Guide */}
          <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#FBF0B2] mb-4">
              Savol formati
            </h3>
            <div className="bg-[#0F0E0A] rounded-xl p-4 font-mono text-sm text-[#D4AF37]/80 whitespace-pre-line">
{`1.{Savol matni}:
a) Variant A
b) Variant B
(c) Variant C   ← to'g'ri javob (qavsda)
d) Variant D

2.{Yana bir savol}:
a) Variant A
(b) Variant B   ← to'g'ri javob
c) Variant C
d) Variant D`}
            </div>
            <p className="text-xs text-[#D4AF37]/50 mt-3">
              To'g'ri javob qavsda yoziladi: (a), (b), (c) yoki (d). Bir vaqtda 10 dan 1000+ gacha savol yuklash mumkin.
            </p>
          </div>

          {/* Text Input */}
          <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#FBF0B2] mb-4">
              Savollarni kiriting
            </h3>
            <textarea
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              placeholder={`1.{Eng katta sayyora qaysi?}:\na) Yer\n(b) Yupiter\nc) Mars\nd) Venera\n\n2.{Quyoshga eng yaqin sayyora?}:\n(a) Merkuriy\nb) Venera\nc) Yer\nd) Mars`}
              rows={16}
              className="w-full bg-[#0F0E0A] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-[#E5C366] placeholder-[#D4AF37]/30 focus:outline-none focus:border-[#D4AF37]/50 resize-y font-mono text-sm"
              disabled={isReadOnly}
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs text-[#D4AF37]/50">
                {questionsText.split(/\d+\./).filter(Boolean).length} ta savol topildi (taxminiy)
              </p>
              <button
                onClick={handleImport}
                disabled={importing || isReadOnly || !questionsText.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A] rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? "Import qilinmoqda..." : "Import qilish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List Tab */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Actions */}
          {!isReadOnly && totalQuestions > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 text-sm bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Barchasini o'chirish ({totalQuestions})
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-[#D4AF37]/60">Yuklanmoqda...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl">
              <p className="text-[#D4AF37]/60 text-lg mb-2">Savollar topilmadi</p>
              <p className="text-sm text-[#D4AF37]/40">
                "Savollarni Yuklash" tabidan savollarni import qiling
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#FBF0B2] mb-2">
                          {(currentPage - 1) * 20 + idx + 1}. {q.questionText}
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {[
                            { key: "a", text: q.optionA },
                            { key: "b", text: q.optionB },
                            { key: "c", text: q.optionC },
                            { key: "d", text: q.optionD },
                          ].map((opt) => (
                            <div
                              key={opt.key}
                              className={`px-2 py-1 rounded ${
                                q.correctOption === opt.key
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "text-[#D4AF37]/60"
                              }`}
                            >
                              {opt.key.toUpperCase()}) {opt.text}
                            </div>
                          ))}
                        </div>
                      </div>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-400/60 hover:text-red-400 text-xs px-2 py-1 shrink-0"
                        >
                          O'chirish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm bg-[#1E1C18] border border-[#D4AF37]/20 text-[#D4AF37]/60 disabled:opacity-30"
                  >
                    Oldingi
                  </button>
                  <span className="px-3 py-1.5 text-sm text-[#D4AF37]/60">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm bg-[#1E1C18] border border-[#D4AF37]/20 text-[#D4AF37]/60 disabled:opacity-30"
                  >
                    Keyingi
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-[#D4AF37]/60">Yuklanmoqda...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl">
              <p className="text-[#D4AF37]/60 text-lg mb-2">Sessiyalar topilmadi</p>
              <p className="text-sm text-[#D4AF37]/40">
                Telegram guruh yoki kanalda /starttest buyrug'ini yuboring
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-[#FBF0B2]">
                      Chat: {s.chatId}
                    </p>
                    <p className="text-xs text-[#D4AF37]/60 mt-1">
                      {s.totalQuestions} ta savol |{" "}
                      {new Date(s.startedAt).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      s.finishedAt
                        ? "bg-green-500/20 text-green-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {s.finishedAt ? "Tugagan" : "Davom etmoqda"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Usage Guide */}
          <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-[#FBF0B2] mb-3">
              Quiz buyruqlari
            </h3>
            <div className="space-y-2 text-sm text-[#D4AF37]/70">
              <p><code className="text-[#FBF0B2] bg-[#0F0E0A] px-2 py-0.5 rounded">/starttest</code> — 15 ta savol (standart)</p>
              <p><code className="text-[#FBF0B2] bg-[#0F0E0A] px-2 py-0.5 rounded">/starttest5</code> — 5 ta savol</p>
              <p><code className="text-[#FBF0B2] bg-[#0F0E0A] px-2 py-0.5 rounded">/starttest10</code> — 10 ta savol</p>
              <p><code className="text-[#FBF0B2] bg-[#0F0E0A] px-2 py-0.5 rounded">/starttest20</code> — 20 ta savol</p>
              <p><code className="text-[#FBF0B2] bg-[#0F0E0A] px-2 py-0.5 rounded">/starttest30</code> — 30 ta savol</p>
              <div className="border-t border-[#D4AF37]/10 my-3 pt-3">
                <p><code className="text-red-400 bg-[#0F0E0A] px-2 py-0.5 rounded">/stoptest</code> — Quizni to'xtatish (natijalar ko'rsatiladi)</p>
              </div>
            </div>
            <p className="text-xs text-[#D4AF37]/40 mt-4">
              Faqat guruh/kanal adminlari quiz boshlashi va to'xtatishi mumkin. Har bir chatda bir vaqtda bitta quiz ishlaydi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

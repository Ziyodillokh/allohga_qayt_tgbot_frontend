"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import toast from "react-hot-toast";

interface Zikr {
  id: string;
  titleArabic: string;
  titleLatin: string;
  textArabic: string;
  textLatin: string;
  description: string | null;
  count: number;
  emoji: string;
  dayOfWeek: number;
  isRamadan: boolean;
  order: number;
  isActive: boolean;
  xpReward: number;
  createdAt: string;
}

const WEEK_DAYS = [
  { value: 0, label: "Yakshanba" },
  { value: 1, label: "Dushanba" },
  { value: 2, label: "Seshanba" },
  { value: 3, label: "Chorshanba" },
  { value: 4, label: "Payshanba" },
  { value: 5, label: "Juma" },
  { value: 6, label: "Shanba" },
];

const EMOJIS = [
  "🤲",
  "☪️",
  "✨",
  "🙏",
  "☝️",
  "📿",
  "🕌",
  "🌙",
  "⭐",
  "💫",
  "🌟",
  "❤️",
];

export default function AdminZikr() {
  const { token } = useAuth();
  const [zikrs, setZikrs] = useState<Zikr[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZikr, setEditingZikr] = useState<Zikr | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [showRamadan, setShowRamadan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titleArabic: "",
    titleLatin: "",
    textArabic: "",
    textLatin: "",
    description: "",
    count: 33,
    emoji: "🤲",
    dayOfWeek: 1,
    isRamadan: false,
    order: 0,
    isActive: true,
  });

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  const fetchZikrs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/zikr?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setZikrs(data);
      }
    } catch (error) {
      console.error("Zikrlarni olishda xatolik:", error);
      toast.error("Zikrlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchZikrs();
  }, [token]);

  const filteredZikrs = zikrs.filter((z) => {
    if (selectedDay !== "all" && z.dayOfWeek !== selectedDay) return false;
    if (showRamadan && !z.isRamadan) return false;
    if (!showRamadan && z.isRamadan) return false;
    return true;
  });

  const groupedByDay = WEEK_DAYS.map((day) => ({
    ...day,
    zikrs: filteredZikrs.filter((z) => z.dayOfWeek === day.value),
  }));

  const openCreateModal = () => {
    setEditingZikr(null);
    setFormData({
      titleArabic: "",
      titleLatin: "",
      textArabic: "",
      textLatin: "",
      description: "",
      count: 33,
      emoji: "🤲",
      dayOfWeek: 1,
      isRamadan: showRamadan,
      order: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (zikr: Zikr) => {
    setEditingZikr(zikr);
    setFormData({
      titleArabic: zikr.titleArabic,
      titleLatin: zikr.titleLatin,
      textArabic: zikr.textArabic,
      textLatin: zikr.textLatin,
      description: zikr.description || "",
      count: zikr.count,
      emoji: zikr.emoji,
      dayOfWeek: zikr.dayOfWeek,
      isRamadan: zikr.isRamadan,
      order: zikr.order,
      isActive: zikr.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.titleArabic || !formData.titleLatin) {
      toast.error("Sarlavhalarni to'ldiring");
      return;
    }
    if (!formData.textArabic || !formData.textLatin) {
      toast.error("Zikr matnlarini to'ldiring");
      return;
    }

    setSaving(true);
    try {
      const url = editingZikr ? `${API}/zikr/${editingZikr.id}` : `${API}/zikr`;
      const method = editingZikr ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingZikr ? "Zikr yangilandi" : "Zikr qo'shildi");
        setShowModal(false);
        fetchZikrs();
      } else {
        const error = await response.json();
        toast.error(error.message || "Xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Saqlashda xatolik:", error);
      toast.error("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu zikrni o'chirishni xohlaysizmi?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`${API}/zikr/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Zikr o'chirildi");
        fetchZikrs();
      } else {
        toast.error("O'chirishda xatolik");
      }
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      toast.error("O'chirishda xatolik");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (zikr: Zikr) => {
    try {
      const response = await fetch(`${API}/zikr/${zikr.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !zikr.isActive }),
      });

      if (response.ok) {
        toast.success(zikr.isActive ? "Zikr o'chirildi" : "Zikr yoqildi");
        fetchZikrs();
      }
    } catch (error) {
      console.error("Xatolik:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FBF0B2]">
            Zikrlar Boshqaruvi
          </h1>
          <p className="text-sm text-[#D4AF37]/60">
            Haftalik zikrlarni qo'shish va boshqarish
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A] font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Yangi Zikr
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1812] border border-[#D4AF37]/20 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
              Hafta kuni
            </label>
            <select
              value={selectedDay}
              onChange={(e) =>
                setSelectedDay(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
              className="w-full px-3 py-2.5 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">Barcha kunlar</option>
              {WEEK_DAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#D4AF37]/60 uppercase tracking-wider">
              Ramazon
            </span>
            <button
              onClick={() => setShowRamadan(!showRamadan)}
              className={`relative w-12 h-6 rounded-full transition-colors ${showRamadan ? "bg-[#D4AF37]" : "bg-[#D4AF37]/30"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-[#0F0E0A] rounded-full transition-transform ${showRamadan ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div className="ml-auto bg-[#D4AF37]/10 px-4 py-2 rounded-xl">
            <span className="text-sm text-[#D4AF37]/60">Jami: </span>
            <span className="text-sm font-bold text-[#FBF0B2]">
              {filteredZikrs.length}
            </span>
            <span className="text-sm text-[#D4AF37]/60"> ta</span>
          </div>
        </div>
      </div>

      {/* Zikrs List */}
      {selectedDay === "all" ? (
        <div className="space-y-6">
          {groupedByDay.map((day) => (
            <div
              key={day.value}
              className="bg-[#1A1812] border border-[#D4AF37]/20 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-3 bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-b border-[#D4AF37]/10">
                <h3 className="font-bold text-[#FBF0B2]">{day.label}</h3>
                <p className="text-xs text-[#D4AF37]/60">
                  {day.zikrs.length} ta zikr
                </p>
              </div>
              {day.zikrs.length > 0 ? (
                <div className="divide-y divide-[#D4AF37]/10">
                  {day.zikrs.map((zikr) => (
                    <ZikrCard
                      key={zikr.id}
                      zikr={zikr}
                      onEdit={() => openEditModal(zikr)}
                      onDelete={() => handleDelete(zikr.id)}
                      onToggle={() => toggleActive(zikr)}
                      deleting={deleting === zikr.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[#D4AF37]/40">
                  Bu kun uchun zikr yo'q
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1A1812] border border-[#D4AF37]/20 rounded-2xl overflow-hidden">
          {filteredZikrs.length > 0 ? (
            <div className="divide-y divide-[#D4AF37]/10">
              {filteredZikrs.map((zikr) => (
                <ZikrCard
                  key={zikr.id}
                  zikr={zikr}
                  onEdit={() => openEditModal(zikr)}
                  onDelete={() => handleDelete(zikr.id)}
                  onToggle={() => toggleActive(zikr)}
                  deleting={deleting === zikr.id}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[#D4AF37]/40">
              Bu kun uchun zikr yo'q
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1A1812] border border-[#D4AF37]/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1A1812] px-6 py-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#FBF0B2]">
                {editingZikr ? "Zikrni Tahrirlash" : "Yangi Zikr Qo'shish"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-[#D4AF37]/10 rounded-xl text-[#D4AF37]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Emoji */}
              <div>
                <label className="block text-xs font-medium text-[#D4AF37]/60 mb-2 uppercase tracking-wider">
                  Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`w-11 h-11 text-xl rounded-xl border-2 transition-all ${
                        formData.emoji === emoji
                          ? "border-[#D4AF37] bg-[#D4AF37]/20"
                          : "border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day */}
              <div>
                <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
                  Hafta kuni *
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dayOfWeek: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none"
                >
                  {WEEK_DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
                    Sarlavha (Arabcha) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleArabic}
                    onChange={(e) =>
                      setFormData({ ...formData, titleArabic: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none text-right"
                    dir="rtl"
                    placeholder="أَسْتَغْفِرُ اللهَ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
                    Sarlavha (Lotin) *
                  </label>
                  <input
                    type="text"
                    value={formData.titleLatin}
                    onChange={(e) =>
                      setFormData({ ...formData, titleLatin: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none"
                    placeholder="Istig'for"
                  />
                </div>
              </div>

              {/* Texts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
                    Matn (Arabcha) *
                  </label>
                  <textarea
                    value={formData.textArabic}
                    onChange={(e) =>
                      setFormData({ ...formData, textArabic: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none text-right h-24 resize-none"
                    dir="rtl"
                    placeholder="أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
                    Matn (Lotin) *
                  </label>
                  <textarea
                    value={formData.textLatin}
                    onChange={(e) =>
                      setFormData({ ...formData, textLatin: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none h-24 resize-none"
                    placeholder="Astaghfirulloha wa atubu ilayh"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
                  Tavsif / Foydasi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none h-20 resize-none"
                  placeholder="Kim istig'forni ko'paytirsa..."
                />
              </div>

              {/* Count & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
                    Soni
                  </label>
                  <input
                    type="number"
                    value={formData.count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        count: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
                    Tartib
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none"
                    min={0}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRamadan}
                    onChange={(e) =>
                      setFormData({ ...formData, isRamadan: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span className="text-sm text-[#D4AF37]/80">
                    Ramazon oyi uchun
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#D4AF37] rounded"
                  />
                  <span className="text-sm text-[#D4AF37]/80">Faol</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#1A1812] px-6 py-4 border-t border-[#D4AF37]/20 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-xl transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-[#0F0E0A] border-t-transparent rounded-full animate-spin" />
                )}
                {editingZikr ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ZikrCard({
  zikr,
  onEdit,
  onDelete,
  onToggle,
  deleting,
}: {
  zikr: Zikr;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  deleting: boolean;
}) {
  return (
    <div className={`p-4 ${!zikr.isActive ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
          {zikr.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-[#FBF0B2]">{zikr.titleLatin}</h4>
            <span className="text-sm text-[#D4AF37] font-medium">
              {zikr.count}x
            </span>
            <span className="text-xs px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full font-bold">
              +{zikr.xpReward || (zikr.count >= 50 ? 2 : 1)} XP
            </span>
            {!zikr.isActive && (
              <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                O'chirilgan
              </span>
            )}
            {zikr.isRamadan && (
              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                🌙 Ramazon
              </span>
            )}
          </div>
          <p className="text-lg text-[#D4AF37]/80 font-arabic" dir="rtl">
            {zikr.textArabic}
          </p>
          <p className="text-sm text-[#D4AF37]/50 italic">{zikr.textLatin}</p>
          {zikr.description && (
            <p className="text-xs text-[#D4AF37]/40 mt-1 line-clamp-1">
              {zikr.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg transition-colors ${zikr.isActive ? "text-green-400 hover:bg-green-500/10" : "text-[#D4AF37]/40 hover:bg-[#D4AF37]/10"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {zikr.isActive ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              )}
            </svg>
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { getUploadUrl } from "@/lib/utils";
import toast from "react-hot-toast";

const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("998")) {
    return `+998 (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("7")) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }
  return phone.startsWith("+") ? phone : `+${phone}`;
};

interface User {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  telegramId: string | null;
  telegramUsername: string | null;
  telegramPhone: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  totalXP: number;
  level: number;
  isActive: boolean;
  completedTests: number;
  testsCompleted?: number;
  zikrCount?: number;
  createdAt: string;
}

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, page, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}/admin/users?page=${page}&limit=20&search=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || data.totalPages || 1);
    } catch (error) {
      console.error("Users fetch error:", error);
      toast.error("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = () => {
    setPage(1);
    setSearchQuery(searchTerm);
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("O'zingizni o'chira olmaysiz");
      return;
    }
    if (!confirm("Bu foydalanuvchini o'chirishni xohlaysizmi?")) return;

    try {
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Foydalanuvchi o'chirildi");
        fetchUsers();
      } else {
        toast.error("O'chirishda xatolik");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      toast.error("O'zingizning rolingizni o'zgartira olmaysiz");
      return;
    }
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success("Rol o'zgartirildi");
        fetchUsers();
      } else {
        toast.error("Rolni o'zgartirishda xatolik");
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else if (selectedUsers.length < 15) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      toast.error("Maksimum 15 ta foydalanuvchi tanlash mumkin");
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A]";
      case "MODERATOR":
        return "bg-[#D4AF37]/30 text-[#FBF0B2]";
      default:
        return "bg-[#D4AF37]/10 text-[#D4AF37]/80";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FBF0B2]">
            Foydalanuvchilar
          </h1>
          <p className="text-sm text-[#D4AF37]/60">
            {users.length > 0 ? `${users.length} ta topildi` : ""}
          </p>
        </div>
        {selectedUsers.length > 0 && (
          <button
            onClick={() => setShowMessageModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A] font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Xabar yuborish ({selectedUsers.length})
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Username, email yoki telefon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            className="w-full px-4 py-3 pl-11 bg-[#1E1C18] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] placeholder-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={searchUsers}
          className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A] font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          Qidirish
        </button>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSearchQuery("");
              setPage(1);
            }}
            className="px-4 py-3 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/20 transition-colors"
          >
            вњ•
          </button>
        )}
      </div>

      {/* Selection Info */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl">
          <p className="text-[#FBF0B2]">
            <strong>{selectedUsers.length}</strong> / 15 foydalanuvchi tanlangan
          </p>
          <button
            onClick={() => setSelectedUsers([])}
            className="text-sm text-[#D4AF37] hover:text-[#FBF0B2] transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-[#1E1C18] border rounded-2xl p-4 transition-all ${
              selectedUsers.includes(user.id)
                ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/30"
                : "border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUserSelection(user.id)}
                className="w-5 h-5 accent-[#D4AF37] rounded mt-2"
              />

              {user.avatar ? (
                <img
                  src={getUploadUrl(user.avatar) || user.avatar}
                  alt={user.username}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-[#D4AF37]/30"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#AA8232] flex items-center justify-center">
                  <span className="text-[#0F0E0A] text-xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#FBF0B2]">
                      {user.username}
                    </h3>
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      disabled={user.id === currentUser?.id}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${getRoleBadgeClass(user.role)} border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <option value="USER">User</option>
                      <option value="MODERATOR">Mod</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedUsers([user.id]);
                        setShowMessageModal(true);
                      }}
                      className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                      title="Xabar yuborish"
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
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="O'chirish"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {user.fullName && (
                  <p className="text-sm text-[#D4AF37]/60">{user.fullName}</p>
                )}

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#D4AF37]/50">
                  {user.email && (
                    <span className="flex items-center gap-1">
                      рџ“§ {user.email}
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      рџ“± {formatPhoneNumber(user.phone)}
                    </span>
                  )}
                  {user.telegramUsername && (
                    <span className="flex items-center gap-1 text-[#0088cc]">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      @{user.telegramUsername}
                    </span>
                  )}
                  {user.telegramPhone && (
                    <span className="flex items-center gap-1 text-[#0088cc]">
                      рџ“ћ {formatPhoneNumber(user.telegramPhone)}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[#D4AF37]/10 flex items-center gap-4 text-sm">
                  <span className="text-[#D4AF37]/60">
                    <span className="font-bold text-[#FBF0B2]">
                      {user.totalXP || 0}
                    </span>{" "}
                    XP
                  </span>
                  <span className="text-[#D4AF37]/60">
                    <span className="font-bold text-[#FBF0B2]">
                      {user.completedTests || user.testsCompleted || 0}
                    </span>{" "}
                    test
                  </span>
                  <span className="text-[#D4AF37]/60">
                    <span className="font-bold text-[#FBF0B2]">
                      {user.zikrCount || 0}
                    </span>{" "}
                    zikr
                  </span>
                  <span className="text-[#D4AF37]/40 ml-auto text-xs">
                    {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-[#D4AF37]/40 bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl">
          Foydalanuvchi topilmadi
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 p-4 bg-[#1E1C18] border border-[#D4AF37]/20 rounded-xl">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Oldingi
          </button>
          <span className="px-4 py-2 text-[#FBF0B2]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Keyingi
          </button>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <MessageModal
          userIds={selectedUsers}
          users={users.filter((u) => selectedUsers.includes(u.id))}
          onClose={() => setShowMessageModal(false)}
          onSuccess={() => {
            setShowMessageModal(false);
            setSelectedUsers([]);
          }}
          token={token!}
          API={API}
        />
      )}
    </div>
  );
}

function MessageModal({
  userIds,
  users,
  onClose,
  onSuccess,
  token,
  API,
}: {
  userIds: string[];
  users: User[];
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  API: string;
}) {
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<
    "email" | "telegram" | "notification" | "all"
  >("notification");
  const [sending, setSending] = useState(false);
  const hasTelegramUsers = users.some((u) => u.telegramId);

  const sendMessage = async () => {
    if (!message.trim()) {
      toast.error("Xabar matnini kiriting");
      return;
    }

    setSending(true);
    try {
      const channels =
        channel === "all" ? ["notification", "email", "telegram"] : [channel];
      const res = await fetch(`${API}/admin/messages/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Admin xabari",
          message: message.trim(),
          targetType: "selected",
          targetIds: userIds,
          channels,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const sentCount =
          data.notifSent ||
          data.emailSent ||
          data.telegramSent ||
          data.recipientsCount ||
          userIds.length;
        toast.success(`Xabar ${sentCount} ta foydalanuvchiga yuborildi`);
        onSuccess();
      } else {
        toast.error(data.message || "Xabar yuborishda xatolik");
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#1E1C18] border border-[#D4AF37]/30 rounded-3xl w-full max-w-md">
        <div className="p-6 border-b border-[#D4AF37]/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#FBF0B2]">
            Xabar yuborish ({userIds.length} ta)
          </h2>
          <button
            onClick={onClose}
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
          <div>
            <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
              Kanal
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="notification">Sayt bildirishnomasi</option>
              <option value="email">Email</option>
              {hasTelegramUsers && <option value="telegram">Telegram</option>}
              <option value="all">Hammasi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#D4AF37]/60 mb-1.5 uppercase tracking-wider">
              Xabar
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Xabaringizni yozing..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] placeholder-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-[#D4AF37]/20 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-xl transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={sendMessage}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending && (
              <div className="w-4 h-4 border-2 border-[#0F0E0A] border-t-transparent rounded-full animate-spin" />
            )}
            {sending ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </div>
      </div>
    </div>
  );
}

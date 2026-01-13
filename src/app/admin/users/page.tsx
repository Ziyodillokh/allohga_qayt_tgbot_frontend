"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { useAdminContext } from "@/contexts/AdminContext";
import { getUploadUrl } from "@/lib/utils";
import toast from "react-hot-toast";

// Telefon raqamni formatlash funksiyasi
const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return "";

  // Faqat raqamlarni olish
  const cleaned = phone.replace(/\D/g, "");

  // O'zbekiston formati: +998 (XX) XXX-XX-XX
  if (cleaned.length === 12 && cleaned.startsWith("998")) {
    return `+998 (${cleaned.slice(3, 5)}) ${cleaned.slice(
      5,
      8
    )}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
  }

  // Rossiya formati: +7 (XXX) XXX-XX-XX
  if (cleaned.length === 11 && cleaned.startsWith("7")) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
      9
    )}-${cleaned.slice(9, 11)}`;
  }

  // Boshqa formatlar uchun oddiy formatlash
  if (cleaned.length >= 10) {
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const areaCode = cleaned.slice(-10, -7);
    const firstPart = cleaned.slice(-7, -4);
    const secondPart = cleaned.slice(-4, -2);
    const thirdPart = cleaned.slice(-2);
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}-${thirdPart}`;
  }

  // Qisqa raqamlar uchun asl formatda qaytarish
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
  createdAt: string;
}

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const { isReadOnly } = useAdminContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const [searchQuery, setSearchQuery] = useState(""); // Actual search query

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, page, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}/admin/users?page=${page}&limit=20&search=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("Users data:", data); // Debug log
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
    setSearchQuery(searchTerm); // Trigger search
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
    } catch (error) {
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
    } catch (error) {
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
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "MODERATOR":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Foydalanuvchilar
        </h1>
        {selectedUsers.length > 0 && !isReadOnly && (
          <button
            onClick={() => setShowMessageModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Username, email yoki telefon orqali qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            title="Qidiruvni tozalash"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Info */}
      {searchQuery && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          "{searchQuery}" uchun qidiruv natijalari
        </div>
      )}

      {/* Selection Info */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-blue-600 dark:text-blue-400">
            <strong>{selectedUsers.length}</strong> / 15 foydalanuvchi tanlangan
          </p>
          <button
            onClick={() => setSelectedUsers([])}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Hammasini bekor qilish
          </button>
        </div>
      )}

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length > 0}
                    onChange={() =>
                      selectedUsers.length > 0
                        ? setSelectedUsers([])
                        : setSelectedUsers(users.slice(0, 15).map((u) => u.id))
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                    title="Hammasini tanlash"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Foydalanuvchi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Kontakt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  XP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Testlar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedUsers.includes(user.id)
                      ? "bg-blue-50 dark:bg-blue-900/10"
                      : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                      title={`${user.username} ni tanlash`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={getUploadUrl(user.avatar) || user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.username}
                        </p>
                        {user.fullName && (
                          <p className="text-sm text-gray-500 truncate">
                            {user.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {/* Email - albatta ko'rsatiladi */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 truncate max-w-[200px]">
                        <span>📧</span>{" "}
                        {user.email || (
                          <span className="text-gray-400 italic">yo'q</span>
                        )}
                      </p>
                      {/* Registratsiyada kiritilgan telefon */}
                      {user.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <span>📱</span> {formatPhoneNumber(user.phone)}
                        </p>
                      )}
                      {/* Telegram ma'lumotlari */}
                      {user.telegramId ||
                      user.telegramPhone ||
                      user.telegramUsername ? (
                        <div className="text-sm">
                          {(user.telegramId || user.telegramUsername) && (
                            <p className="flex items-center gap-1.5 text-[#0088cc]">
                              <svg
                                className="w-4 h-4 flex-shrink-0"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                              </svg>
                              {user.telegramUsername ? (
                                `@${user.telegramUsername}`
                              ) : (
                                <span className="text-gray-400">
                                  ID: {user.telegramId}
                                </span>
                              )}
                            </p>
                          )}
                          {user.telegramPhone && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs pl-5 flex items-center gap-1">
                              <span className="text-red-500">📞</span>{" "}
                              {formatPhoneNumber(user.telegramPhone)}
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      disabled={user.id === currentUser?.id || isReadOnly}
                      className={`px-2 py-1 rounded-lg text-sm font-medium ${getRoleBadgeClass(
                        user.role
                      )} border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
                      title={
                        isReadOnly
                          ? "Faqat ko'rish rejimi"
                          : "Rolni o'zgartirish"
                      }
                    >
                      <option value="USER">User</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.totalXP || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {user.completedTests || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUsers([user.id]);
                          setShowMessageModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
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
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={user.id === currentUser?.id}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow ${
              selectedUsers.includes(user.id) ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUserSelection(user.id)}
                className="w-5 h-5 text-blue-600 rounded mt-1"
                title="Tanlash"
              />

              {user.avatar ? (
                <img
                  src={getUploadUrl(user.avatar) || user.avatar}
                  alt={user.username}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {user.username}
                  </h3>
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    disabled={user.id === currentUser?.id || isReadOnly}
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${getRoleBadgeClass(
                      user.role
                    )} border-0 disabled:opacity-50`}
                    title={isReadOnly ? "Faqat ko'rish rejimi" : "Rol"}
                  >
                    <option value="USER">User</option>
                    <option value="MODERATOR">Mod</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {user.fullName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.fullName}
                  </p>
                )}

                <div className="mt-2 space-y-1">
                  {/* Email - albatta ko'rsatiladi */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                    <span className="text-base">📧</span>
                    <span className="truncate">
                      {user.email || (
                        <span className="italic text-gray-400">yo'q</span>
                      )}
                    </span>
                  </p>
                  {/* Registratsiyada kiritilgan telefon */}
                  {user.phone && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className="text-base">📱</span>{" "}
                      {formatPhoneNumber(user.phone)}
                    </p>
                  )}
                  {/* Telegram ma'lumotlari */}
                  {user.telegramId ||
                  user.telegramPhone ||
                  user.telegramUsername ? (
                    <div className="text-xs space-y-0.5">
                      {(user.telegramId || user.telegramUsername) && (
                        <p className="flex items-center gap-1.5 text-[#0088cc]">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                          </svg>
                          {user.telegramUsername ? (
                            `@${user.telegramUsername}`
                          ) : (
                            <span className="text-gray-400">
                              ID: {user.telegramId}
                            </span>
                          )}
                        </p>
                      )}
                      {user.telegramPhone && (
                        <p className="text-gray-500 dark:text-gray-400 pl-5 flex items-center gap-1">
                          <span className="text-red-500">📞</span>{" "}
                          {formatPhoneNumber(user.telegramPhone)}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {user.totalXP || 0}
                      </span>{" "}
                      XP
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {user.completedTests || 0}
                      </span>{" "}
                      test
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedUsers([user.id]);
                        setShowMessageModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
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
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50"
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
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl">
          Foydalanuvchi topilmadi
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Oldingi
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
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

  // Tanlangan userlardan kamida bittasi telegramId ga ega bo'lsa telegram ko'rsatiladi
  const hasTelegramUsers = users.some((u) => u.telegramId);

  const sendMessage = async () => {
    if (!message.trim()) {
      toast.error("Xabar matnini kiriting");
      return;
    }

    setSending(true);
    try {
      // "all" tanlansa barcha kanallar yuboriladi
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Xabar yuborish ({userIds.length} ta)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            title="Yopish"
          >
            <svg
              className="w-6 h-6"
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

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kanal
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              title="Yuborish kanalini tanlang"
            >
              <option value="notification">Sayt bildirishnomasi</option>
              <option value="email">Email</option>
              {hasTelegramUsers && <option value="telegram">Telegram</option>}
              <option value="all">Hammasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Xabar
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Xabaringizni yozing..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Bekor qilish
            </button>
            <button
              onClick={sendMessage}
              disabled={sending}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Yuborilmoqda..." : "Yuborish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

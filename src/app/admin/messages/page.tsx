"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks";
import { useAdminContext } from "@/contexts/AdminContext";
import { getUploadUrl } from "@/lib/utils";
import toast from "react-hot-toast";

interface User {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  telegramId: string | null;
  avatar: string | null;
}

export default function AdminMessages() {
  const { token } = useAuth();
  const { isReadOnly } = useAdminContext();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "notification",
  ]);
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">(
    "none",
  );
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/admin/users?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || data || []);
      }
    } catch (e) {
      toast.error("Xatolik");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      // eligibleUsers hali bu nuqtada aniqlanmagan, shuning uchun inline logic
      let usersToSelect = users;
      if (!searchTerm.trim()) {
        usersToSelect = users;
      } else {
        const search = searchTerm.toLowerCase().trim();
        usersToSelect = users.filter(
          (u) =>
            u.username?.toLowerCase().includes(search) ||
            u.fullName?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search),
        );
      }
      if (
        selectedChannels.length === 1 &&
        selectedChannels.includes("telegram")
      ) {
        usersToSelect = usersToSelect.filter((u) => u.telegramId);
      }
      if (selectedChannels.length === 1 && selectedChannels.includes("email")) {
        usersToSelect = usersToSelect.filter((u) => u.email);
      }
      setSelectedUsers(usersToSelect.map((u) => u.id));
      setSelectAll(true);
    }
  };

  const toggleChannel = (ch: string) => {
    if (ch === "all") {
      setSelectedChannels(
        selectedChannels.length === 3
          ? ["notification"]
          : ["notification", "email", "telegram"],
      );
      return;
    }
    if (selectedChannels.includes(ch)) {
      if (selectedChannels.length > 1)
        setSelectedChannels(selectedChannels.filter((c) => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Max 50MB");
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      toast.error("Xabar kiriting");
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error("User tanlang");
      return;
    }
    setSending(true);
    try {
      let finalMediaUrl = mediaUrl;
      if (mediaFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", mediaFile);
        console.log(
          "[Upload] Starting upload for file:",
          mediaFile.name,
          "Size:",
          mediaFile.size,
          "Type:",
          mediaFile.type,
        );
        try {
          const uploadRes = await fetch(`${API}/upload/attachment`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          console.log("[Upload] Response status:", uploadRes.status);
          const responseText = await uploadRes.text();
          console.log("[Upload] Response body:", responseText);

          if (uploadRes.ok) {
            const uploadData = JSON.parse(responseText);
            finalMediaUrl = uploadData.url || uploadData.path;
            console.log("[Upload] Success! URL:", finalMediaUrl);
          } else {
            console.error("[Upload] Failed:", responseText);
            toast.error(`Media yuklashda xatolik: ${responseText}`);
            setSending(false);
            setUploading(false);
            return;
          }
        } catch (uploadError: any) {
          console.error("[Upload] Exception:", uploadError);
          toast.error(`Upload xatosi: ${uploadError.message}`);
          setSending(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const requestBody = {
        title: "Xabar",
        message,
        channels: selectedChannels,
        targetType: "selected",
        targetIds: selectedUsers,
        imageUrl: mediaType === "image" ? finalMediaUrl : undefined,
        videoUrl: mediaType === "video" ? finalMediaUrl : undefined,
      };
      console.log("Sending request:", requestBody);

      const res = await fetch(`${API}/admin/messages/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (res.ok) {
        toast.success("Yuborildi");
        setMessage("");
        setSelectedUsers([]);
        setSelectAll(false);
        setMediaFile(null);
        setMediaUrl("");
        setMediaPreview(null);
        setMediaType("none");
      } else {
        toast.error("Xatolik");
      }
    } catch {
      toast.error("Xatolik");
    } finally {
      setSending(false);
    }
  };

  // Qidiruv - username, fullName va email bo'yicha (optimized)
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const search = searchTerm.toLowerCase().trim();
    return users.filter((u) => {
      const matchUsername = u.username?.toLowerCase().includes(search);
      const matchFullName = u.fullName?.toLowerCase().includes(search);
      const matchEmail = u.email?.toLowerCase().includes(search);
      return matchUsername || matchFullName || matchEmail;
    });
  }, [users, searchTerm]);

  const eligibleUsers = useMemo(() => {
    if (
      selectedChannels.length === 1 &&
      selectedChannels.includes("telegram")
    ) {
      return filteredUsers.filter((u) => u.telegramId);
    }
    if (selectedChannels.length === 1 && selectedChannels.includes("email")) {
      return filteredUsers.filter((u) => u.email);
    }
    return filteredUsers;
  }, [filteredUsers, selectedChannels]);

  const getAvatarUrl = (avatar: string | null) => {
    if (!avatar) return null;
    return getUploadUrl(avatar);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
        <svg
          className="w-7 h-7 text-blue-500"
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
        Xabarlar
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Xabar yozish
        </h3>

        {/* Kanallar */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 dark:text-gray-300">
            Kanallar
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Sayt */}
            <button
              onClick={() => toggleChannel("notification")}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                selectedChannels.includes("notification")
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium dark:text-gray-300">
                Sayt
              </span>
              {selectedChannels.includes("notification") && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>

            {/* Email */}
            <button
              onClick={() => toggleChannel("email")}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                selectedChannels.includes("email")
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium dark:text-gray-300">
                Email
              </span>
              {selectedChannels.includes("email") && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>

            {/* Telegram */}
            <button
              onClick={() => toggleChannel("telegram")}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                selectedChannels.includes("telegram")
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <span className="text-sm font-medium dark:text-gray-300">
                Telegram
              </span>
              {selectedChannels.includes("telegram") && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>

            {/* Hammasi */}
            <button
              onClick={() => toggleChannel("all")}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                selectedChannels.length === 3
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
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
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium dark:text-gray-300">
                Hammasi
              </span>
              {selectedChannels.length === 3 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Xabar matni */}
        <div className="mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Xabaringizni yozing..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl resize-none"
          />
        </div>

        {/* Media */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 dark:text-gray-300">
            Media
          </label>
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => {
                setMediaType("none");
                setMediaFile(null);
                setMediaUrl("");
                setMediaPreview(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                mediaType === "none"
                  ? "bg-gray-800 text-white dark:bg-white dark:text-gray-800"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
              }`}
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
              Yoq
            </button>
            <button
              onClick={() => setMediaType("image")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                mediaType === "image"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
              }`}
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Rasm
            </button>
            <button
              onClick={() => setMediaType("video")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                mediaType === "video"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
              }`}
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Video
            </button>
          </div>

          {mediaType !== "none" && (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <input
                ref={fileInputRef}
                type="file"
                accept={mediaType === "image" ? "image/*" : "video/*"}
                onChange={handleFileChange}
                className="hidden"
                title="Media faylini tanlash"
                aria-label="Media faylini tanlash"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-xl hover:border-blue-500 flex items-center justify-center gap-2 text-gray-500"
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {mediaType === "image" ? "Rasm yuklash" : "Video yuklash"}
              </button>
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  setMediaFile(null);
                  setMediaPreview(e.target.value);
                }}
                placeholder="Yoki URL kiriting..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
              />
              {mediaPreview && (
                <div className="relative inline-block">
                  {mediaType === "image" ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="max-h-48 rounded-xl"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      className="max-h-48 rounded-xl"
                    />
                  )}
                  <button
                    onClick={() => {
                      setMediaFile(null);
                      setMediaUrl("");
                      setMediaPreview(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    title="Mediani o'chirish"
                    aria-label="Mediani o'chirish"
                  >
                    <svg
                      className="w-4 h-4"
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
              )}
            </div>
          )}
        </div>

        {/* Yuborish */}
        <button
          onClick={sendMessage}
          disabled={
            sending ||
            uploading ||
            !message.trim() ||
            selectedUsers.length === 0 ||
            isReadOnly
          }
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          title={
            isReadOnly
              ? "Faqat ko'rish rejimi - xabar yuborishga ruxsat yo'q"
              : "Xabar yuborish"
          }
        >
          {sending || uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Yuborilmoqda...
            </>
          ) : isReadOnly ? (
            <>
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Faqat ko'rish rejimi
            </>
          ) : (
            <>
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Yuborish ({selectedUsers.length})
            </>
          )}
        </button>
      </div>

      {/* Foydalanuvchilar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Foydalanuvchilar ({eligibleUsers.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg"
            >
              {selectAll ? "Bekor" : "Hammasi"}
            </button>
            {selectedUsers.length > 0 && (
              <button
                onClick={() => {
                  setSelectedUsers([]);
                  setSelectAll(false);
                }}
                className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg"
              >
                Tozalash
              </button>
            )}
          </div>
        </div>

        <div className="relative mb-4">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ism yoki username bo'yicha qidirish..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition text-gray-900 dark:text-white placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Qidiruvni tozalash"
              aria-label="Qidiruvni tozalash"
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
          )}
        </div>

        {/* Qidiruv natijasi */}
        {searchTerm && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            "{searchTerm}" bo'yicha {eligibleUsers.length} ta natija topildi
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
          {eligibleUsers.map((user) => {
            const avatarUrl = getAvatarUrl(user.avatar);
            const isSelected = selectedUsers.includes(user.id);
            return (
              <label
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleUser(user.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate dark:text-white">
                    {user.username}
                  </p>
                  <div className="flex gap-1">
                    {user.email && (
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {user.telegramId && (
                      <svg
                        className="w-4 h-4 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
          {eligibleUsers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Foydalanuvchi topilmadi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

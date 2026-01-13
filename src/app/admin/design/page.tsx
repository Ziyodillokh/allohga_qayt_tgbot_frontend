"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks";
import { useAdminContext } from "@/contexts/AdminContext";
import toast from "react-hot-toast";

interface DesignSettings {
  id: string;
  lightVideoUrl: string | null;
  darkVideoUrl: string | null;
  videoLoop: boolean;
  videoMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_SETTINGS: Partial<DesignSettings> = {
  lightVideoUrl: null,
  darkVideoUrl: null,
  videoLoop: true,
  videoMuted: true,
};

export default function AdminDesign() {
  const { token } = useAuth();
  const { isReadOnly } = useAdminContext();
  const [settings, setSettings] = useState<DesignSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lightVideo, setLightVideo] = useState("");
  const [darkVideo, setDarkVideo] = useState("");
  const [videoLoop, setVideoLoop] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");

  // File upload states
  const [lightVideoUploading, setLightVideoUploading] = useState(false);
  const [darkVideoUploading, setDarkVideoUploading] = useState(false);
  const [lightUploadProgress, setLightUploadProgress] = useState(0);
  const [darkUploadProgress, setDarkUploadProgress] = useState(0);
  const lightVideoInputRef = useRef<HTMLInputElement>(null);
  const darkVideoInputRef = useRef<HTMLInputElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/admin/design`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setLightVideo(data.lightVideoUrl || "");
        setDarkVideo(data.darkVideoUrl || "");
        setVideoLoop(data.videoLoop ?? true);
        setVideoMuted(data.videoMuted ?? true);
      }
    } catch (error) {
      console.error("Design settings fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Video fayl yuklash funksiyasi - XMLHttpRequest bilan progress
  const uploadVideo = (file: File, mode: "light" | "dark") => {
    const setUploading =
      mode === "light" ? setLightVideoUploading : setDarkVideoUploading;
    const setProgress =
      mode === "light" ? setLightUploadProgress : setDarkUploadProgress;
    const setVideo = mode === "light" ? setLightVideo : setDarkVideo;

    // Fayl turini tekshirish
    if (!file.type.startsWith("video/")) {
      toast.error("Faqat video fayllar yuklash mumkin");
      return;
    }

    // Maksimal hajm - 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video hajmi 100MB dan oshmasligi kerak");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const data = JSON.parse(xhr.responseText);
          const videoUrl = data.url || data;
          // URL ni to'g'ri yasash
          let fullUrl = videoUrl;
          if (!videoUrl.startsWith("http")) {
            // API URL dan base URL olish (masalan: https://api.example.com/api -> https://api.example.com)
            const baseUrl = API.endsWith("/api")
              ? API.slice(0, -4)
              : API.replace("/api", "");
            fullUrl = `${baseUrl}${
              videoUrl.startsWith("/") ? "" : "/"
            }${videoUrl}`;
          }
          setVideo(fullUrl);
          toast.success("Video muvaffaqiyatli yuklandi!");
        } catch {
          toast.error("Javobni o'qishda xatolik");
        }
      } else {
        toast.error("Yuklashda xatolik: " + xhr.status);
      }
      setUploading(false);
      setProgress(0);
    };

    xhr.onerror = () => {
      toast.error("Tarmoq xatosi. Qaytadan urinib ko'ring.");
      setUploading(false);
      setProgress(0);
    };

    xhr.ontimeout = () => {
      toast.error("Yuklash vaqti tugadi");
      setUploading(false);
      setProgress(0);
    };

    xhr.open("POST", `${API}/upload/attachment`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.timeout = 300000; // 5 daqiqa
    xhr.send(formData);
  };

  const handleLightVideoFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) uploadVideo(file, "light");
    if (lightVideoInputRef.current) lightVideoInputRef.current.value = "";
  };

  const handleDarkVideoFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) uploadVideo(file, "dark");
    if (darkVideoInputRef.current) darkVideoInputRef.current.value = "";
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/design`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lightVideoUrl: lightVideo || null,
          darkVideoUrl: darkVideo || null,
          videoLoop,
          videoMuted,
        }),
      });

      if (res.ok) {
        toast.success("Sozlamalar saqlandi");
        fetchSettings();
      } else {
        toast.error("Saqlashda xatolik");
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (
      !confirm(
        "Barcha dizayn sozlamalarini asl holatiga qaytarishni xohlaysizmi?"
      )
    )
      return;

    setLightVideo("");
    setDarkVideo("");
    setVideoLoop(true);
    setVideoMuted(true);

    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/design`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(DEFAULT_SETTINGS),
      });

      if (res.ok) {
        toast.success("Asl holatiga qaytarildi");
        fetchSettings();
      }
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          Dizayn sozlamalari
        </h1>
        <button
          onClick={resetToDefault}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Asl holatiga qaytarish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          {/* Light Mode Video */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Light Mode Video
            </h3>

            {/* URL input */}
            <div className="mb-3">
              <input
                type="url"
                value={lightVideo}
                onChange={(e) => setLightVideo(e.target.value)}
                placeholder="https://example.com/light-video.mp4"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Yoki ajratuvchi */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
              <span className="text-sm text-gray-500">yoki</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
            </div>

            {/* Fayl yuklash */}
            <input
              type="file"
              ref={lightVideoInputRef}
              onChange={handleLightVideoFileChange}
              accept="video/*"
              className="hidden"
              title="Light mode video yuklash"
              aria-label="Light mode video yuklash"
            />
            <button
              onClick={() => lightVideoInputRef.current?.click()}
              disabled={lightVideoUploading}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {lightVideoUploading ? (
                <div className="w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>Yuklanmoqda... {lightUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${lightUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Video fayl yuklash
                </>
              )}
            </button>

            <p className="mt-2 text-sm text-gray-500">
              URL kiriting yoki video fayl yuklang (max 100MB)
            </p>

            {/* Video preview */}
            {lightVideo && (
              <div className="mt-3 relative">
                <video
                  src={lightVideo}
                  className="w-full h-32 object-cover rounded-lg"
                  muted
                />
                <button
                  onClick={() => setLightVideo("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="O'chirish"
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

          {/* Dark Mode Video */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dark Mode Video
            </h3>

            {/* URL input */}
            <div className="mb-3">
              <input
                type="url"
                value={darkVideo}
                onChange={(e) => setDarkVideo(e.target.value)}
                placeholder="https://example.com/dark-video.mp4"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Yoki ajratuvchi */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
              <span className="text-sm text-gray-500">yoki</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
            </div>

            {/* Fayl yuklash */}
            <input
              type="file"
              ref={darkVideoInputRef}
              onChange={handleDarkVideoFileChange}
              accept="video/*"
              className="hidden"
              title="Dark mode video yuklash"
              aria-label="Dark mode video yuklash"
            />
            <button
              onClick={() => darkVideoInputRef.current?.click()}
              disabled={darkVideoUploading}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {darkVideoUploading ? (
                <div className="w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>Yuklanmoqda... {darkUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${darkUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Video fayl yuklash
                </>
              )}
            </button>

            <p className="mt-2 text-sm text-gray-500">
              URL kiriting yoki video fayl yuklang (max 100MB)
            </p>

            {/* Video preview */}
            {darkVideo && (
              <div className="mt-3 relative">
                <video
                  src={darkVideo}
                  className="w-full h-32 object-cover rounded-lg"
                  muted
                />
                <button
                  onClick={() => setDarkVideo("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="O'chirish"
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

          {/* Video Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Video sozlamalari
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">
                  Video takrorlansin (loop)
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={videoLoop}
                    onChange={(e) => setVideoLoop(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-14 h-8 rounded-full transition ${
                      videoLoop ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        videoLoop ? "translate-x-6" : ""
                      }`}
                    />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">
                  Ovozi o'chirilgan (muted)
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={videoMuted}
                    onChange={(e) => setVideoMuted(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-14 h-8 rounded-full transition ${
                      videoMuted
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        videoMuted ? "translate-x-6" : ""
                      }`}
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving || isReadOnly}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            title={isReadOnly ? "Faqat ko'rish rejimi" : "Sozlamalarni saqlash"}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saqlanmoqda...
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saqlash
              </>
            )}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ko'rish
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode("light")}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  previewMode === "light"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setPreviewMode("dark")}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  previewMode === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          <div
            className={`relative rounded-lg overflow-hidden aspect-video ${
              previewMode === "dark" ? "bg-gray-900" : "bg-gray-100"
            }`}
          >
            {(previewMode === "light" ? lightVideo : darkVideo) ? (
              <video
                key={previewMode === "light" ? lightVideo : darkVideo}
                src={previewMode === "light" ? lightVideo : darkVideo}
                autoPlay
                loop={videoLoop}
                muted={videoMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-2"
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
                  <p className="text-gray-500">Video tanlanmagan</p>
                </div>
              </div>
            )}

            {/* Overlay content preview */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`p-6 rounded-xl ${
                  previewMode === "dark"
                    ? "bg-gray-800/80 text-white"
                    : "bg-white/80 text-gray-900"
                }`}
              >
                <h4 className="text-lg font-bold mb-2">Bilimdon</h4>
                <p className="text-sm opacity-75">Preview content</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500 text-center">
            {previewMode === "light" ? "Light" : "Dark"} rejim uchun video
            ko'rinishi
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Agar allaqachon login qilgan bo'lsa - faqat mounted bo'lgandan keyin tekshir
  useEffect(() => {
    if (mounted && token && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [mounted, token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Username va parolni kiriting");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login yoki parol xato");
      }

      if (data.user.role !== "ADMIN") {
        toast.error("Sizda admin huquqi yo'q");
        return;
      }

      login(data.user, data.token);
      toast.success("Muvaffaqiyatli kirildi!");
      router.push("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login yoki parol xato");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0E0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37] rounded-full blur-[200px] opacity-20"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#AA8232] rounded-full blur-[200px] opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[3px] mb-4">
            <div className="w-full h-full rounded-full bg-[#0F0E0A] flex items-center justify-center">
              <span className="text-4xl">🕌</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#FBF0B2] mb-1">
            Allohga Qayting
          </h1>
          <p className="text-[#D4AF37]/60 text-sm">Admin Panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-[#FBF0B2] mb-6 text-center">
            Tizimga kirish
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#D4AF37]/80 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] placeholder-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none transition-colors"
                  placeholder="admin"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/40">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#D4AF37]/80 mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0F0E0A] border border-[#D4AF37]/30 rounded-xl text-[#FBF0B2] placeholder-[#D4AF37]/40 focus:border-[#D4AF37] focus:outline-none transition-colors pr-12"
                  placeholder="вЂўвЂўвЂўвЂўвЂўвЂўвЂўвЂў"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/40 hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#0F0E0A] border-t-transparent rounded-full animate-spin"></div>
                  Kirish...
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Kirish
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[#D4AF37]/40 text-xs mt-6">
          В© 2026 Allohga Qayting. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}

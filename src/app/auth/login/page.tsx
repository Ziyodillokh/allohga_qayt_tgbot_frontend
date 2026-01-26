"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Brain,
  Trophy,
  Zap,
} from "lucide-react";
import { isTelegramWebApp } from "../../../lib/telegram";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email yoki username kiritilmagan"),
  password: z.string().min(1, "Parol kiritilmagan"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isTelegram = isTelegramWebApp();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      });

      const userData = response.data.user;
      const tokenData = response.data.token;

      // Backend to'liq user va token qaytaradi
      login(userData, tokenData);

      toast.success("Muvaffaqiyatli kirildi!");

      // Admin uchun admin panelga yo'naltirish
      if (userData.role === "ADMIN" || userData.role === "MODERATOR") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error?.response?.data?.message || "Login yoki parol xato";
      setError("emailOrUsername", { message });
      setError("password", { message: " " }); // parol maydoniga ham xato ko'rsatish
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  const features = [
    { icon: Brain, text: "AI yordamchi bilan o'rganing" },
    { icon: Trophy, text: "Reytingda yuqoriga ko'taring" },
    { icon: Zap, text: "XP to'plang va darajangizni oshiring" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-yellow-300" />
              </div>
              <h1 className="text-4xl font-bold">Allohga Qayting</h1>
            </div>

            <h2 className="text-3xl font-semibold mb-4 leading-tight">
              Bilimingizni sinang va
              <br />
              <span className="text-yellow-300">yangi cho'qqilarga</span>{" "}
              erishing
            </h2>

            <p className="text-white/70 text-lg mb-8 max-w-md">
              30+ kategoriya, minglab savollar va AI yordamchi bilan
              bilimingizni oshiring
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-yellow-300" />
                  </div>
                  <span className="text-white/90">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex gap-8"
          >
            <div>
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-white/60 text-sm">Savollar</div>
            </div>
            <div>
              <div className="text-3xl font-bold">30+</div>
              <div className="text-white/60 text-sm">Kategoriyalar</div>
            </div>
            <div>
              <div className="text-3xl font-bold">AI</div>
              <div className="text-white/60 text-sm">Yordamchi</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tavba
              </h1>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Xush kelibsiz! 👋
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Hisobingizga kiring va davom eting
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Umumiy xato xabari */}
              {errors.emailOrUsername?.message &&
                errors.emailOrUsername.message !==
                  "Email yoki username kiritilmagan" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center"
                  >
                    <p className="text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2">
                      <span>❌</span> {errors.emailOrUsername.message}
                    </p>
                  </motion.div>
                )}

              {/* Email/Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email yoki Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    {...register("emailOrUsername")}
                    placeholder="email@example.com"
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border ${
                      errors.emailOrUsername
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 dark:border-gray-600 focus:ring-indigo-500"
                    } rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-white placeholder-gray-400`}
                  />
                </div>
                {errors.emailOrUsername && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                  >
                    <span>⚠️</span> {errors.emailOrUsername.message}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 dark:border-gray-600 focus:ring-indigo-500"
                    } rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 dark:text-white placeholder-gray-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                  >
                    <span>⚠️</span> {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium transition-colors"
                >
                  Parolni unutdingizmi?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Kirilyapti...
                  </>
                ) : (
                  <>
                    Kirish
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                  yoki
                </span>
              </div>
            </div>

            {/* Register Link */}
            <p className="text-center text-gray-600 dark:text-gray-400">
              Hisobingiz yo'qmi?{" "}
              <Link
                href={isTelegram ? "/auth/telegram-register" : "/auth/register"}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Ro'yxatdan o'ting
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Davom etish orqali{" "}
            <Link href="/terms" className="text-indigo-600 hover:underline">
              Foydalanish shartlari
            </Link>{" "}
            va{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline">
              Maxfiylik siyosati
            </Link>
            ga rozilik bildirasiz
          </p>
        </motion.div>
      </div>
    </div>
  );
}

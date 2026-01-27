"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authApi } from "./../../../lib/api";
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
} from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Yaroqli email manzil kiriting"),
});

const resetPasswordSchema = z
  .object({
    code: z.string().length(6, "Kod 6 ta raqamdan iborat bo'lishi kerak"),
    newPassword: z
      .string()
      .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ["confirmPassword"],
  });

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    "email" | "code" | "success" | "invite-sent"
  >("email");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle OTP input
  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Update form value
    resetForm.setValue("code", newCode.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setVerificationCode(newCode);
      resetForm.setValue("code", pastedData);
      inputRefs.current[5]?.focus();
    }
  };

  // Resend code
  const resendCode = async () => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success("Kod qayta yuborildi!");
      startCountdown();
      setVerificationCode(["", "", "", "", "", ""]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEmail = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(data.email);
      const result = response.data; // Get data from axios response
      setEmail(data.email);

      // Check response type
      if (result.type === "invite") {
        // User not registered - show error and send invite
        toast.error(
          "вќЊ Bu email ro'yxatdan o'tmagan! O'zingiz ro'yxatdan o'tgan emailni kiriting.",
          {
            duration: 5000,
          },
        );
        toast.success(
          "рџ“Ё Taklif havolasi emailga yuborildi. Ro'yxatdan o'ting!",
          {
            duration: 5000,
          },
        );
        setStep("invite-sent");
      } else if (result.type === "wrong-email") {
        // Other registered user - wrong email error
        toast.error(
          "вќЊ Siz noto'g'ri email kiritdingiz. Iltimos, o'zingizning emailingizni kiriting.",
        );
        emailForm.setError("email", {
          type: "manual",
          message:
            "Siz noto'g'ri email kiritdingiz. O'zingizning emailingizni kiriting.",
        });
      } else {
        // Registered user - reset code sent
        setStep("code");
        startCountdown();
        toast.success("рџ”ђ Tiklash kodi emailga yuborildi!");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Xatolik yuz berdi";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        code: data.code,
        newPassword: data.newPassword,
      });
      setStep("success");
      toast.success("Parol muvaffaqiyatli yangilandi!");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Xatolik yuz berdi";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Invite sent screen (for non-registered users)
  if (step === "invite-sent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center shadow-2xl">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative mx-auto mb-6"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-5xl"
                >
                  вќЊ
                </motion.span>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-2xl -z-10" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-3"
            >
              вљ пёЏ Email topilmadi!
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-red-400 font-medium mb-4">
                Bu email bilan ro'yxatdan o'tilmagan!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/30 mb-6">
                <Mail className="h-4 w-4 text-red-400" />
                <span className="text-red-300 font-medium">{email}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Agar siz Tavba platformasida ro'yxatdan o'tgan bo'lsangiz,{" "}
                <strong className="text-white">
                  o'zingizning emailingizni
                </strong>{" "}
                kiriting.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Emailingizga{" "}
                <strong className="text-cyan-400">taklif havolasi</strong>{" "}
                yuborildi. Ro'yxatdan o'tib, bilimingizni sinab ko'ring!
              </p>
            </motion.div>

            {/* Info box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6"
            >
              <p className="text-yellow-300 text-sm">
                рџ’Ў <strong>Eslatma:</strong> Parolni tiklash faqat ro'yxatdan
                o'tgan email uchun ishlaydi
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/25"
              >
                рџљЂ Ro'yxatdan o'tish
              </Link>

              <button
                onClick={() => {
                  setStep("email");
                  setEmail("");
                }}
                className="inline-flex items-center justify-center gap-2 w-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Boshqa email kiritish
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success screen
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">
              Parol yangilandi!
            </h1>

            <p className="text-gray-400 mb-6">
              Yangi parolingiz bilan tizimga kirishingiz mumkin.
            </p>

            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Tizimga kirish
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Code entry screen
  if (step === "code") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            {/* Premium Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative mx-auto mb-6"
              >
                <div className="h-20 w-20 mx-auto bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <KeyRound className="h-10 w-10 text-white" />
                  </motion.div>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl -z-10" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-2"
              >
                рџ”ђ Parolni tiklash
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-gray-400 text-sm">
                  6 raqamli tasdiqlash kodi yuborildi
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/30">
                  <Mail className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-300 font-medium">{email}</span>
                </div>
              </motion.div>
            </div>

            {/* Form */}
            <form
              onSubmit={resetForm.handleSubmit(onSubmitReset)}
              className="space-y-6"
            >
              {/* Premium OTP Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                  Tasdiqlash kodini kiriting
                </label>
                <div
                  className="flex justify-center gap-2 sm:gap-3"
                  onPaste={handlePaste}
                >
                  {verificationCode.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="relative"
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleCodeInput(
                            index,
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        aria-label={`Kod raqami ${index + 1}`}
                        className={`
                          w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold 
                          bg-gray-700/50 border-2 rounded-xl
                          transition-all duration-300 ease-out
                          outline-none text-white
                          ${
                            digit
                              ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                              : "border-gray-600 hover:border-gray-500"
                          }
                          focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20
                          focus:scale-105 focus:shadow-xl
                        `}
                      />
                      {/* Active indicator dot */}
                      <div
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          digit
                            ? "bg-purple-500 scale-100"
                            : "bg-gray-600 scale-75"
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Progress indicator */}
                <div className="flex justify-center gap-1 mt-4">
                  {verificationCode.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        digit
                          ? "w-6 bg-gradient-to-r from-purple-500 to-pink-500"
                          : "w-4 bg-gray-600"
                      }`}
                    />
                  ))}
                </div>

                {resetForm.formState.errors.code && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-3 text-center"
                  >
                    {resetForm.formState.errors.code.message}
                  </motion.p>
                )}

                {/* Hidden input for form validation */}
                <input type="hidden" {...resetForm.register("code")} />
              </motion.div>

              {/* New Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Yangi parol
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    {...resetForm.register("newPassword")}
                    type={showPassword ? "text" : "password"}
                    placeholder="вЂўвЂўвЂўвЂўвЂўвЂўвЂўвЂў"
                    className={`w-full bg-gray-700/50 border-2 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                      resetForm.formState.errors.newPassword
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Parolni tasdiqlang
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    {...resetForm.register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="вЂўвЂўвЂўвЂўвЂўвЂўвЂўвЂў"
                    className={`w-full bg-gray-700/50 border-2 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                      resetForm.formState.errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || verificationCode.some((d) => !d)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Tekshirilmoqda...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Parolni yangilash
                  </>
                )}
              </motion.button>
            </form>

            {/* Resend Code Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              {countdown > 0 ? (
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-700/30 rounded-xl">
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-600"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={75}
                        strokeDashoffset={75 - (countdown / 60) * 75}
                        strokeLinecap="round"
                        className="text-purple-500 transition-all duration-1000"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {countdown}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    soniya kutib turing
                  </span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resendCode}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Kodni qayta yuborish
                </motion.button>
              )}
            </motion.div>

            {/* Back button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-4 text-center"
            >
              <button
                onClick={() => {
                  setStep("email");
                  setVerificationCode(["", "", "", "", "", ""]);
                }}
                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Emailni o'zgartirish
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Email entry screen (default)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Parolni unutdingizmi?
            </h1>
            <p className="text-gray-400">
              Email manzilingizni kiriting va biz sizga parolni tiklash kodini
              yuboramiz
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={emailForm.handleSubmit(onSubmitEmail)}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email manzil
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...emailForm.register("email")}
                  type="email"
                  placeholder="email@example.com"
                  className={`w-full bg-gray-700/50 border rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    emailForm.formState.errors.email
                      ? "border-red-500"
                      : "border-gray-600"
                  }`}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Green reminder note */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
            >
              <div className="mt-0.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-emerald-300 text-xs leading-relaxed">
                <strong>Eslatma:</strong> Faqat saytda{" "}
                <strong>ro'yxatdan o'tgan</strong> email manzilga parolni
                tiklash kodi yuboriladi. Agar ro'yxatdan o'tmagan bo'lsangiz,
                taklif havolasi yuboriladi.
              </p>
            </motion.div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kodni yuborish
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kirish sahifasiga qaytish
            </Link>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Parolingizni eslaysizmi?{" "}
          <Link
            href="/auth/login"
            className="text-purple-400 hover:text-purple-300"
          >
            Tizimga kirish
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

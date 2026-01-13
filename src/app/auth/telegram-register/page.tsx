"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  Check,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/auth";
import {
  isTelegramWebApp,
  getTelegramInitData,
  telegramHaptic,
  telegramReady,
  telegramExpand,
  requestTelegramContact,
} from "../../../lib/telegram";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type Step = "phone" | "credentials" | "completed";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export default function TelegramRegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<Step>("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Phone step
  const [phone, setPhone] = useState("");
  const [phoneShared, setPhoneShared] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Credentials step
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Initialize
  useEffect(() => {
    const initTelegram = async () => {
      // Check if in Telegram - if not, still allow but show warning
      const inTelegram = isTelegramWebApp();

      if (inTelegram) {
        telegramReady();
        telegramExpand();
      }

      const initData = getTelegramInitData();
      if (initData) {
        try {
          const params = new URLSearchParams(initData);
          const userStr = params.get("user");
          if (userStr) {
            const tgUser = JSON.parse(userStr);
            setTelegramUser(tgUser);
            if (tgUser.username) {
              setUsername(tgUser.username);
            }
          }
        } catch (e) {
          console.error("Parse telegram user error:", e);
        }

        // Authenticate with Telegram
        try {
          console.log("[Init] Authenticating with Telegram...");
          const res = await axios.post(`${API_URL}/telegram/webapp/auth`, {
            initData,
          });
          console.log("[Init] Auth response:", res.data);

          if (res.data.user && res.data.token) {
            setCurrentToken(res.data.token);
            console.log(
              "[Init] Token set:",
              res.data.token?.substring(0, 20) + "..."
            );

            // If already has phone, go to step 2
            if (res.data.user.telegramPhone) {
              console.log(
                "[Init] User already has phone:",
                res.data.user.telegramPhone
              );
              setPhone(res.data.user.telegramPhone);
              setPhoneShared(true);
              setCurrentStep("credentials");
            }

            // If already fully registered, redirect to home
            if (res.data.user.password) {
              login(res.data.user, res.data.token);
              toast.success("Siz allaqachon ro'yxatdan o'tgansiz!");
              router.push("/");
              return;
            }

            // If no phone yet, start polling immediately
            if (!res.data.user.telegramPhone) {
              console.log("[Init] No phone, starting auto-polling...");
              setIsLoading(true);
              // Store token for polling
              setTimeout(() => {
                startPollingWithToken(res.data.token);
              }, 500);
            }
          }
        } catch (e) {
          console.error("Telegram auth error:", e);
          toast.error("Xatolik yuz berdi");
        }
      }

      setIsInitialized(true);
    };

    initTelegram();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Check username availability
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await axios.post(`${API_URL}/auth/check-username`, {
          username,
        });
        setUsernameAvailable(res.data.available);
      } catch (e) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Request phone from Telegram
  const handleRequestPhone = () => {
    telegramHaptic("impact");
    setIsLoading(true);

    // Request contact via Telegram API
    requestTelegramContact((contact: any) => {
      if (contact && contact.phone_number) {
        handlePhoneReceived(contact.phone_number);
      }
    });

    // Start polling as backup
    startPollingForPhone();
  };

  // Polling with explicit token (for initial load)
  const startPollingWithToken = (token: string) => {
    console.log("[Polling] Starting with token...");
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes

    pollingRef.current = setInterval(async () => {
      attempts++;

      if (attempts >= maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.telegramPhone) {
          console.log("[Polling] Phone found:", res.data.telegramPhone);
          if (pollingRef.current) clearInterval(pollingRef.current);
          handlePhoneReceived(res.data.telegramPhone);
        }
      } catch (e) {
        // Ignore errors
      }
    }, 1000);
  };

  const startPollingForPhone = () => {
    if (!currentToken) {
      console.log("[Polling] No token, skipping");
      return;
    }

    console.log("[Polling] Starting phone polling...");
    let attempts = 0;
    const maxAttempts = 60; // Increased to 60 attempts (1 minute)

    pollingRef.current = setInterval(async () => {
      attempts++;
      console.log(`[Polling] Attempt ${attempts}/${maxAttempts}`);

      if (attempts >= maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setIsLoading(false);
        toast.error("Telefon raqam olinmadi. Qaytadan urinib ko'ring.");
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        console.log(`[Polling] Response:`, res.data?.telegramPhone);

        if (res.data.telegramPhone) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          handlePhoneReceived(res.data.telegramPhone);
        }
      } catch (e) {
        console.error("[Polling] Error:", e);
      }
    }, 1000);
  };

  const handlePhoneReceived = (phoneNumber: string) => {
    const formattedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : "+" + phoneNumber;
    setPhone(formattedPhone);
    setPhoneShared(true);
    setIsLoading(false);
    telegramHaptic("success");
    toast.success("✅ Telefon raqam qabul qilindi!");
    setCurrentStep("credentials");

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  };

  // Manual check phone button
  const handleCheckPhone = async () => {
    setIsLoading(true);

    // If no token, try to authenticate first
    let token = currentToken;
    if (!token) {
      const initData = getTelegramInitData();
      if (initData) {
        try {
          const authRes = await axios.post(`${API_URL}/telegram/webapp/auth`, {
            initData,
          });
          if (authRes.data.token) {
            token = authRes.data.token;
            setCurrentToken(token);

            // If already has phone from auth response
            if (authRes.data.user?.telegramPhone) {
              handlePhoneReceived(authRes.data.user.telegramPhone);
              return;
            }
          }
        } catch (e) {
          console.error("Auth error:", e);
        }
      }
    }

    if (!token) {
      toast.error("Telegram orqali kiring");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.telegramPhone) {
        handlePhoneReceived(res.data.telegramPhone);
      } else {
        toast.error("Telefon raqam topilmadi. Avval chatda telefon ulashing!");
        setIsLoading(false);
      }
    } catch (e) {
      toast.error("Xatolik yuz berdi");
      setIsLoading(false);
    }
  };

  // Complete registration
  const handleCompleteRegistration = async () => {
    // Validation
    if (!username || username.length < 3) {
      toast.error("Username kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (usernameAvailable === false) {
      toast.error("Bu username band, boshqasini tanlang");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Parollar mos kelmadi");
      return;
    }

    setIsLoading(true);
    telegramHaptic("impact");

    try {
      const res = await axios.post(
        `${API_URL}/telegram/webapp/complete-registration`,
        { username, password, phone },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      if (res.data.success) {
        login(res.data.user, res.data.token || currentToken);
        telegramHaptic("success");
        toast.success("🎉 Ro'yxatdan o'tish muvaffaqiyatli!");
        setCurrentStep("completed");

        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (error: any) {
      telegramHaptic("error");
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone for display
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 12 && cleaned.startsWith("998")) {
      return `+998 (${cleaned.slice(3, 5)}) ${cleaned.slice(
        5,
        8
      )}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
    }
    return phone;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {["phone", "credentials", "completed"].map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              currentStep === step
                ? "bg-blue-600 text-white scale-110"
                : index <
                  ["phone", "credentials", "completed"].indexOf(currentStep)
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
            }`}
          >
            {index <
            ["phone", "credentials", "completed"].indexOf(currentStep) ? (
              <Check className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>
          {index < 2 && (
            <div
              className={`w-8 h-1 mx-1 rounded ${
                index <
                ["phone", "credentials", "completed"].indexOf(currentStep)
                  ? "bg-green-500"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Ro'yxatdan o'tish
          </h1>
          {telegramUser?.first_name && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {telegramUser.first_name}, xush kelibsiz!
            </p>
          )}
        </div>

        {renderStepIndicator()}

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5">
          <AnimatePresence mode="wait">
            {/* Step 1: Phone */}
            {currentStep === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Telefon raqamingiz
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Saytdan kirish uchun telefon raqamingiz kerak
                  </p>
                </div>

                <button
                  onClick={handleRequestPhone}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Kutilmoqda...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      Telefon raqamni ulashish
                    </>
                  )}
                </button>

                {/* Manual check button */}
                <button
                  onClick={handleCheckPhone}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                  Telefon ulashdim, davom etish
                </button>

                <p className="text-xs text-center text-gray-400">
                  Telegram sizdan telefon raqamni ulashishni so'raydi
                </p>
              </motion.div>
            )}

            {/* Step 2: Credentials */}
            {currentStep === "credentials" && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hisob ma'lumotlari
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Saytdan kirish uchun username va parol yarating
                  </p>
                </div>

                {/* Phone display */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {formatPhone(phone)}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "")
                        )
                      }
                      placeholder="username"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    {checkingUsername && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">
                        ✕
                      </span>
                    )}
                  </div>
                  {telegramUser?.username && (
                    <p className="text-xs text-gray-400 mt-1">
                      Telegram: @{telegramUser.username}
                    </p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-xs text-red-500 mt-1">
                      Bu username band
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Parol
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kamida 6 ta belgi"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Parolni tasdiqlang
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Parolni qayta kiriting"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {password && confirmPassword && (
                    <p
                      className={`text-xs mt-1 ${
                        password === confirmPassword
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {password === confirmPassword
                        ? "✓ Parollar mos"
                        : "✕ Parollar mos emas"}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleCompleteRegistration}
                  disabled={
                    isLoading ||
                    !username ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    usernameAvailable === false
                  }
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Ro'yxatdan o'tish
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Step 3: Completed */}
            {currentStep === "completed" && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Tabriklaymiz! 🎉
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Ro'yxatdan muvaffaqiyatli o'tdingiz
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-left space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Username: <strong>{username}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatPhone(phone)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Platformaga yo'naltirilmoqdasiz...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

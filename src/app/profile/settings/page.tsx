"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Trash2,
  LogOut,
  ChevronRight,
  Volume2,
  VolumeX,
  Vibrate,
  Smartphone,
  MessageSquare,
  HelpCircle,
  Info,
  Mail,
  Lock,
  User,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

interface SettingItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  type: "toggle" | "link" | "action" | "select";
  value?: boolean;
  href?: string;
  options?: { value: string; label: string }[];
  selectedValue?: string;
  danger?: boolean;
  onClick?: () => void;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const authStore = useAuthStore();

  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    vibration: true,
    darkMode: true,
    language: "uz",
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Telegram webapp'da avtomatik auth bo'ladi
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("tavba-settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Settings parse error:", e);
      }
    }
  }, []);

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("tavba-settings", JSON.stringify(newSettings));
    toast.success("Sozlama saqlandi");
  };

  const handleLogout = async () => {
    try {
      await logout();
      authStore.logout();
      router.push("/");
      toast.success("Tizimdan chiqdingiz");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDeleteAccount = async () => {
    // Bu yerda account o'chirish logikasi bo'ladi
    toast.error("Bu funksiya hozircha mavjud emas");
    setShowDeleteConfirm(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Bildirishnomalar",
      icon: Bell,
      items: [
        {
          id: "notifications",
          icon: Bell,
          label: "Bildirishnomalar",
          description: "Push bildirishnomalarni yoqish/o'chirish",
          type: "toggle" as const,
          value: settings.notifications,
        },
        {
          id: "sound",
          icon: settings.sound ? Volume2 : VolumeX,
          label: "Ovoz",
          description: "Bildirishnoma ovozlari",
          type: "toggle" as const,
          value: settings.sound,
        },
        {
          id: "vibration",
          icon: Vibrate,
          label: "Tebranish",
          description: "Tebranish (vibration) effekti",
          type: "toggle" as const,
          value: settings.vibration,
        },
      ],
    },
    {
      title: "Ko'rinish",
      icon: Moon,
      items: [
        {
          id: "darkMode",
          icon: settings.darkMode ? Moon : Sun,
          label: "Qorong'u rejim",
          description: "Tungi ko'rinishni yoqish",
          type: "toggle" as const,
          value: settings.darkMode,
        },
        {
          id: "language",
          icon: Globe,
          label: "Til",
          description: "Ilova tilini tanlash",
          type: "select" as const,
          selectedValue: settings.language,
          options: [
            { value: "uz", label: "O'zbekcha" },
            { value: "ru", label: "Р СѓСЃСЃРєРёР№" },
            { value: "en", label: "English" },
          ],
        },
      ],
    },
    {
      title: "Hisob",
      icon: User,
      items: [
        {
          id: "profile",
          icon: User,
          label: "Profilni tahrirlash",
          description: "Ism, avatar va bio",
          type: "link" as const,
          href: "/profile/edit",
        },
        {
          id: "password",
          icon: Lock,
          label: "Parolni o'zgartirish",
          description: "Xavfsizlik uchun yangi parol",
          type: "link" as const,
          href: "/profile/change-password",
        },
        {
          id: "email",
          icon: Mail,
          label: "Email o'zgartirish",
          description: "Yangi email manzil",
          type: "link" as const,
          href: "/profile/change-email",
        },
      ],
    },
    {
      title: "Qo'llab-quvvatlash",
      icon: HelpCircle,
      items: [
        {
          id: "help",
          icon: HelpCircle,
          label: "Yordam markazi",
          description: "Savollar va javoblar",
          type: "link" as const,
          href: "/help",
        },
        {
          id: "about",
          icon: Info,
          label: "Ilova haqida",
          description: "Versiya va ma'lumotlar",
          type: "link" as const,
          href: "/about",
        },
        {
          id: "feedback",
          icon: MessageSquare,
          label: "Fikr-mulohaza",
          description: "Bizga xabar yuboring",
          type: "link" as const,
          href: "https://t.me/Khamidov_online",
        },
      ],
    },
    {
      title: "Xavfli zona",
      icon: Shield,
      items: [
        {
          id: "logout",
          icon: LogOut,
          label: "Chiqish",
          description: "Tizimdan chiqish",
          type: "action" as const,
          onClick: () => setShowLogoutConfirm(true),
        },
        {
          id: "delete",
          icon: Trash2,
          label: "Hisobni o'chirish",
          description: "Barcha ma'lumotlar o'chadi",
          type: "action" as const,
          danger: true,
          onClick: () => setShowDeleteConfirm(true),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0D0A] relative overflow-x-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] bg-gradient-radial from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] bg-gradient-radial from-[#AA8232]/10 via-[#AA8232]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-[#1E1C18]/60 border border-[#D4AF37]/10 backdrop-blur-xl hover:bg-[#1E1C18] hover:border-[#D4AF37]/30 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h1 className="text-xl font-bold text-white">Sozlamalar</h1>
            </div>
            <p className="text-xs text-[#9A8866] mt-0.5">Ilovani sozlash</p>
          </div>
        </header>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-bold text-[#9A8866] uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
                <section.icon className="w-3.5 h-3.5 text-[#D4AF37]" />
                {section.title}
              </h2>

              <div className="rounded-2xl bg-[#1E1C18]/80 border border-[#D4AF37]/10 overflow-hidden divide-y divide-[#D4AF37]/5">
                {section.items.map((item) => (
                  <SettingRow
                    key={item.id}
                    item={item}
                    onToggle={(value) => updateSetting(item.id, value)}
                    onSelect={(value) => updateSetting(item.id, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#9A8866]">Allohga Qayting v1.0.0</p>
          <p className="text-[10px] text-[#9A8866]/60 mt-1">
            В© 2025 Barcha huquqlar himoyalangan
          </p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#1E1C18] border border-[#D4AF37]/20">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Chiqishni tasdiqlang
            </h3>
            <p className="text-sm text-[#9A8866] text-center mb-6">
              Tizimdan chiqmoqchimisiz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0F0D0A] border border-[#D4AF37]/20 text-white font-medium hover:bg-[#0F0D0A]/80 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-[#D4AF37] text-[#0F0D0A] font-medium hover:bg-[#FBF0B2] transition-colors"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#1E1C18] border border-[#ef4444]/20">
            <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Hisobni o'chirish
            </h3>
            <p className="text-sm text-[#9A8866] text-center mb-6">
              Bu amalni ortga qaytarib bo'lmaydi. Barcha ma'lumotlaringiz o'chib
              ketadi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0F0D0A] border border-[#D4AF37]/20 text-white font-medium hover:bg-[#0F0D0A]/80 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 px-4 rounded-xl bg-[#ef4444] text-white font-medium hover:bg-[#dc2626] transition-colors"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SettingRowProps {
  item: SettingItem;
  onToggle?: (value: boolean) => void;
  onSelect?: (value: string) => void;
}

function SettingRow({ item, onToggle, onSelect }: SettingRowProps) {
  const [showSelect, setShowSelect] = useState(false);

  if (item.type === "toggle") {
    return (
      <div className="flex items-center justify-between p-4 hover:bg-[#D4AF37]/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <item.icon className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{item.label}</p>
            {item.description && (
              <p className="text-[11px] text-[#9A8866]">{item.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggle?.(!item.value)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            item.value
              ? "bg-[#D4AF37]"
              : "bg-[#0F0D0A] border border-[#D4AF37]/20"
          }`}
        >
          <div
            className={`absolute top-1 w-5 h-5 rounded-full transition-all ${
              item.value ? "right-1 bg-[#0F0D0A]" : "left-1 bg-[#9A8866]"
            }`}
          />
        </button>
      </div>
    );
  }

  if (item.type === "select") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowSelect(!showSelect)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#D4AF37]/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              {item.description && (
                <p className="text-[11px] text-[#9A8866]">{item.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#D4AF37]">
              {item.options?.find((o) => o.value === item.selectedValue)?.label}
            </span>
            <ChevronRight
              className={`w-4 h-4 text-[#9A8866] transition-transform ${showSelect ? "rotate-90" : ""}`}
            />
          </div>
        </button>

        {showSelect && (
          <div className="px-4 pb-3">
            <div className="rounded-xl bg-[#0F0D0A] border border-[#D4AF37]/10 overflow-hidden">
              {item.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect?.(option.value);
                    setShowSelect(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 hover:bg-[#D4AF37]/5 transition-colors ${
                    option.value === item.selectedValue ? "bg-[#D4AF37]/10" : ""
                  }`}
                >
                  <span className="text-sm text-white">{option.label}</span>
                  {option.value === item.selectedValue && (
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (item.type === "link") {
    const isExternal = item.href?.startsWith("http");
    const LinkComponent = isExternal ? "a" : Link;
    const linkProps = isExternal
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <LinkComponent
        href={item.href || "#"}
        {...linkProps}
        className="flex items-center justify-between p-4 hover:bg-[#D4AF37]/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <item.icon className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{item.label}</p>
            {item.description && (
              <p className="text-[11px] text-[#9A8866]">{item.description}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#9A8866]" />
      </LinkComponent>
    );
  }

  if (item.type === "action") {
    return (
      <button
        onClick={item.onClick}
        className={`w-full flex items-center justify-between p-4 transition-colors ${
          item.danger ? "hover:bg-[#ef4444]/5" : "hover:bg-[#D4AF37]/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              item.danger ? "bg-[#ef4444]/10" : "bg-[#D4AF37]/10"
            }`}
          >
            <item.icon
              className={`w-5 h-5 ${item.danger ? "text-[#ef4444]" : "text-[#D4AF37]"}`}
            />
          </div>
          <div>
            <p
              className={`text-sm font-medium ${item.danger ? "text-[#ef4444]" : "text-white"}`}
            >
              {item.label}
            </p>
            {item.description && (
              <p className="text-[11px] text-[#9A8866]">{item.description}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#9A8866]" />
      </button>
    );
  }

  return null;
}

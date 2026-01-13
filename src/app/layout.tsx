import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header, BottomNav } from "../components/layout";
import "./globals.css";
import { VideoBackground } from "../components/ui";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "Allohga Qayting - Islomiy Bilim Platformasi",
    template: "%s | Allohga Qayting",
  },
  description:
    "Islomiy bilim testlari topshiring, diniy bilimingizni sinang, reytingda raqobatlashing va AI yordamchisidan foydalaning",
  keywords: [
    "allohga-qayting",
    "test",
    "quiz",
    "islomiy",
    "diniy",
    "bilim",
    "o'zbek",
    "din",
    "qur'on",
  ],
  authors: [{ name: "Allohga Qayting Team" }],
  creator: "Allohga Qayting",
  publisher: "Allohga Qayting",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://allohgaqayting.uz",
    siteName: "Allohga Qayting",
    title: "Allohga Qayting - Islomiy Bilim Platformasi",
    description:
      "Islomiy bilim testlari topshiring, diniy bilimingizni sinang, raqobatlashing",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allohga Qayting - Islomiy Bilim Platformasi",
    description:
      "Islomiy bilim testlari topshiring, diniy bilimingizni sinang, raqobatlashing",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('bilimdon-app') && JSON.parse(localStorage.getItem('bilimdon-app')).state.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (!localStorage.getItem('bilimdon-app') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        {/* Telegram WebApp Script */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className={inter.className}>
        <VideoBackground />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav />
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--toast-bg)",
              color: "var(--toast-color)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}

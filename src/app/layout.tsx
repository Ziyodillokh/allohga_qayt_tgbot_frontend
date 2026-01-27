import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { Header, BottomNav } from "../components/layout";
import { Providers } from "../components/Providers";
import "./globals.css";
import { VideoBackground } from "../components/ui";

export const metadata: Metadata = {
  metadataBase: new URL("https://allohgaqayt.uz"),
  title: {
    default: "Allohga Qayting - Islomiy Platformasi",
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
    url: "https://allohgaqayt.uz",
    siteName: "Allohga Qayting",
    title: "Allohga Qayting - Islomiy Platformasi",
    description:
      "Islomiy bilim testlari topshiring, diniy bilimingizni sinang, raqobatlashing",
    images: [{ url: "/logo.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allohga Qayting - Islomiy Platformasi",
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
                  // Always dark mode for app
                  document.documentElement.classList.add('dark');
                  
                  // Telegram WebApp viewport fix
                  if (window.Telegram && window.Telegram.WebApp) {
                    const tg = window.Telegram.WebApp;
                    tg.expand();
                    tg.enableClosingConfirmation();
                    
                    // Set CSS variable for viewport height
                    document.documentElement.style.setProperty('--tg-viewport-height', tg.viewportHeight + 'px');
                    document.documentElement.style.setProperty('--tg-viewport-stable-height', tg.viewportStableHeight + 'px');
                    
                    tg.onEvent('viewportChanged', function(e) {
                      document.documentElement.style.setProperty('--tg-viewport-height', tg.viewportHeight + 'px');
                      if (e.isStateStable) {
                        document.documentElement.style.setProperty('--tg-viewport-stable-height', tg.viewportStableHeight + 'px');
                      }
                    });
                  }
                } catch (e) {}
              `,
          }}
        />
        {/* Telegram WebApp Script */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body
        className="font-sans overflow-x-hidden"
        style={{ backgroundColor: "#0F0D0A" }}
      >
        <Providers>
          <div className="min-h-screen flex flex-col bg-[#0F0D0A]">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1E1C18",
                color: "#FBF0B2",
                borderRadius: "16px",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                fontSize: "14px",
                fontWeight: "500",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

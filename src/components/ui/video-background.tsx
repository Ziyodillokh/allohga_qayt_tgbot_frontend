'use client';

import { useEffect, useState } from 'react';

interface DesignSettings {
  lightVideoUrl: string | null;
  darkVideoUrl: string | null;
  videoLoop: boolean;
  videoMuted: boolean;
}

export function VideoBackground() {
  const [settings, setSettings] = useState<DesignSettings | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Theme tekshirish
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Theme o'zgarishini kuzatish
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Design settings olish - public API orqali
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Public endpoint - autentifikatsiya talab qilmaydi
        const res = await fetch(`${API}/stats/design`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Design settings fetch error:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchSettings();
  }, [API]);

  // Video URL - dark/light mode bo'yicha
  const videoUrl = isDark ? settings?.darkVideoUrl : settings?.lightVideoUrl;

  // Agar video URL bo'lmasa yoki yuklanmagan bo'lsa - hech narsa ko'rsatma
  if (!isLoaded || !videoUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <video
        key={videoUrl}
        autoPlay
        loop={settings?.videoLoop ?? true}
        muted={settings?.videoMuted ?? true}
        playsInline
        className="w-full h-full object-cover"
        style={{ 
          filter: 'brightness(0.85) contrast(1.1)',
        }}
        onError={(e) => console.error('Video load error:', e)}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      {/* Overlay - faqat content o'qilishi uchun engil qorong'ilik */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
    </div>
  );
}

export default VideoBackground;

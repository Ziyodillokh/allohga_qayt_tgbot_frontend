'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth, useNotifications } from '@/hooks';
import { notificationsApi } from '@/lib/api';
import { Card, Badge, Button } from '@/components/ui';
import { cn, formatRelativeTime, getUploadUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'ACHIEVEMENT' | 'LEVEL_UP' | 'RANKING' | 'MESSAGE';
  isRead: boolean;
  createdAt: string;
  data?: {
    adminId?: string;
    adminUsername?: string;
    adminAvatar?: string;
    adminFullName?: string;
    imageUrl?: string;
    videoUrl?: string;
    categoryId?: string;
    categorySlug?: string;
    iconUrl?: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { notifications: initialNotifications, markAsRead } = useNotifications();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationsApi.getAll(1, 50);
        console.log('Notifications data:', data);
        const notifList = data.notifications || data;
        // Video URL'larini log qilish
        notifList.forEach((n: Notification) => {
          if (n.data?.videoUrl) {
            console.log('Notification video URL:', n.data.videoUrl);
          }
        });
        setNotifications(notifList);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Barchasi o\'qilgan deb belgilandi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('O\'chirildi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return '🏆';
      case 'LEVEL_UP':
        return '⬆️';
      case 'RANKING':
        return '📊';
      case 'MESSAGE':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getTypeBadge = (type: Notification['type']) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return <Badge variant="success">Yutuq</Badge>;
      case 'LEVEL_UP':
        return <Badge variant="info">Level</Badge>;
      case 'RANKING':
        return <Badge variant="warning">Reyting</Badge>;
      case 'MESSAGE':
        return <Badge>Xabar</Badge>;
      default:
        return <Badge variant="default">Tizim</Badge>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Orqaga qaytish"
            aria-label="Orqaga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bildirishnomalar
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">
                {unreadCount} ta o'qilmagan
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Barchasini o'qish
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500">Hozircha bildirishnomalar yo'q</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'p-4 transition-colors',
                !notification.isRead && 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon yoki Admin Avatar yoki Category Icon */}
                {notification.data?.iconUrl ? (
                  <img 
                    src={getUploadUrl(notification.data.iconUrl) || notification.data.iconUrl}
                    alt="Kategoriya"
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      // Fallback to emoji if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement?.insertAdjacentHTML('beforeend', '<div class="text-2xl">📚</div>');
                    }}
                  />
                ) : notification.type === 'MESSAGE' && notification.data?.adminAvatar ? (
                  <img 
                    src={getUploadUrl(notification.data.adminAvatar) || notification.data.adminAvatar}
                    alt={notification.data.adminUsername || 'Admin'}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : notification.type === 'MESSAGE' && notification.data?.adminUsername ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {notification.data.adminUsername.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="text-2xl">{getTypeIcon(notification.type)}</div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeBadge(notification.type)}
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  
                  <h3 className={cn(
                    'font-medium text-gray-900 dark:text-white',
                    !notification.isRead && 'font-bold'
                  )}>
                    {notification.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>

                  {/* Rasm yoki Video */}
                  {notification.data?.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={getUploadUrl(notification.data.imageUrl) || notification.data.imageUrl}
                        alt="Xabar rasmi"
                        className="rounded-xl max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(
                          getUploadUrl(notification.data?.imageUrl) || notification.data?.imageUrl,
                          '_blank'
                        )}
                      />
                    </div>
                  )}
                  
                  {notification.data?.videoUrl && (
                    <div className="mt-3">
                      {(() => {
                        const videoUrl: string = getUploadUrl(notification.data?.videoUrl) || notification.data?.videoUrl || '';
                        return (
                          <video
                            controls
                            playsInline
                            preload="auto"
                            className="rounded-xl max-w-full max-h-64 bg-black min-h-[150px]"
                            onError={(e) => {
                              console.error('Video load error for URL:', videoUrl);
                            }}
                          >
                            <source src={videoUrl || undefined} type="video/mp4" />
                            <source src={videoUrl || undefined} type="video/webm" />
                            <source src={videoUrl || undefined} type="video/ogg" />
                            <p className="text-white p-4">
                              Video yuklanmadi. <a href={videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Bu yerda ochish</a>
                            </p>
                          </video>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      title="O'qilgan deb belgilash"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

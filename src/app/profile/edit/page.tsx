'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks';
import { useAuthStore } from '@/store/auth';
import { usersApi, uploadApi, authApi } from '@/lib/api';
import { Button, Card, Input, Avatar } from '@/components/ui';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
  bio: z.string().max(200, 'Bio 200 ta belgidan oshmasligi kerak').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Joriy parolni kiriting'),
  newPassword: z.string().min(6, 'Yangi parol kamida 6 ta belgi bo\'lishi kerak'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Parollar mos kelmadi',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const { setUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      bio: '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName,
        bio: user.bio || '',
      });
      // User avatar o'zgarganda preview'ni tozalash
      setPreviewUrl(null);
    }
  }, [user, profileForm]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fayl hajmi 5MB dan oshmasligi kerak');
      return;
    }

    // Darhol preview ko'rsatish
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    try {
      setUploading(true);
      const response = await uploadApi.uploadAvatar(file);
      console.log('[Frontend] Upload response:', response.data);
      
      // Upload response'dan URL va user olish
      const uploadData = response.data;
      let avatarUrl: string | null = null;
      
      if (typeof uploadData === 'string') {
        avatarUrl = uploadData;
      } else if (uploadData && typeof uploadData === 'object') {
        avatarUrl = uploadData.url || null;
        // Agar backend to'liq user qaytarsa
        if (uploadData.user) {
          setUser(uploadData.user);
          console.log('[Frontend] User from upload response:', uploadData.user.avatar);
          toast.success('Avatar yangilandi');
          setTimeout(() => {
            URL.revokeObjectURL(localPreviewUrl);
            setPreviewUrl(null);
          }, 300);
          return;
        }
      }
      
      // Agar upload response'da user bo'lmasa, profile API'dan olish
      if (avatarUrl) {
        // Avval URL ni to'g'ridan-to'g'ri store'ga saqlash
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUser({ ...currentUser, avatar: avatarUrl });
          console.log('[Frontend] Avatar from upload URL:', avatarUrl);
        }
      }
      
      // Preview'ni tozalash
      setTimeout(() => {
        URL.revokeObjectURL(localPreviewUrl);
        setPreviewUrl(null);
      }, 300);
      
      toast.success('Avatar yangilandi');
    } catch (error: any) {
      console.error('[Frontend] Avatar xatolik:', error);
      // Xatolik bo'lsa preview'ni tozalash
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(null);
      toast.error(error.response?.data?.message || 'Avatar yuklashda xatolik');
    } finally {
      setUploading(false);
    }
  };

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      await usersApi.updateProfile(data);
      updateUser(data);
      toast.success('Profil yangilandi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      toast.success('Parol o\'zgartirildi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profilni tahrirlash
        </h1>
      </div>

      {/* Avatar */}
      <Card className="mb-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Avatar</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {/* Preview URL mavjud bo'lsa uni ko'rsatish, aks holda user avatari */}
            {previewUrl ? (
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <Avatar key={user.avatar || 'no-avatar'} src={user.avatar} name={user.fullName} size="xl" />
            )}
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors">
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              Rasm yuklash uchun kamera ikonkasini bosing
            </p>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG yoki GIF. Maksimal 5MB
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      <Card className="mb-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Asosiy ma'lumotlar</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="To'liq ism"
            {...profileForm.register('fullName')}
            error={profileForm.formState.errors.fullName?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Bio
            </label>
            <textarea
              {...profileForm.register('bio')}
              className="w-full h-24 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="O'zingiz haqingizda qisqacha..."
            />
            {profileForm.formState.errors.bio && (
              <p className="mt-1.5 text-sm text-red-500">
                {profileForm.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={profileForm.formState.isSubmitting}
              className="w-full md:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Saqlash
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      {user.email && (
        <Card>
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Parolni o'zgartirish</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Joriy parol"
              type="password"
              {...passwordForm.register('currentPassword')}
              error={passwordForm.formState.errors.currentPassword?.message}
            />

            <Input
              label="Yangi parol"
              type="password"
              {...passwordForm.register('newPassword')}
              error={passwordForm.formState.errors.newPassword?.message}
            />

            <Input
              label="Yangi parolni tasdiqlash"
              type="password"
              {...passwordForm.register('confirmPassword')}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                loading={passwordForm.formState.isSubmitting}
                className="w-full md:w-auto"
              >
                Parolni o'zgartirish
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

'use client';

import { HTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { cn, getAvatarPlaceholder, getUploadUrl } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = 'Avatar', name = '?', size = 'md', ...props }, ref) => {
    const placeholder = getAvatarPlaceholder(name);
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // src o'zgarganda statelarni reset qilish
    useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [src]);

    // Utility function orqali URL yasash
    const imageUrl = getUploadUrl(src);

    const showImage = imageUrl && !imageError;

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center',
          sizes[size],
          className
        )}
        {...props}
      >
        {showImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || undefined}
              alt={alt}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => {
                console.log('[Avatar] Image error:', imageUrl);
                setImageError(true);
              }}
              onLoad={() => {
                console.log('[Avatar] Image loaded:', imageUrl);
                setImageLoaded(true);
              }}
            />
            {!imageLoaded && (
              <span className="font-bold text-white">{placeholder}</span>
            )}
          </>
        ) : (
          <span className="font-bold text-white">{placeholder}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };

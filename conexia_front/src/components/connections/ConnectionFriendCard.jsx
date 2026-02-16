'use client';
import React from 'react';
import Image from 'next/image';
import { config } from '@/config';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ConnectionFriendCard({ friend }) {
  const defaultAvatar = '/images/default-avatar.png';
  const getProfileImageUrl = (img) => {
    if (!img) return defaultAvatar;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/uploads')) return `${config.IMAGE_URL}${img}`;
    if (img.startsWith('/')) return `${config.IMAGE_URL}${img}`;
    return `${config.IMAGE_URL}/${img}`;
  };
  const profileImage = getProfileImageUrl(friend.profilePicture);

  // Portada personalizada
  const getCoverImageUrl = (img) => {
    if (!img) return '/bg-smoke.png';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/uploads')) return `${config.IMAGE_URL}${img}`;
    if (img.startsWith('/')) return `${config.IMAGE_URL}${img}`;
    return `${config.IMAGE_URL}/${img}`;
  };
  const coverImage = getCoverImageUrl(friend.coverPicture);
  const router = useRouter();

  // Solo primer nombre y último apellido
  const nameParts = (friend.userName || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const displayName = `${firstName} ${lastName}`.trim();

  return (
    <a
      href={`/profile/userProfile/${friend.userId || friend.id}`}
      className="rounded-2xl shadow border border-[#c6e3e4] flex flex-col items-center bg-white cursor-pointer hover:shadow-xl transition-shadow no-underline"
      style={{ width: 170, minWidth: 170, maxWidth: 170, height: 200, paddingBottom: 0, justifyContent: 'flex-start' }}
      onClick={e => {
        e.preventDefault();
        router.push(`/profile/userProfile/${friend.userId || friend.id}`);
      }}
      tabIndex={0}
    >
      {/* Fondo de portada personalizado */}
      <div
        className="w-full h-16 bg-center bg-cover relative rounded-t-2xl"
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      {/* Foto de perfil centrada, NO superpuesta con el nombre */}
      <div className="flex flex-col items-center justify-center w-full" style={{ marginTop: -40 }}>
        <div
          className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center"
          style={{ zIndex: 2 }}
        >
          <Image src={profileImage} alt={displayName} width={64} height={64} className="object-cover w-full h-full" />
        </div>
        <h2 className="font-bold text-conexia-green text-center leading-tight mt-3 mb-1 text-base" style={{ marginTop: 12 }}>{displayName}</h2>
        <div
          className="text-[0.90rem] text-conexia-green/80 text-center w-full px-2 line-clamp-3"
          style={{
            lineHeight: '1.18',
            maxWidth: 140,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            marginBottom: '8px',
            paddingBottom: '2px',
          }}
        >
          {friend.profession}
        </div>
      </div>
    </a>
  );
}

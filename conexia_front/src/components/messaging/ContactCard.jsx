
import Image from 'next/image';
import { config } from '@/config';

// Helper para normalizar la URL de la imagen de perfil
const getProfilePictureUrl = (img) => {
  const defaultAvatar = '/images/default-avatar.png';
  if (!img) return defaultAvatar;
  if (img === defaultAvatar) return defaultAvatar;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/uploads')) return `${config.DOCUMENT_URL.replace(/\/+$/,'')}/${img.replace(/^\/+/, '')}`;
  if (img.startsWith('/')) return `${config.DOCUMENT_URL.replace(/\/+$/,'')}/${img.replace(/^\/+/, '')}`;
  return `${config.IMAGE_URL.replace(/\/+$/,'')}/${img.replace(/^\/+/, '')}`;
};

export default function ContactCard({ avatar, name, description, online, onClick }) {
  // Solo primer nombre y último apellido
  const nameParts = (name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const displayName = `${firstName} ${lastName}`.trim();

  // Truncar profesión si es muy larga
  const maxProfessionLength = 32;
  let professionDisplay = description || '';
  if (professionDisplay.length > maxProfessionLength) {
    professionDisplay = professionDisplay.slice(0, maxProfessionLength - 3) + '...';
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 w-full cursor-pointer hover:bg-conexia-green/10" onClick={onClick}>
      <div className="relative">
        <Image src={getProfilePictureUrl(avatar)} alt="avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
        {online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white shadow" />}
      </div>
      <div className="flex-1 min-w-0 leading-tight">
        <div className="font-semibold text-sm text-conexia-green truncate">{displayName}</div>
        <div className="text-[13px] text-gray-600 truncate" title={description}>{professionDisplay}</div>
      </div>
    </div>
  );
}

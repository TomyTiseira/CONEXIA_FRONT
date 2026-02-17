import Image from "next/image";
import { buildMediaUrl } from "@/utils/mediaUrl";

// Helper para normalizar la URL de la imagen de perfil
const getProfilePictureUrl = (img) => {
  const defaultAvatar = "/images/default-avatar.png";
  if (!img) return defaultAvatar;
  if (img === defaultAvatar) return defaultAvatar;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return buildMediaUrl(img);
};

export default function ChatCard({
  avatar,
  name,
  lastMessage,
  dateLabel,
  time,
  online,
  unreadCount = 0,
  onClick,
  isTyping = false,
}) {
  // Decidir qué mostrar arriba: si es "Hoy" => hora; si es "Ayer" => "Ayer"; caso contrario => fecha
  const topRightLabel =
    dateLabel === "Hoy"
      ? time || ""
      : dateLabel === "Ayer"
        ? "Ayer"
        : dateLabel || time || "";

  // Importante: solo confiar en la prop isTyping, no en el texto del último mensaje,
  // para evitar falsos positivos si un mensaje real contiene la palabra "escribiendo".
  const typingDetected = !!isTyping;

  return (
    <div
      className="flex items-stretch gap-3 px-3 py-2.5 w-full cursor-pointer hover:bg-conexia-green/10 min-h-[48px]"
      onClick={onClick}
    >
      <div className="relative self-center">
        <Image
          src={getProfilePictureUrl(avatar)}
          alt="avatar"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
        {/* Punto verde si está online */}
        {online && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white shadow" />
        )}
      </div>

      <div className="flex-1 min-w-0 self-center">
        <div className="font-semibold text-sm text-conexia-green truncate">
          {name}
        </div>
        <div
          className={`text-[13px] truncate ${typingDetected ? "text-conexia-green" : "text-gray-600"}`}
        >
          {typingDetected ? (
            <span aria-label="Escribiendo" className="italic">
              Escribiendo
            </span>
          ) : (
            lastMessage
          )}
        </div>
      </div>

      {/* Columna derecha: fila 1 (fecha/hora arriba), fila 2 (badge centrado verticalmente y a la derecha) */}
      <div className="self-stretch ml-2 min-w-[58px] text-[11px] text-gray-400 grid grid-rows-[auto_1fr]">
        <div className="flex items-start justify-end">
          <span className="leading-tight">{topRightLabel}</span>
        </div>
        <div className="flex items-center justify-end">
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-conexia-green text-white text-[11px] leading-none">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <style jsx>{``}</style>
    </div>
  );
}

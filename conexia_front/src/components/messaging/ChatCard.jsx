import Image from 'next/image';

export default function ChatCard({ avatar, name, lastMessage, dateLabel, time, online, onClick }) {
  return (
  <div className="flex items-center gap-3 px-3 py-2.5 w-full cursor-pointer hover:bg-conexia-green/10" onClick={onClick}>
      <div className="relative">
        <Image src={avatar || '/images/default-avatar.png'} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
        {/* Punto verde si está online */}
        {online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white shadow" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-conexia-green truncate">{name}</div>
        <div className="text-[13px] text-gray-600 truncate">{lastMessage}</div>
      </div>
      <div className="flex flex-col items-center justify-center text-[11px] text-gray-400 ml-2 min-w-[54px]">
        <span className="leading-tight">{dateLabel}</span>
        <span className="leading-tight">{time}</span>
      </div>
    </div>
  );
}

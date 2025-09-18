'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import { useMessaging } from '@/hooks/messaging/useMessaging';
import { useUserFriends } from '@/hooks/connections/useUserFriends';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import ChatView from '@/components/messaging/ChatView';

export default function MessagingByUserPage() {
  const { userId: otherIdParam } = useParams();
  const otherId = Number(otherIdParam);
  const router = useRouter();
  const { user } = useUserStore();
  const { chats, loadConversations, selectConversation } = useMessaging();
  const { friends } = useUserFriends(user?.id, 1, 100);
  const [panelUser, setPanelUser] = useState(null);

  const getProfilePictureUrl = (img) => {
    const def = '/images/default-avatar.png';
    const j = (b, p) => `${String(b).replace(/\/+$/,'')}/${String(p).replace(/^\/+/, '')}`;
    if (!img) return def;
    if (/^https?:\/\//i.test(img)) return img;
    if (img.startsWith('/images/')) return img; // ← mantener assets públicos
    if (img.startsWith('/uploads')) return j(config.DOCUMENT_URL, img);
    if (img.startsWith('/')) return j(config.DOCUMENT_URL, img);
    return j(config.IMAGE_URL, img);
  };
  const getDisplayName = (userName, id) => {
    if (!userName || !userName.trim()) return `Usuario ${id ?? ''}`.trim();
    const p = userName.trim().split(/\s+/);
    return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1]}`;
  };

  useEffect(() => { loadConversations({ page: 1, limit: 20 }); }, [loadConversations]);

  // Resolver meta del otro usuario desde friends o conversaciones
  const meta = useMemo(() => {
    const byConv = chats.find(c =>
      String(c.otherUserId) === String(otherId) ||
      String(c.otherUser?.id || '') === String(otherId)
    )?.otherUser;
    if (byConv) return byConv;
    const byFriend = friends.find(f => String(f.id) === String(otherId));
    if (byFriend) return { id: byFriend.id, userName: byFriend.userName, userProfilePicture: byFriend.profilePicture };
    return { id: otherId, userName: '', userProfilePicture: null };
  }, [chats, friends, otherId]);

  useEffect(() => {
    if (!meta?.id) return;
    const panel = { id: meta.id, name: getDisplayName(meta.userName, meta.id), avatar: getProfilePictureUrl(meta.userProfilePicture), conversationId: null };
    setPanelUser(panel);
    selectConversation({ conversationId: null, otherUserId: meta.id, otherUser: { id: meta.id, userName: meta.userName, userProfilePicture: meta.userProfilePicture } });
  }, [meta, selectConversation]);

  return (
    <>
      <Navbar />
      <main className="h-[calc(100vh-64px-56px)] md:h-[calc(100vh-64px)] overflow-hidden bg-[#f3f9f8] px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] md:pt-4 md:pb-4 flex justify-center">
        <div className="w-full max-w-3xl h-full min-h-0 bg-white border border-[#c6e3e4] rounded-xl md:rounded-2xl shadow overflow-hidden">
          {panelUser && (
            <Suspense fallback={<div className="p-4 text-center text-conexia-green">Cargando chat...</div>}>
              <ChatView user={panelUser} onBack={() => router.push('/messaging')} />
            </Suspense>
          )}
        </div>
      </main>
    </>
  );
}

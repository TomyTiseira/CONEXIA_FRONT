'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import { useMessaging } from '@/hooks/messaging/useMessaging';
import { config } from '@/config';
import ChatView from '@/components/messaging/ChatView';

export default function MessagingConversationPage() {
  const { conversationId } = useParams();
  const router = useRouter();
  const { chats, loadConversations, selectConversation } = useMessaging();
  const [panelUser, setPanelUser] = useState(null);
  const appliedConvRef = useRef(null);

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
  const getDisplayName = (userName, userLastName, id) => {
    const first = (userName || '').trim().split(/\s+/)[0] || '';
    const firstLast = (userLastName || '').trim().split(/\s+/)[0] || '';
    if (first) return `${first} ${firstLast}`.trim();
    const full = (userName || '').trim();
    if (!full) return `Usuario ${id ?? ''}`.trim();
    const p = full.split(/\s+/);
    return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1]}`;
  };

  useEffect(() => { loadConversations({ page: 1, limit: 20 }); }, [loadConversations]);

  const match = useMemo(() => chats.find(c => String(c.id) === String(conversationId)), [chats, conversationId]);

  useEffect(() => {
    if (!match || !match.id) return;
    const currentId = String(match.id);
    if (appliedConvRef.current === currentId) return;
    const other = match.otherUser || {};
    const panel = {
      id: other.id,
      name: getDisplayName(other.userName, other.userLastName, other.id),
      avatar: getProfilePictureUrl(other.userProfilePicture),
      conversationId: match.id
    };
    setPanelUser(panel);
    selectConversation({
      conversationId: match.id,
      otherUserId: other.id,
      otherUser: { id: other.id, userName: other.userName, userLastName: other.userLastName, userProfilePicture: other.userProfilePicture }
    });
    appliedConvRef.current = currentId;
  }, [match?.id, selectConversation]); // only when id changes

  return (
    <>
      <Navbar />
      <main className="h-[calc(100vh-64px-56px)] md:h-[calc(100vh-64px)] overflow-hidden bg-[#f3f9f8] px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] md:pt-4 md:pb-4 flex justify-center">
        <div className="w-full max-w-3xl h-full min-h-0 bg-white border border-[#c6e3e4] rounded-xl md:rounded-2xl shadow overflow-hidden">
          {panelUser && (
            <Suspense fallback={<LoadingSpinner message="Cargando chat" fullScreen={false} />}>
              <ChatView user={panelUser} onBack={() => router.push('/messaging')} />
            </Suspense>
          )}
        </div>
      </main>
    </>
  );
}

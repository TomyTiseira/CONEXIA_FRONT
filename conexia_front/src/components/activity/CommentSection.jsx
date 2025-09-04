import React, { useState, useRef } from 'react';
import { BsEmojiSmile } from 'react-icons/bs';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export default function CommentSection({ onComment, user }) {
  const [comment, setComment] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef();
  const emojiPickerRef = useRef();

  // Close emoji picker when clicking outside
  React.useEffect(() => {
    if (!showEmoji) return;
    function handleClickOutside(event) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.getAttribute('aria-label') !== 'Agregar emoji'
      ) {
        setShowEmoji(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmoji]);

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newText = comment.slice(0, start) + emoji + comment.slice(end);
      setComment(newText);
      setTimeout(() => {
        input.focus();
        input.selectionStart = input.selectionEnd = start + emoji.length;
      }, 0);
    } else {
      setComment(prev => prev + emoji);
    }
    setShowEmoji(false);
  };

  return (
    <div className="w-full mt-2 flex flex-col gap-2">
      <div className="w-full flex items-center bg-[#f3f9f8] border border-[#e0f0f0] rounded-xl px-4 py-3 relative">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 mr-2"
          onClick={() => setShowEmoji(v => !v)}
          aria-label="Agregar emoji"
        >
          <BsEmojiSmile size={22} className="text-conexia-green" />
        </button>
        <input
          ref={inputRef}
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-conexia-green"
          placeholder="Escribe un comentario..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={300}
        />
        {comment.trim().length > 0 && (
          <Button
            variant="add"
            onClick={() => {
              onComment(comment);
              setComment('');
            }}
            className="ml-2"
          >
            Comentar
          </Button>
        )}
      </div>
      {showEmoji && (
        <div ref={emojiPickerRef} className="absolute z-50 bg-white border rounded shadow p-2 mt-1">
          <Picker
            onEmojiClick={handleEmojiClick}
            theme="light"
            height={260}
            width={260}
            searchDisabled={false}
            emojiStyle="native"
            lazyLoadEmojis={true}
            skinTonesDisabled={false}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}

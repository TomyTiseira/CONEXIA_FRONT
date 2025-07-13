'use client';

import { useEffect } from 'react';
import { logoutUser } from '@/service/auth/authService';

const INACTIVITY_LIMIT = 1 * 60 * 1000; // 15 minutos

export default function useSessionTimeout() {
  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await logoutUser();
        window.location.href = '/timeout?timeout=true';
      }, INACTIVITY_LIMIT);
    };

    const events = ['keydown', 'click', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // iniciar por primera vez

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, []);
}

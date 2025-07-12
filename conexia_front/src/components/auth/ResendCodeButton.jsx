"use client";

import { useEffect, useState } from "react";

export default function ResendCodeButton({ email, onResend, resendFn }) {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResend = async () => {
    if (!resendFn) return;

    setIsSending(true);
    setError(null);
    try {
      await resendFn(email);
      onResend?.(); // callback opcional
      setSecondsLeft(60); // reiniciar temporizador
    } catch (err) {
      setError("No se pudo reenviar el código. Intentá nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-4 text-sm text-center min-h-[24px]">
      {error && <p className="text-red-600">{error}</p>}

      {secondsLeft > 0 ? (
        <p className="text-gray-600">Podrás reenviar el código en {secondsLeft} seg.</p>
      ) : (
        <button
          type="button"
          disabled={isSending}
          onClick={handleResend}
          className="text-conexia-coral hover:underline font-semibold disabled:opacity-60"
        >
          Reenviar código
        </button>
      )}
    </div>
  );
}

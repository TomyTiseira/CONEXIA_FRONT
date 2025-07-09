"use client";
import { useEffect, useState } from "react";
import { resendVerification } from "@/service/user/userFetch";

export default function ResendCodeButton({ email, onResend }) {
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
    setIsSending(true);
    setError(null);
    try {
      await resendVerification(email);
      onResend?.(); // callback opcional
      setSecondsLeft(60); // reiniciar temporizador
    } catch (err) {
      setError("Error al reenviar el código.");
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

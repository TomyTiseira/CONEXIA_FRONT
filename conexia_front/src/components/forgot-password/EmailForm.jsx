"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/service/auth/recoveryService";
import { useResetPasswordStore } from "@/store/useResetPasswordStore";
import InputField from "@/components/form/InputField";
import { validateEmail } from "@/utils/validation";
import ConexiaLogo from "@/components/ui/ConexiaLogo";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  const [msg, setMsg] = useState(null);
  const setGlobalEmail = useResetPasswordStore((state) => state.setEmail);
  const router = useRouter();

  const getError = () => {
    if (!submitted || focused) return "";
    return validateEmail(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const error = validateEmail(email);
    if (error) return;

    try {
      await requestPasswordReset(email);
      setGlobalEmail(email);
      setMsg({
        ok: true,
        text: "¡Correo enviado con éxito! Revisa tu bandeja de entrada.",
      });
      setTimeout(() => {
        router.push("/forgot-password/verify");
      }, 1500);
    } catch (err) {
      let friendlyMsg = "Ocurrió un error. Intentalo de nuevo.";

      if (err.message.includes("not found")) {
        friendlyMsg = `No encontramos ninguna cuenta registrada con el correo "${email}".`;
      } else if (err.message.includes("not verified")) {
        friendlyMsg = "Tu cuenta aún no está verificada. Revisa tu correo y completa la verificación.";
      } else {
        friendlyMsg = err.message;
      }

      setMsg({ ok: false, text: friendlyMsg });
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        {/* Logo y header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <ConexiaLogo width={100} height={40} />
          </div>
          <h1 className="text-3xl font-bold text-conexia-green mb-2">Recupera tu contraseña</h1>
          <p className="text-sm text-gray-600">
            Ingresa el correo asociado a tu cuenta y te enviaremos un código para validar tu identidad.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <InputField
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              error={getError()}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-conexia-green/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Enviar código
          </button>
        </form>

        {/* Link volver a login */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="text-conexia-coral hover:underline font-semibold">
            Volver al inicio de sesión
          </Link>
        </div>

        {/* Mensaje de éxito/error */}
        {msg && (
          <div className="mt-4 text-center">
            <p className={`text-sm font-medium ${msg.ok ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


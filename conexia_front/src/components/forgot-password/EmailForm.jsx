"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/service/auth/recoveryService";
import { useResetPasswordStore } from "@/store/useResetPasswordStore";
import InputField from "@/components/form/InputField";
import { validateEmail } from "@/utils/validation";
import ConexiaLogo from "@/components/ui/ConexiaLogo";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [msg, setMsg] = useState(null);
  const setGlobalEmail = useResetPasswordStore((state) => state.setEmail);
  const router = useRouter();

  const getError = () => {
    if (!touched) return "";
    return validateEmail(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

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
    <div className="flex flex-col justify-center items-center w-full md:w-[40%] px-6 py-10 bg-conexia-soft">
      <div className="flex justify-center mb-4">
        <ConexiaLogo width={80} height={32} />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Recupera tu contraseña</h1>
        <p className="mb-5 text-sm text-conexia-green/90">
          Ingresa el correo asociado a tu cuenta y te enviaremos un código para validar tu identidad.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <InputField
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched) setTouched(true);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setTouched(true);
            }}
            error={getError()}
          />

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
          >
            Enviar código
          </button>
        </form>

        <div className="mt-3 text-center">
          <Link
            href="/login"
            className="text-conexia-green font-semibold text-sm hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
        <div className="min-h-[40px] mt-4 text-center text-sm">
          {msg && (
            <p className={msg.ok ? "text-green-600" : "text-red-600"}>
              {msg.text}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}


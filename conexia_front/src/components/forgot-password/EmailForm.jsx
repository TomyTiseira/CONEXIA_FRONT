"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/service/auth/recoveryService";
import { useResetPasswordStore } from "@/store/useResetPasswordStore";

export default function EmailForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const setGlobalEmail = useResetPasswordStore((state) => state.setEmail);
  const router = useRouter();

  const validateEmail = (value) => {
    if (!value) return "El correo es obligatorio.";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Email inválido.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) return setMsg({ ok: false, text: error });

    try {
        await requestPasswordReset(email);
        setGlobalEmail(email);
        setMsg({ ok: true, text: "¡Correo enviado con éxito! Revisa tu bandeja de entrada para continuar." });
        setTimeout(() => {
          router.push("/forgot-password/verify");
        }, 1500);
      }catch (err) {
      let friendlyMsg = "Ocurrió un error. Intentalo de nuevo.";
      if (err.message.includes("not found")) {
        friendlyMsg = `No encontramos ninguna cuenta registrada con el correo "${email}"`;
      } else {
        friendlyMsg = err.message;
      }

      setMsg({ ok: false, text: friendlyMsg });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full md:w-[40%] px-6 py-10 bg-conexia-soft">
      <div className="flex justify-end mb-4">
        <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Recupera tu contraseña</h1>
        <p className="mb-5 text-sm text-conexia-green/90">
          Ingresa el correo asociado a tu cuenta y te enviaremos un código para validar tu identidad y recuperar el acceso.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40"
              placeholder="Correo electrónico"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
          >
            Enviar código
          </button>
        </form>
        <div className="min-h-[40px] mt-4 text-center text-sm">
          {msg && <p className={msg.ok ? "text-green-600" : "text-red-600"}>{msg.text}</p>}
        </div>
      </div>
    </div>
  );
}

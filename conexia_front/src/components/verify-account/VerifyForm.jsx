"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { verifyUser } from "@/service/user/userFetch"; 
import ResendCodeButton from "../auth/ResendCodeButton"; 
import { resendVerification } from "@/service/user/userFetch";
import { useAuth } from "@/context/AuthContext";
import ConexiaLogo from "@/components/ui/ConexiaLogo";

export default function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const fromLogin = searchParams.get("fromLogin") === "true";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [msg, setMsg] = useState(null);
  const router = useRouter();
  const { refetch: refreshAuth } = useAuth();

  const handleChange = (index, value) => {
  if (/^\d$/.test(value)) {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  } else if (value === "") {
    const newCode = [...code];
    newCode[index] = "";
    setCode(newCode);
  }
  };

const handleKeyDown = (e, index) => {
  if (e.key === "Backspace") {
    e.preventDefault();
    if (code[index]) {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
    } else if (index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  }

  if (e.key === "ArrowLeft" && index > 0) {
    e.preventDefault();
    document.getElementById(`code-${index - 1}`)?.focus();
  }

  if (e.key === "ArrowRight" && index < 5) {
    e.preventDefault();
    document.getElementById(`code-${index + 1}`)?.focus();
  }
  };

const handlePaste = (e) => {
  const pasted = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6);
  if (pasted.length === 6) {
    const newCode = pasted.split("");
    setCode(newCode);
    document.getElementById(`code-5`)?.focus();
    e.preventDefault();
  }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      return setMsg({ ok: false, text: "El código debe tener 6 dígitos." });
    }

    try {
      const response = await verifyUser({ email, verificationCode });
      setMsg({ ok: true, text: "¡Usuario verificado con éxito!" });
      
      // Siempre redirigir a creación de perfil
      // El backend envía el onboarding_token (HttpOnly cookie) al verificar
      setTimeout(() => router.push("/profile/create"), 1500);
    } catch (err) {
      if (
        err.message.includes("is already active") ||
        err.message.includes("already verified")
      ) {
        setMsg({
          ok: false,
          text: "Tu cuenta ya fue verificada anteriormente.",
        });
      } else if (err.message.includes("Invalid verification code")) {
        setMsg({ ok: false, text: "El código ingresado es incorrecto." });
      } else {
        setMsg({
          ok: false,
          text: err.message || "Ocurrió un error al verificar tu cuenta.",
        });
      }
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
          <h1 className="text-3xl font-bold text-conexia-green mb-2">Verifica tu cuenta</h1>
          <p className="text-sm text-gray-600">
            Ingresa el código que te enviamos a <strong className="text-conexia-green">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={(e) => handlePaste(e)}
                className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-conexia-green/40 focus:border-conexia-green transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-conexia-green/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Verificar
          </button>
        </form>

        <ResendCodeButton
          email={email}
          resendFn={resendVerification}
          onResend={() => setMsg({ ok: true, text: "Te reenviamos un nuevo código a tu correo." })}
        />

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

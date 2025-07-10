"use client";

import { useResetPasswordStore } from "@/store/useResetPasswordStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { verifyResetCode } from "@/service/auth/recoveryService";
import ResendCodeButton from "../auth/ResendCodeButton";
import { requestPasswordReset } from "@/service/auth/recoveryService";

export default function VerifyCodeForm() {
  const email = useResetPasswordStore((state) => state.email);
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [msg, setMsg] = useState(null);


  const handleChange = (index, value) => {
    if (/^\d$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (index < 5) document.getElementById(`code-${index + 1}`)?.focus();
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
      document.getElementById("code-5")?.focus();
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
      await verifyResetCode({ email, verificationCode });
        setMsg({ ok: true, text: "¡Correo verificado correctamente!" });
        setTimeout(() => {
        router.push("/forgot-password/reset");
        }, 1500);
    } catch (err) {
      let errorText = "Ocurrió un error al verificar el código.";
      if (err.message.includes("Invalid password reset code")) {
        errorText = "El código ingresado no es válido. Revisa tu correo e intenta nuevamente.";
      }
      setMsg({ ok: false, text: errorText });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full md:w-[40%] px-6 py-10 bg-conexia-soft">
      <div className="flex justify-end mb-4">
        <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Verifica tu cuenta</h1>
        <p className="text-sm text-conexia-green mb-6">
          Ingresa el código que te enviamos a <strong>{email}</strong>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 flex-wrap">
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
                onPaste={handlePaste}
                className="w-8 h-8 text-center border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-conexia-green sm:w-10 sm:h-10 sm:text-lg md:w-12 md:h-12"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
          >
            Verificar código
          </button>
        </form>

        <ResendCodeButton
            email={email}
            resendFn={requestPasswordReset}
            onResend={() => setMsg({ ok: true, text: "Te enviamos otro código para que recuperes tu contraseña." })}
        />

        <div className="min-h-[40px] mt-4 text-center text-sm">
          {msg && <p className={msg.ok ? "text-green-600" : "text-red-600"}>{msg.text}</p>}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { verifyUser } from "@/service/user/userFetch"; // Asegurate de tener esta función en el fetch
import ResendCodeButton from "./ResendCodeButton"; // Asegurate de tener este componente para reenviar el código

export default function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [msg, setMsg] = useState(null);
  const router = useRouter();

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      return setMsg({ ok: false, text: "El código debe tener 6 dígitos." });
    }

    try {
      await verifyUser({ email, verificationCode });
      setMsg({ ok: true, text: "¡Usuario verificado con éxito!" });
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full md:w-[40%] px-6 py-10 bg-conexia-soft">
      <div className="flex justify-end mb-4">
        <Image src="/logo-conexia.png" alt="Conexia logo" width={100} height={40} />
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
                className="w-8 h-8 text-center border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-conexia-green sm:w-10 sm:h-10 sm:text-lg md:w-12 md:h-12"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
          >
            Verificar
          </button>
        </form>

        <ResendCodeButton email={email} onResend={() => {
        setMsg({ ok: true, text: "Se envió un nuevo código a tu correo." });
        }} />

        <div className="min-h-[24px] mt-4 text-center text-sm">
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

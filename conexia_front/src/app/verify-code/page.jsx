"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "tu‑correo";

  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [sec, setSec] = useState(60); // 60 s

  // ── Temporizador ──────────────────────────────────────
  useEffect(() => {
    if (sec === 0) return;
    const t = setTimeout(() => setSec(sec - 1), 1000);
    return () => clearTimeout(t);
  }, [sec]);

  // ── Handlers ───────────────────────────────────────────
  const handleVerify = (e) => {
    e.preventDefault();
    if (code === "123456") {
      setMsg({ ok: true, text: "Correo verificado con éxito." });
      setTimeout(() => router.push("/validate-id"), 800);
    } else {
      setMsg({ ok: false, text: "El código ingresado es incorrecto o ha expirado." });
    }
  };

  const handleResend = () => {
    setSec(60);
    setMsg({ ok: true, text: "Nuevo código enviado." });
  };

  return (
        <main className="min-h-screen flex flex-col">
          <section className="flex flex-col md:flex-row flex-grow h-screen bg-conexia-soft md:bg-transparent">
            {/* Fondo lateral */}
            <div className="hidden md:flex flex-col justify-start items-start p-10 w-[60%] relative h-full">
              <Image
                src="/hero-login.jpg"
                alt="Fondo"
                fill
                className="object-cover object-[65%] -z-10"
              />
          <div className="z-10">
            <h2 className="text-4xl sm:text-4xl lg:text-4xl font-extrabold mb-4 text-white">
              ¡Crea tu cuenta y súmate!
            </h2>
            <p className="text-lg text-white">
              Conecta con talento, proyectos y oportunidades reales.
            </p>
          </div>
        </div>

        {/* ───────── Formulario (móvil + desktop) ──────── */}
        <div className="relative flex flex-col justify-center items-center w-full md:w-[40%] px-6 pt-10 pb-12 bg-conexia-soft">
          {/* Logo arriba‑derecha en celeste (fuera de la tarjeta) */}
          <div className="flex justify-end mb-4">
                <Image src="/logo-conexia.png" alt="Conexia logo" width={100} height={40} />
            </div>

          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-conexia-green mb-6">Verifica tu correo</h1>
            <p className="mb-4 text-sm text-conexia-green/90">
              Ingresa el código de 6 dígitos que enviamos a <span className="font-semibold">{email}</span>.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="●●●●●●"
                className="tracking-widest text-center text-xl w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40"
              />

              <button
                type="submit"
                disabled={code.length !== 6}
                className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90 disabled:opacity-60"
              >
                Verificar código
              </button>
            </form>

            {/* Reenviar */}
            <button
              onClick={handleResend}
              disabled={sec !== 0}
              className="mt-4 w-full text-sm font-medium text-conexia-coral disabled:text-gray-400"
            >
              {sec === 0 ? "Reenviar código" : `Podés reenviar en ${sec}s`}
            </button>

            {msg && (
              <p className={`mt-4 text-center text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>
                {msg.text}
              </p>
            )}

            <div className="mt-6 text-center text-sm">
              <Link href="/register" className="text-conexia-green hover:underline">
                Volver a Registro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer minimal />
    </main>
  );
}

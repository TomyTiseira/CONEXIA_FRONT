"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Footer } from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    repeatPwd: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    repeatPwd: false,
  });

  const [focused, setFocused] = useState({
    email: false,
    password: false,
    repeatPwd: false,
  });

  const [msg, setMsg] = useState(null);

  const validateEmail = (value) => {
    if (!value) return "";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Email inválido.";
    if (value === "test@conexia.com") return "El email ya está registrado.";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "";
    if (value.length < 6) return "Debe tener al menos 6 caracteres.";
    return "";
  };

  const validateRepeatPwd = (value) => {
    if (!value) return "";
    if (value !== form.password) return "Las contraseñas no coinciden.";
    return "";
  };

  const getError = (field) => {
    const value = form[field];
    if (!touched[field] || focused[field]) return "";

    switch (field) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "repeatPwd":
        return validateRepeatPwd(value);
      default:
        return "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true, repeatPwd: true });

    const hasErrors =
      validateEmail(form.email) ||
      validatePassword(form.password) ||
      validateRepeatPwd(form.repeatPwd);

    if (hasErrors) {
      setMsg(null);
      return;
    }

    setMsg({ ok: true, text: "Código enviado a tu correo. Por favor revísalo." });

    setTimeout(() => {
      router.push(`/verify-code?email=${encodeURIComponent(form.email)}`);
    }, 800);
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
            <h2 className="text-4xl font-extrabold mb-4 text-white">¡Crea tu cuenta y súmate!</h2>
            <p className="text-lg text-white">Conecta con talento, proyectos y oportunidades reales.</p>
          </div>
        </div>

        <div className="relative flex flex-col justify-center items-center w-full md:w-[40%] px-6 pt-10 pb-12 bg-conexia-soft">
          <div className="flex justify-end mb-4">
              <Image src="/logo-conexia.png" alt="Conexia logo" width={100} height={40} />
          </div>

          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-conexia-green mb-4">Crea tu cuenta</h1>
            <p className="mb-5 text-sm text-conexia-green/90">
              Ingresa tu correo y crea una contraseña. Te enviaremos un código por email para verificar tu identidad antes de completar el registro.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div className="min-h-[64px]">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused((p) => ({ ...p, email: true }))}
                  onBlur={() => {
                    setFocused((p) => ({ ...p, email: false }));
                    setTouched((p) => ({ ...p, email: true }));
                  }}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                    getError("email")
                      ? "border-red-500 ring-red-300"
                      : "border-gray-300 focus:ring-conexia-green/40"
                  }`}
                />
                <p className="text-xs text-red-600 mt-1 h-[14px]">{getError("email")}</p>
              </div>

              {/* Contraseña */}
              <div className="min-h-[64px]">
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused((p) => ({ ...p, password: true }))}
                  onBlur={() => {
                    setFocused((p) => ({ ...p, password: false }));
                    setTouched((p) => ({ ...p, password: true }));
                  }}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                    getError("password")
                      ? "border-red-500 ring-red-300"
                      : "border-gray-300 focus:ring-conexia-green/40"
                  }`}
                />
                <p className="text-xs text-red-600 mt-1 h-[14px]">{getError("password")}</p>
              </div>

              {/* Repetir contraseña */}
              <div className="min-h-[64px]">
                <input
                  type="password"
                  placeholder="Repetir contraseña"
                  value={form.repeatPwd}
                  onChange={(e) => setForm({ ...form, repeatPwd: e.target.value })}
                  onFocus={() => setFocused((p) => ({ ...p, repeatPwd: true }))}
                  onBlur={() => {
                    setFocused((p) => ({ ...p, repeatPwd: false }));
                    setTouched((p) => ({ ...p, repeatPwd: true }));
                  }}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                    getError("repeatPwd")
                      ? "border-red-500 ring-red-300"
                      : "border-gray-300 focus:ring-conexia-green/40"
                  }`}
                />
                <p className="text-xs text-red-600 mt-1 h-[14px]">{getError("repeatPwd")}</p>
              </div>

              <button
                type="submit"
                className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
              >
                Registrarme
              </button>
            </form>

            {msg && (
              <p className={`mt-4 text-center text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>
                {msg.text}
              </p>
            )}

            <div className="mt-6 text-center text-sm">
              ¿Ya estás en Conexia?{" "}
              <Link href="/login" className="text-conexia-coral hover:underline font-semibold">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

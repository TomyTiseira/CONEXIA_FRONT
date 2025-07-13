"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { loginUser } from "@/service/auth/authService";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [focused, setFocused] = useState({ email: false, password: false });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState(null);

  const validateEmail = (value) => {
    if (!value) return "Ingrese un correo electrónico.";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Email inválido.";
    return "";
  };

  const getEmailError = () =>
    !touched.email || focused.email ? "" : validateEmail(form.email);

  const getPasswordError = () =>
    !touched.password || focused.password
      ? ""
      : !form.password
      ? "Ingrese una contraseña."
      : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const emailError = validateEmail(form.email);
    const passwordError = !form.password ? "Ingrese una contraseña." : "";

    if (emailError || passwordError) {
      return setMsg({ ok: false, text: "" });
    }

    try {
      await loginUser({ email: form.email, password: form.password });
      setMsg({ ok: true, text: "Sesión iniciada con éxito." });
      window.location.href = "/community";
    } catch (err) {
      let friendlyMsg = "Ocurrió un error al iniciar sesión.";
      if (err.message.includes("not verified")) {
        friendlyMsg = "Tu cuenta aún no fue verificada. Revisa tu correo electrónico.";
      } else if (err.message.includes("Invalid credentials")) {
        friendlyMsg = "El correo y la contraseña no coinciden. Verificalos e intentalo de nuevo.";
      } else if (err.message.includes("not found")) {
        friendlyMsg = "El correo ingresado no pertenece a ninguna cuenta registrada.";
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
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {/* Campo email */}
          <div className="min-h-[64px]">
            <label className="block text-sm font-medium text-conexia-green mb-1">Correo</label>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused((prev) => ({ ...prev, email: true }))}
              onBlur={() => {
                setFocused((prev) => ({ ...prev, email: false }));
                setTouched((prev) => ({ ...prev, email: true }));
              }}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                getEmailError()
                  ? "border-red-500 ring-red-300"
                  : "border-gray-300 focus:ring-conexia-green/40"
              }`}
            />
            <p className="text-xs text-red-600 mt-1 h-[14px]">{getEmailError()}</p>
          </div>

          {/* Campo contraseña */}
          <div className="min-h-[64px]">
            <label className="block text-sm font-medium text-conexia-green mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
                onBlur={() => {
                  setFocused((prev) => ({ ...prev, password: false }));
                  setTouched((prev) => ({ ...prev, password: true }));
                }}
                className={`w-full px-4 py-2 border rounded pr-10 focus:outline-none focus:ring ${
                  getPasswordError()
                    ? "border-red-500 ring-red-300"
                    : "border-gray-300 focus:ring-conexia-green/40"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-2.5 text-conexia-green"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-red-600 mt-1 h-[14px]">{getPasswordError()}</p>
          </div>

          <div className="text-right text-sm mt-1 mb-2">
            <Link href="/forgot-password" className="text-conexia-green hover:underline">
              ¿Has olvidado tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
          >
            Iniciar sesión
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/register"
            className="inline-block w-full bg-conexia-soft text-conexia-green py-2 rounded font-semibold hover:bg-conexia-green hover:text-white"
          >
            Crea una cuenta nueva
          </Link>
        </div>

        <div className="min-h-[60px] mt-4">
          {msg && (
            <p className={`text-center text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

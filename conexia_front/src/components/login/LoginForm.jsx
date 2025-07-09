"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false });
  const [focused, setFocused] = useState({ email: false });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState(null);

  const validateEmail = (value) => {
    if (!value) return "";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Email inválido.";
    return "";
  };

  const getEmailError = () =>
    !touched.email || focused.email ? "" : validateEmail(form.email);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true });

    const emailError = validateEmail(form.email);
    if (emailError) return setMsg(null);

    setMsg({ ok: true, text: "Sesión iniciada con éxito." });
  };

  return (
    <div className="flex flex-col justify-center items-center w-full md:w-[40%] px-6 py-10 bg-conexia-soft">
      <div className="flex justify-end mb-4">
        <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Campo email */}
          <div className="min-h-[64px]">
            <label className="block text-sm font-medium text-conexia-green mb-1">Correo</label>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused({ email: true })}
              onBlur={() => {
                setFocused({ email: false });
                setTouched({ email: true });
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
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2 border rounded pr-10 focus:outline-none focus:ring focus:ring-conexia-green/40"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-2.5 text-conexia-green"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-right text-sm">
            <Link href="#" className="text-conexia-green hover:underline">¿Has olvidado tu contraseña?</Link>
          </div>

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
          >
            Iniciar sesión
          </button>
        </form>

        {msg && (
          <p className={`mt-4 text-center text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>
            {msg.text}
          </p>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/register"
            className="inline-block w-full bg-conexia-soft text-conexia-green py-2 rounded font-semibold hover:bg-conexia-green hover:text-white"
          >
            Crea una cuenta nueva
          </Link>
        </div>
      </div>
    </div>
  );
}

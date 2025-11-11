"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { loginUser } from "@/service/auth/authService";
import ConexiaLogo from "@/components/ui/ConexiaLogo";

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
      window.location.href = "/";
    } catch (err) {
      let friendlyMsg = "Ocurrió un error al iniciar sesión.";

      if (err.message.includes("not verified")) {
        friendlyMsg = "Tu cuenta aún no fue verificada. Revisa tu correo electrónico.";
      } else if (err.message.includes("Invalid credentials")) {
        friendlyMsg = "El correo y la contraseña no coinciden. Verificalos e intentalo de nuevo.";
      } else if (err.message.includes("not found")) {
        friendlyMsg = "El correo ingresado no pertenece a ninguna cuenta registrada.";
      } else if (err.message.includes("The email is not valid")) {
      friendlyMsg = "El formato del correo electrónico no es válido.";
      } else if (err && err.message && /fetch|failed to fetch|network error/i.test(err.message)) {
          friendlyMsg = 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';
        } else {
          // Fallback: if server returned a message use it, otherwise generic
          friendlyMsg = err && err.message ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo más tarde.';
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
          <h1 className="text-3xl font-bold text-conexia-green mb-2">Iniciar sesión</h1>
          <p className="text-sm text-gray-600">
            Accede a tu cuenta para conectar con tu comunidad
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Campo email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="user@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused((prev) => ({ ...prev, email: true }))}
              onBlur={() => {
                setFocused((prev) => ({ ...prev, email: false }));
                setTouched((prev) => ({ ...prev, email: true }));
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                getEmailError()
                  ? "border-red-500 ring-2 ring-red-300"
                  : "border-gray-300 focus:ring-conexia-green/40 focus:border-conexia-green"
              }`}
            />
            {getEmailError() && (
              <p className="text-xs text-red-600 mt-1.5">{getEmailError()}</p>
            )}
          </div>

          {/* Campo contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
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
                className={`w-full px-4 py-2.5 border rounded-lg pr-10 focus:outline-none focus:ring-2 transition-all ${
                  getPasswordError()
                    ? "border-red-500 ring-2 ring-red-300"
                    : "border-gray-300 focus:ring-conexia-green/40 focus:border-conexia-green"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3 text-gray-500 hover:text-conexia-green transition-colors"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {getPasswordError() && (
              <p className="text-xs text-red-600 mt-1.5">{getPasswordError()}</p>
            )}
          </div>

          {/* Link olvidé contraseña */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-conexia-green hover:underline font-medium">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-conexia-green/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Botón crear cuenta */}
        <div className="mt-6">
          <Link
            href="/register"
            className="block w-full text-center bg-gray-100 text-conexia-green py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            Crear cuenta nueva
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

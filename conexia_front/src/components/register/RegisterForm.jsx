"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { registerUser } from "@/service/user/userFetch";
import InputField from "@/components/form/InputField";
import { validateEmail, validatePassword, validateRepeatPwd } from "@/utils/validation";
import ConexiaLogo from "@/components/ui/ConexiaLogo";


export default function RegisterForm() {
  // Usa la variable de entorno para la clave de sitio reCAPTCHA
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    repeatPwd: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState({});
  const [msg, setMsg] = useState(null);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showRepeatPwd, setShowRepeatPwd] = useState(false);

  const getError = (field) => {
    // Solo mostrar errores después del submit y cuando el campo no está enfocado
    if (!submitted || focused[field]) return "";

    const value = form[field];

    if (field === "repeatPwd") {
      return validateRepeatPwd(form.password, form.repeatPwd);
    }

    return {
      email: validateEmail,
      password: validatePassword,
    }[field](value);
  };

  const handleBlur = (field) => {
    setFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const repeatPwdError = validateRepeatPwd(form.password, form.repeatPwd);

    if (emailError || passwordError || repeatPwdError)
      return setMsg({ ok: false, text: "" });

    if (!captchaValue) {
      setMsg({ ok: false, text: "Por favor, completa el captcha para continuar." });
      return;
    }

    try {
      await registerUser(form);
      setMsg({
        ok: true,
        text: "Código enviado a tu correo. Por favor revísalo.",
      });
      setTimeout(() => {
        router.push(`/verify-account?email=${encodeURIComponent(form.email)}`);
      }, 800);
    } catch (error) {
      if (error.message.includes("already exists")) {
        setMsg({
          ok: false,
          text: "Este correo ya está registrado. Intenta con otro.",
        });
      } else {
        setMsg({
          ok: false,
          text: "Ocurrió un error al registrarte. Intenta nuevamente.",
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
          <h1 className="text-3xl font-bold text-conexia-green mb-2">Crea tu cuenta</h1>
          <p className="text-sm text-gray-600">
            Ingresa tu correo y crea una contraseña. Te enviaremos un código por email para verificar tu identidad antes de completar el registro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Campo Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <InputField
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onFocus={() => setFocused((prev) => ({ ...prev, email: true }))}
              onBlur={() => handleBlur("email")}
              error={getError("email")}
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <InputField
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
              onBlur={() => handleBlur("password")}
              error={getError("password")}
              showToggle={true}
              show={showPwd}
              onToggle={() => setShowPwd(!showPwd)}
            />
          </div>

          {/* Campo Repetir Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repetir contraseña
            </label>
            <InputField
              type="password"
              placeholder="Repetir contraseña"
              value={form.repeatPwd}
              onChange={(e) => handleChange("repeatPwd", e.target.value)}
              onFocus={() => setFocused((prev) => ({ ...prev, repeatPwd: true }))}
              onBlur={() => handleBlur("repeatPwd")}
              error={getError("repeatPwd")}
              showToggle={true}
              show={showRepeatPwd}
              onToggle={() => setShowRepeatPwd(!showRepeatPwd)}
            />
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center pt-2">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={setCaptchaValue}
            />
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-conexia-green/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Registrarme
          </button>
        </form>

        {/* Link a login */}
        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya sos parte de Conexia?{" "}
          <Link href="/login" className="text-conexia-coral hover:underline font-semibold">
            Iniciar sesión
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


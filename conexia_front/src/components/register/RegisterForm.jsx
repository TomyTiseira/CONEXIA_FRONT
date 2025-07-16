"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/service/user/userFetch";
import InputField from "@/components/form/InputField";
import { validateEmail, validatePassword, validateRepeatPwd } from "@/utils/validation";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    repeatPwd: "",
  });

  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState({});
  const [msg, setMsg] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showRepeatPwd, setShowRepeatPwd] = useState(false);

  const getError = (field) => {
    const value = form[field];
    if (!touched[field]) return "";

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
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, repeatPwd: true });

    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    const repeatPwdError = validateRepeatPwd(form.password, form.repeatPwd);

    if (emailError || passwordError || repeatPwdError)
      return setMsg({ ok: false, text: "" });

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
    <div className="relative flex flex-col justify-center items-center w-full md:w-[40%] px-6 pt-10 pb-12 bg-conexia-soft">
      <div className="flex justify-end mb-4">
        <Image src="/logo-conexia.png" alt="Conexia logo" width={100} height={40} />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Crea tu cuenta</h1>
        <p className="mb-5 text-sm text-conexia-green/90">
          Ingresa tu correo y crea una contraseña. Te enviaremos un código por email para verificar tu identidad antes de completar el registro.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Campo Correo */}
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">
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
            <label className="block text-sm font-medium text-conexia-green mb-1">
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
            <label className="block text-sm font-medium text-conexia-green mb-1">
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

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
          >
            Registrarme
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          ¿Ya sos parte de Conexia?{" "}
          <Link href="/login" className="text-conexia-coral hover:underline font-semibold">
            Iniciar sesión
          </Link>
        </div>

        <div className="min-h-[40px] mt-4 text-center text-sm transition-all duration-300">
          {msg && (
            <p className={`${msg.ok ? "text-green-600" : "text-red-600"}`}>
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

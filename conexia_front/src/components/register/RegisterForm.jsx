"use client";

import { useSearchParams } from "next/navigation";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/service/user/userFetch";
import InputField from "@/components/form/InputField";


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


  const validateEmail = (value) => {
    if (!value) return "";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Email inválido.";
    return "";
  };

  const validatePassword = (value) => {
  if (!value) return "";

  const hasMinLength = value.length >= 12;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  if (!hasMinLength) return "Debe tener al menos 12 caracteres.";
  if (!hasUpperCase) return "Debe contener al menos una letra mayúscula.";
  if (!hasLowerCase) return "Debe contener al menos una letra minúscula.";
  if (!hasNumber) return "Debe contener al menos un número.";
  if (!hasSymbol) return "Debe contener al menos un símbolo.";

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
      case "email": return validateEmail(value);
      case "password": return validatePassword(value);
      case "repeatPwd": return validateRepeatPwd(value);
      default: return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, repeatPwd: true });

    const hasErrors =
      validateEmail(form.email) ||
      validatePassword(form.password) ||
      validateRepeatPwd(form.repeatPwd);

    if (hasErrors) return setMsg(null);

    try {
      await registerUser(form);
      setMsg({ ok: true, text: "Código enviado a tu correo. Por favor revísalo." });
      setTimeout(() => {
        router.push(`/verify-account?email=${encodeURIComponent(form.email)}`);
      }, 800);
    } catch (error) {
      if (error.message.includes("already exists")) {
        setMsg({ ok: false, text: "Este correo ya está registrado. Intenta con otro." });
      } else {
        setMsg({ ok: false, text: "Ocurrió un error al registrarte. Intenta nuevamente." });
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

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <InputField
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onFocus={() => setFocused({ ...focused, email: true })}
            onBlur={() => {
              setFocused({ ...focused, email: false });
              setTouched({ ...touched, email: true });
            }}
            error={getError("email")}
          />

          <InputField
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onFocus={() => setFocused({ ...focused, password: true })}
            onBlur={() => {
              setFocused({ ...focused, password: false });
              setTouched({ ...touched, password: true });
            }}
            error={getError("password")}
            showToggle={true}
            show={showPwd}
            onToggle={() => setShowPwd(!showPwd)}
          />

          {/* Repeat password */}
          <InputField
            type="password"
            placeholder="Repetir contraseña"
            value={form.repeatPwd}
            onChange={(e) => setForm({ ...form, repeatPwd: e.target.value })}
            onFocus={() => setFocused({ ...focused, repeatPwd: true })}
            onBlur={() => {
              setFocused({ ...focused, repeatPwd: false });
              setTouched({ ...touched, repeatPwd: true });
            }}
            error={getError("repeatPwd")}
            showToggle={true}
            show={showRepeatPwd}
            onToggle={() => setShowRepeatPwd(!showRepeatPwd)}
          />

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

        <div className="min-h-[24px] mt-4 text-center text-sm transition-all duration-300">
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


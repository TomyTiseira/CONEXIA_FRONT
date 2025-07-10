"use client";

import { useState } from "react";
import { useResetPasswordStore } from "@/store/useResetPasswordStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { resetPassword } from "@/service/auth/recoveryService";
import InputField from "@/components/form/InputField";

export default function ResetPasswordForm() {
  const email = useResetPasswordStore((state) => state.email);
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState({});
  const [msg, setMsg] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);


  const validatePassword = (value) => {
    if (!value) return "";
    const hasMinLength = value.length >= 12;
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);

    if (!hasMinLength) return "Debe tener al menos 12 caracteres.";
    if (!hasUpper) return "Debe contener al menos una letra mayúscula.";
    if (!hasLower) return "Debe contener al menos una letra minúscula.";
    if (!hasNumber) return "Debe contener al menos un número.";
    if (!hasSymbol) return "Debe contener al menos un símbolo.";
    return "";
  };

  const validateConfirmPwd = (value) => {
    if (!value) return "";
    if (value !== form.password) return "Las contraseñas no coinciden.";
    return "";
  };

  const getError = (field) => {
    const value = form[field];
    if (!touched[field] || focused[field]) return "";

    switch (field) {
      case "password": return validatePassword(value);
      case "confirmPassword": return validateConfirmPwd(value);
      default: return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    const hasErrors =
      validatePassword(form.password) || validateConfirmPwd(form.confirmPassword);

    if (hasErrors) return setMsg(null);

    try {
          await resetPassword({ email, password: form.password, confirmPassword: form.confirmPassword });
        setMsg({ ok: true, text: "¡Contraseña cambiada con éxito!" });
        setTimeout(() => {
        router.push("/login");
        }, 1500);
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full md:w-[40%] px-6 py-10 bg-conexia-soft">
      <div className="flex justify-end mb-4">
        <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} />
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Nueva contraseña</h1>
        <p className="mb-5 text-sm text-conexia-green/90">
          Crea una contraseña nueva y segura para proteger tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <InputField
            type="password"
            placeholder="Nueva contraseña"
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

          <InputField
            type="password"
            placeholder="Repetir contraseña"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            onFocus={() => setFocused({ ...focused, confirmPassword: true })}
            onBlur={() => {
              setFocused({ ...focused, confirmPassword: false });
              setTouched({ ...touched, confirmPassword: true });
            }}
            error={getError("confirmPassword")}
            showToggle={true}
            show={showConfirmPwd}
            onToggle={() => setShowConfirmPwd(!showConfirmPwd)}
          />

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90"
          >
            Cambiar contraseña
          </button>
        </form>

        <div className="min-h-[40px] mt-4 text-center text-sm">
          {msg && <p className={msg.ok ? "text-green-600" : "text-red-600"}>{msg.text}</p>}
        </div>
      </div>
    </div>
  );
}

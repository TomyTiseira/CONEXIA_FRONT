"use client";

import { useState } from "react";
import { useResetPasswordStore } from "@/store/useResetPasswordStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { resetPassword } from "@/service/auth/recoveryService";
import InputField from "@/components/form/InputField";
import { validatePassword, validateRepeatPwd } from "@/utils/validation";
import ConexiaLogo from "@/components/ui/ConexiaLogo";

export default function ResetPasswordForm() {
  const email = useResetPasswordStore((state) => state.email);
  const router = useRouter();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({});
  const [focused, setFocused] = useState({});
  const [msg, setMsg] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

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

  const getError = (field) => {
    const value = form[field];
    if (!touched[field]) return "";

    if (field === "confirmPassword") {
      return validateRepeatPwd(form.password, form.confirmPassword);
    }

    return {
      password: validatePassword,
    }[field](value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    const passwordError = validatePassword(form.password);
    const confirmError = validateRepeatPwd(form.password, form.confirmPassword);

    if (passwordError || confirmError) return;

    try {
      await resetPassword({
        email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setMsg({ ok: true, text: "¡Contraseña cambiada con éxito!" });
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      let friendlyMsg = "Error inesperado";

      if (
        err.message?.toLowerCase().includes("new password cannot be the same as the current password")
      ) {
        friendlyMsg =
          "La nueva contraseña no puede ser igual a la contraseña actual. Intenta con una diferente.";
      } else {
        friendlyMsg = err.message || "Error inesperado";
      }

      setMsg({ ok: false, text: friendlyMsg });
    }
  };


  return (
    <div className="flex flex-col justify-center items-center w-full md:w-[40%] px-6 py-10 bg-conexia-soft">
      <div className="flex justify-center mb-4">
        <ConexiaLogo width={80} height={32} />
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Nueva contraseña</h1>
        <p className="mb-5 text-sm text-conexia-green/90">
          Crea una contraseña nueva y segura para proteger tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <InputField
            type="password"
            placeholder="Nueva contraseña"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, password: true }))}
            onBlur={() => handleBlur("password")}
            error={getError("password")}
            showToggle={true}
            show={showPwd}
            onToggle={() => setShowPwd(!showPwd)}
          />

          <InputField
            type="password"
            placeholder="Repetir contraseña"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onFocus={() => setFocused((prev) => ({ ...prev, confirmPassword: true }))}
            onBlur={() => handleBlur("confirmPassword")}
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

        <div className="min-h-[50px] mt-4 text-center text-sm transition-all duration-300">
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

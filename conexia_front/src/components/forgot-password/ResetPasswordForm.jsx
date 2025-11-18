"use client";

import { useState } from "react";
import { useResetPasswordStore } from "@/store/useResetPasswordStore";
import { useRouter } from "next/navigation";
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

  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState({});
  const [msg, setMsg] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handleBlur = (field) => {
    setFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getError = (field) => {
    // Solo mostrar errores después del submit y cuando el campo no está enfocado
    if (!submitted || focused[field]) return "";

    const value = form[field];

    if (field === "confirmPassword") {
      return validateRepeatPwd(form.password, form.confirmPassword);
    }

    return {
      password: validatePassword,
    }[field](value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

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
    <div className="w-full max-w-md">
      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        {/* Logo y header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <ConexiaLogo width={100} height={40} />
          </div>
          <h1 className="text-3xl font-bold text-conexia-green mb-2">Nueva contraseña</h1>
          <p className="text-sm text-gray-600">
            Crea una contraseña nueva y segura para proteger tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Campo Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
            </label>
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
          </div>

          {/* Campo Repetir Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repetir contraseña
            </label>
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
          </div>

          <button
            type="submit"
            className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-conexia-green/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Cambiar contraseña
          </button>
        </form>

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

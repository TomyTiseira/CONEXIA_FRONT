"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/service/auth/authService";
import { resendVerification } from "@/service/user/userFetch";
import ConexiaLogo from "@/components/ui/ConexiaLogo";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState({ email: false, password: false });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success' | 'warning' | 'error', text: string }

  // Verificar si el usuario fue baneado durante una sesión activa
  useEffect(() => {
    const bannedFromSession = searchParams.get('banned') === 'true';
    const bannedMessage = searchParams.get('message');
    
    if (bannedFromSession && bannedMessage) {
      setMsg({ 
        type: 'banned', 
        text: decodeURIComponent(bannedMessage)
      });
    }
  }, [searchParams]);

  const validateEmail = (value) => {
    if (!value) return "Ingrese un correo electrónico.";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Email inválido.";
    return "";
  };

  const getEmailError = () => {
    if (!submitted || focused.email) return "";
    return validateEmail(form.email);
  };

  const getPasswordError = () => {
    if (!submitted || focused.password) return "";
    return !form.password ? "Ingrese una contraseña." : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const emailError = validateEmail(form.email);
    const passwordError = !form.password ? "Ingrese una contraseña." : "";

    if (emailError || passwordError) {
      return setMsg({ type: 'error', text: "" });
    }

    try {
      const response = await loginUser({ email: form.email, password: form.password });
      
      // Verificar si el perfil está incompleto
      // IMPORTANTE: Usar comparación estricta con false
      // null = Admin/Moderador (no necesitan perfil)
      // false = Usuario con perfil incompleto
      // true = Usuario con perfil completo
      if (response?.data?.user?.isProfileComplete === false) {
        router.push("/profile/complete");
        return;
      }
      
      // Mostrar modal de éxito y redirigir después de un breve momento
      setMsg({ type: 'success', text: "Sesión iniciada con éxito." });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      let friendlyMsg = "Ocurrió un error al iniciar sesión.";

      // Verificar si el usuario está baneado
      if (err.message.includes("baneada") || err.message.includes("banned")) {
        setMsg({ type: 'banned', text: err.message || "Tu cuenta ha sido baneada. Contacta a soporte para más información." });
        return;
      }

      // Verificar si el usuario está suspendido
      if (err.message.includes("suspendida") || err.message.includes("suspended")) {
        setMsg({ type: 'suspended', text: err.message || "Tu cuenta ha sido suspendida temporalmente." });
        return;
      }

      if (err.message.includes("not verified")) {
        // Cuenta no verificada: reenviar código y redirigir a verificación
        try {
          await resendVerification(form.email);
          // Mostrar mensaje de advertencia y redirigir después de un tiempo
          setMsg({ 
            type: 'warning', 
            text: "Tu cuenta no está verificada. Te redireccionaremos para que puedas terminar de verificar tu correo." 
          });
          setTimeout(() => {
            router.push(`/verify-account?email=${encodeURIComponent(form.email)}&fromLogin=true`);
          }, 2000);
          return;
        } catch (resendErr) {
          friendlyMsg = "Tu cuenta no está verificada. No pudimos reenviar el código. Intenta más tarde.";
        }
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

      setMsg({ type: 'error', text: friendlyMsg });
    }
  };

  return (
    <>
      {/* Modal de Baneo - Overlay */}
      {msg && msg.type === 'banned' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden animate-fade-in">
            {/* Header con gradiente rojo */}
            <div className="p-6 bg-gradient-to-r from-red-500 to-red-600">
              <h3 className="text-white text-xl font-bold text-center">Cuenta suspendida permanentemente</h3>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Alert banner principal */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-800 text-sm leading-relaxed">
                      Tu cuenta ha sido <span className="font-bold">baneada permanentemente</span> debido a infracciones graves de nuestras políticas de uso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Razón del baneo */}
              {msg.text.includes("Razón:") && (
                <div className="space-y-2">
                  <h4 className="text-conexia-green font-semibold text-sm">Razón del baneo</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-700 text-sm">
                      {msg.text.match(/Razón: ([^.]+)/)?.[1] || msg.text}
                    </p>
                  </div>
                </div>
              )}

              {/* Información de contacto */}
              <div className="text-center pt-1">
                <p className="text-sm text-conexia-green">
                  ¿Tenés dudas o deseás apelar esta decisión? Contactá a{' '}
                  <a 
                    href="mailto:soporte@conexia.com" 
                    className="text-conexia-green hover:underline font-semibold"
                  >
                    soporte@conexia.com
                  </a>
                </p>
              </div>
            </div>

            {/* Footer con botón */}
            <div className="px-6 pb-6 flex justify-center">
              <button
                onClick={() => setMsg(null)}
                className="bg-conexia-green hover:bg-conexia-green/90 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors duration-200 text-sm shadow-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito - Overlay */}
      {msg && msg.type === 'success' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
            {/* Ícono de check grande con animación */}
            <div className="flex justify-center mb-4">
              <div className="bg-conexia-green/10 rounded-full p-4">
                <svg className="w-12 h-12 text-conexia-green animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Contenido */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-conexia-green">
                ¡Bienvenido!
              </h2>
              <p className="text-base text-gray-700">
                Sesión iniciada con éxito.
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo...
              </p>
            </div>
          </div>
        </div>
      )}

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
              onBlur={() => setFocused((prev) => ({ ...prev, email: false }))}
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
                onBlur={() => setFocused((prev) => ({ ...prev, password: false }))}
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

        {/* Mensaje de éxito/error/advertencia */}
        {msg && (
          <div className="mt-4">
            {/* Mensaje de suspensión - Formato especial debajo del formulario */}
            {msg.type === 'suspended' && (
              <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-bold text-orange-700 mb-2">
                      {msg.text.match(/suspendida hasta el [^.]+/)?.[0] || "Tu cuenta ha sido suspendida temporalmente."}
                    </h3>
                    {msg.text.includes("Razón:") && (
                      <p className="text-sm text-orange-600 font-medium mb-2">
                        {msg.text.match(/Razón: ([^.]+)/)?.[0] || ""}
                      </p>
                    )}
                    <p className="text-sm text-orange-600">
                      Podrás acceder nuevamente después de esta fecha.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensajes normales (warning, error) */}
            {msg.type !== 'banned' && msg.type !== 'suspended' && msg.type !== 'success' && (
              <div className="text-center">
                <p className={`text-sm font-medium ${
                  msg.type === 'warning' ? "text-[#cc3a42]" : "text-red-600"
                }`}>
                  {msg.text}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}

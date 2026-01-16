'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut } from 'lucide-react';
import { logoutUser } from '@/service/auth/authService';
import { setLoggingOut } from '@/service/auth/fetchWithRefresh';

export default function AccessDenied({ 
  title = "Acceso Denegado", 
  message = "Tu cuenta no tiene autorización para realizar esta acción o acceder a este contenido.",
  reason = null,
  showLogoutButton = true 
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
      localStorage.clear();
      sessionStorage.clear();
      
      // Forzar recarga completa de la página para limpiar todo el estado
      window.location.href = '/login';
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Forzar logout local si falla
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        {/* Ícono de alerta grande */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-5">
            <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
        </div>

        {/* Contenido */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-700">
            {title}
          </h2>
          
          <p className="text-base text-gray-700">
            {message}
          </p>

          {reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <p className="text-sm text-red-700 font-medium">
                <span className="font-bold">Razón:</span> {reason}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p>
              Tu sesión ha sido cerrada automáticamente. Por favor, vuelve a iniciar sesión o contacta a soporte si crees que esto es un error.
            </p>
          </div>
        </div>

        {/* Botón de cerrar sesión */}
        {showLogoutButton && (
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-conexia-green/90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <LogOut size={18} />
              Ir a Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

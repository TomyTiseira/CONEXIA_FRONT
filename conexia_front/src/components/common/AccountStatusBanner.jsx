'use client';

import { useAuth } from '@/context/AuthContext';
import { 
  isUserSuspended, 
  calculateDaysRemaining, 
  formatReactivationDate 
} from '@/constants/accountStatus';
import { AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

/**
 * Banner persistente que se muestra en la parte superior de la pantalla
 * cuando el usuario tiene una cuenta suspendida.
 * 
 * Muestra:
 * - Razón de la suspensión
 * - Fecha de reactivación
 * - Countdown de días restantes
 * - Mensaje sobre restricciones
 */
export default function AccountStatusBanner() {
  const { user } = useAuth();

  // Solo mostrar si el usuario está suspendido
  if (!user || !isUserSuspended(user)) {
    return null;
  }

  const daysRemaining = calculateDaysRemaining(user.suspensionExpiresAt);
  const reactivationDate = formatReactivationDate(user.suspensionExpiresAt);

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Icono */}
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-sm">Tu cuenta está suspendida temporalmente</h3>
              <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs font-medium">
                <Clock className="w-3 h-3" />
                {daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}
              </span>
            </div>

            {/* Razón */}
            {user.suspensionReason && (
              <p className="text-sm mb-1">
                <span className="font-medium">Razón:</span> {user.suspensionReason}
              </p>
            )}

            {/* Fecha de reactivación */}
            <p className="text-sm mb-2">
              <span className="font-medium">Se reactivará el:</span> {reactivationDate} a las 2:00 AM
            </p>

            {/* Restricciones */}
            <div className="bg-white/10 rounded px-3 py-2 text-xs">
              <p className="font-medium mb-1">Durante la suspensión:</p>
              <ul className="space-y-0.5 ml-4 list-disc">
                <li>✅ Puedes completar tus proyectos y servicios actuales</li>
                <li>❌ No puedes crear nuevos proyectos o servicios</li>
                <li>❌ No puedes postularte a proyectos o contratar servicios</li>
              </ul>
            </div>
          </div>

          {/* Enlace a compromisos actuales */}
          <div className="flex-shrink-0">
            <Link 
              href="/dashboard"
              className="inline-block bg-white text-orange-600 hover:bg-gray-100 px-3 py-1.5 rounded text-xs font-medium transition-colors"
            >
              Ver mis compromisos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

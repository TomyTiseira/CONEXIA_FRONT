import { useState, useEffect } from 'react';
import { checkOnboardingStatus } from '@/service/user/userFetch';

/**
 * Hook para verificar si el usuario tiene un onboarding_token válido
 * El onboarding_token es una cookie HttpOnly que se establece después de verificar la cuenta
 * y antes de completar el perfil.
 * 
 * @returns {Object} - { isAllowed: boolean, isChecking: boolean }
 */
export const useOnboardingStatus = () => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await checkOnboardingStatus();

        if (cancelled) return;

        if (res.ok) {
          // Usuario tiene onboarding_token válido
          setIsAllowed(true);
        } else {
          // No tiene onboarding_token o expiró
          setIsAllowed(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error verificando estado de onboarding:', error);
          setIsAllowed(false);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return { isAllowed, isChecking };
};

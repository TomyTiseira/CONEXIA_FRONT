/**
 * CountdownTimer Component
 * Countdown timer para mostrar tiempo restante hasta deadline
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatTimeRemaining, getUrgencyLevel, URGENCY_LEVEL } from '@/constants/compliances';

export const CountdownTimer = ({ deadline, warningLevel, className = '', showIcon = true }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [urgency, setUrgency] = useState(URGENCY_LEVEL.NORMAL);

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(deadline));
      setUrgency(getUrgencyLevel(deadline, warningLevel));
    };

    // Actualización inicial
    updateTimer();

    // Actualizar cada minuto
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [deadline, warningLevel]);

  // Colores según urgencia
  const getColorClasses = () => {
    switch (urgency) {
      case URGENCY_LEVEL.CRITICAL:
        return 'text-red-600 font-bold';
      case URGENCY_LEVEL.URGENT:
        return 'text-orange-600 font-semibold';
      case URGENCY_LEVEL.WARNING:
        return 'text-yellow-600 font-medium';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`inline-flex items-center ${getColorClasses()} ${className}`}>
      {showIcon && <Clock size={16} className="mr-1" />}
      <span>{timeRemaining}</span>
    </div>
  );
};

export default CountdownTimer;

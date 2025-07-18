export function calculateAge(dateString) {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export const isValidPastOrToday = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date <= today;
};

export const isStartDateBeforeEndDate = (start, end) => {
  return new Date(start) <= new Date(end);
};

export const isValidExperienceDates = ({ startDate, endDate, isCurrent }) => {
  const hoy = new Date();

  if (!startDate) return { valid: false, error: "Falta la fecha desde." };
  const desde = new Date(startDate);

  if (desde > hoy) return { valid: false, error: "La fecha desde no puede ser posterior a hoy." };

  if (!isCurrent) {
    if (!endDate) return { valid: false, error: "Falta la fecha hasta." };
    const hasta = new Date(endDate);

    if (hasta < desde) return { valid: false, error: "La fecha hasta no puede ser anterior a la fecha desde." };
    if (hasta > hoy) return { valid: false, error: "La fecha hasta no puede ser posterior a hoy." };
  }

  return { valid: true };
};

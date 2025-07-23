import { isValidExperienceDates } from "./fechas.jsx";

export const validateExperienceEntry = (exp, birthDate) => {
  const { title, project, startDate, endDate, isCurrent } = exp;
  console.log("startDate original:", birthDate, "tipo:", typeof birthDate);
  console.log("startDate original:", startDate, "tipo:", typeof startDate);

  if ((title && !project) || (!title && project)) {
    return { valid: false, error: "Completá título y proyecto." };
  }

  const dateCheck = isValidExperienceDates({ startDate, endDate, isCurrent }, birthDate);
  if (!dateCheck.valid) return { valid: false, error: dateCheck.error };

  return { valid: true };
};

export const validateAllExperiences = (experiences, birthDate) => {
  for (const exp of experiences) {
    const result = validateExperienceEntry(exp, birthDate);
    if (!result.valid) return result;
  }
  return { valid: true };
};

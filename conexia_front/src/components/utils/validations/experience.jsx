import { isValidExperienceDates } from "./fechas.jsx";

export const validateExperienceEntry = ({ title, project, startDate, endDate, isCurrent }) => {
  if ((title && !project) || (!title && project)) {
    return { valid: false, error: "Completá título y proyecto." };
  }

  const dateCheck = isValidExperienceDates({ startDate, endDate, isCurrent });
  if (!dateCheck.valid) return { valid: false, error: dateCheck.error };

  return { valid: true };
};

export const validateAllExperiences = (experiences) => {
  for (const exp of experiences) {
    const result = validateExperienceEntry(exp);
    if (!result.valid) return result;
  }
  return { valid: true };
};

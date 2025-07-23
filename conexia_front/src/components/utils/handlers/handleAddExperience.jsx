import { validateExperienceEntry } from "../validations/experience";

export const handleAddExperience = (form, setForm, setFieldErrors, birthDate) => {
  const current = form.experience.at(-1);

  // Si no hay una entrada actual (ej: se borraron todas), no validar, solo agregar
  if (!current || Object.values(current).every((val) => val === "" || val === false)) {
    setForm({
      ...form,
      experience: [
        ...form.experience,
        { title: "", project: "", startDate: "", endDate: "", isCurrent: false },
      ],
    });
    return;
  }

  const result = validateExperienceEntry(current, birthDate);
  if (!result.valid) {
    setFieldErrors((prev) => ({ ...prev, experience: result.error }));
    return;
  }

  setFieldErrors((prev) => ({ ...prev, experience: "" }));
  setForm({
    ...form,
    experience: [
      ...form.experience,
      { title: "", project: "", startDate: "", endDate: "", isCurrent: false },
    ],
  });
};

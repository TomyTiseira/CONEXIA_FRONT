import { validateExperienceEntry } from "../validations/experience";

export const handleAddExperience = (form, setForm, setFieldErrors) => {
  const current = form.experience.at(-1);
  const result = validateExperienceEntry(current);

  if (!result.valid) {
    setFieldErrors((prev) => ({ ...prev, experience: result.error }));
    return;
  }

  setFieldErrors((prev) => ({ ...prev, experience: "" }));
  setForm({
    ...form,
    experience: [...form.experience, {
      title: "", project: "", startDate: "", endDate: "", isCurrent: false
    }]
  });
};

export const toggleHabilidad = (habilidad, form, setForm) => {
  const updated = form.skills.includes(habilidad)
    ? form.skills.filter((h) => h !== habilidad)
    : [...form.skills, habilidad];

  setForm({ ...form, skills: updated });
};

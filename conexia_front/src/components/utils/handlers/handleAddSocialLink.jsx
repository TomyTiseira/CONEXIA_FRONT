import { validateSocialLink } from "../validations/socialLinks";

export const handleAddSocialLink = (form, setForm, setFieldErrors) => {
  const last = form.socialLinks.at(-1);

  // Si no hay entrada actual o está vacía, agregar directamente sin validar
  if (
    !last ||
    (last.platform === "" && last.url.trim() === "")
  ) {
    setForm({
      ...form,
      socialLinks: [...form.socialLinks, { platform: "", url: "" }],
    });
    return;
  }

  const result = validateSocialLink(last);

  if (!result.valid) {
    setFieldErrors((prev) => ({ ...prev, socialLinks: result.error }));
    return;
  }

  setFieldErrors((prev) => ({ ...prev, socialLinks: "" }));
  setForm({
    ...form,
    socialLinks: [...form.socialLinks, { platform: "", url: "" }],
  });
};

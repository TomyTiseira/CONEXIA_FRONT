import { validateSocialLink } from "../validations/socialLinks";

export const handleAddSocialLink = (form, setForm, setFieldErrors) => {
  const last = form.socialLinks.at(-1);
  const result = validateSocialLink(last);

  if (!result.valid) {
    setFieldErrors((prev) => ({ ...prev, socialLinks: result.error }));
    return;
  }

  setFieldErrors((prev) => ({ ...prev, socialLinks: "" }));
  setForm({
    ...form,
    socialLinks: [...form.socialLinks, { platform: "", url: "" }]
  });
};

import { createUserProfile } from "@/service/profiles/profilesFetch";
import { calculateAge } from "@/components/utils/validations/fechas";
import { isValidPhoneNumber } from "@/components/utils/validations/phones";
import { validateAllSocialLinks } from "@/components/utils/validations/socialLinks";
import { validateAllExperiences } from "@/components/utils/validations/experience";

export const handleSubmitProfile = async (e, form, setMsg, router) => {
  e.preventDefault();

  const requiredFields = ["name", "lastName", "birthDate", "documentTypeId", "documentNumber"];
  const missing = requiredFields.some((f) => !form[f]);
  if (missing) {
    return setMsg({ ok: false, text: "Completá todos los campos obligatorios." });
  }

  if (calculateAge(form.birthDate) < 18) {
    return setMsg({ ok: false, text: "Debes tener al menos 18 años." });
  }

  if (form.phoneNumber && !isValidPhoneNumber(form.phoneNumber)) {
    return setMsg({ ok: false, text: "El teléfono debe ser numérico y válido (ej: 351xxxxxxxx)." });
  }

  // Experiencias con fechas corregidas
  const updatedExperience = form.experience.map((exp) =>
    exp.isCurrent
      ? { ...exp, startDate: new Date().toISOString().split("T")[0], endDate: undefined }
      : exp
  );

  const expValidation = validateAllExperiences(updatedExperience);
  if (!expValidation.valid) {
    return setMsg({ ok: false, text: expValidation.error });
  }

  const socialValidation = validateAllSocialLinks(form.socialLinks);
  if (!socialValidation.valid) {
    return setMsg({ ok: false, text: socialValidation.error });
  }

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      formData.set(key, JSON.stringify(key === "experience" ? updatedExperience : value));
    } else if (value instanceof File) {
      formData.set(key, value);
    } else if (typeof value === "number") {
      formData.set(key, value.toString());
    } else if (value !== null && value !== undefined) {
      formData.set(key, value);
    }
  });

  try {
    await createUserProfile(formData);
    setMsg({ ok: true, text: "Perfil creado con éxito." });
    setTimeout(() => router.push("/"), 1000);
  } catch (err) {
    setMsg({ ok: false, text: "Error al crear el perfil." });
  }
};

import { createUserProfile } from "@/service/profiles/profilesFetch";
import { calculateAge } from "@/components/utils/validations/fechas";
import { isValidPhoneNumber } from "@/components/utils/validations/phones";
import { validateAllSocialLinks } from "@/components/utils/validations/socialLinks";

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

  const updatedExperience = form.experience.map((exp) => {
    if (exp.isCurrent) {
      return {
        ...exp,
        startDate: new Date().toISOString().split("T")[0],
        endDate: undefined,
      };
    }
    return exp;
  });

  for (const exp of updatedExperience) {
    const { title, project, startDate, endDate, isCurrent } = exp;

    if ((title && !project) || (!title && project)) {
      return setMsg({ ok: false, text: "Completá título y proyecto en cada experiencia." });
    }

    if (!startDate || !isStartDateValid(startDate)) {
      return setMsg({ ok: false, text: "La fecha desde debe estar presente y no ser futura." });
    }

    if (!isCurrent) {
      if (!endDate || !isEndDateValid(endDate)) {
        return setMsg({ ok: false, text: "Completá una fecha hasta válida (no futura)." });
      }

      if (!isExperienceChronologicallyValid(startDate, endDate)) {
        return setMsg({ ok: false, text: "La fecha hasta no puede ser anterior a la fecha desde." });
      }
    }
  }

  for (const link of form.socialLinks) {
    if (!validateAllSocialLinks(link)) {
      return setMsg({ ok: false, text: "Completá plataforma y una URL válida en cada red social." });
    }
  }

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (key === "experience") {
        formData.set(key, JSON.stringify(updatedExperience));
      } else {
        formData.set(key, JSON.stringify(value));
      }
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

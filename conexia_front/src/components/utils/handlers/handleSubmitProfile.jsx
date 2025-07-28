import { createUserProfile } from "@/service/profiles/profilesFetch";
import { validateSimplePhone } from "@/components/utils/validations/phones";
import { validateAllSocialLinks } from "@/components/utils/validations/socialLinks";
import { validateAllExperiences } from "@/components/utils/validations/experience";

export const handleSubmitProfile = async (e, form, setMsg, router, updateAuthUser) => {
  e.preventDefault();

  if (form.phoneNumber && form.phoneNumber.trim() !== "" && !validateSimplePhone(form.phoneNumber).isValid) {
    const phoneValidation = validateSimplePhone(form.phoneNumber);
    return setMsg({ ok: false, text: phoneValidation.message });
  }

  // Experiencias con fechas corregidas
  const updatedExperience = form.experience.map((exp) =>
    exp.isCurrent
      ? { ...exp, startDate: new Date().toISOString().split("T")[0], endDate: undefined }
      : exp
  );

  const expValidation = validateAllExperiences(updatedExperience, form.birthDate);
	if (!expValidation.valid) {
		return setMsg({ ok: false, text: expValidation.error });
	}

const socialValidation = validateAllSocialLinks(form.socialLinks);
  if (!socialValidation.valid) {
    return setMsg({ ok: false, text: socialValidation.error });
  }

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    // No enviar phoneNumber si está vacío
    if (key === 'phoneNumber' && (!value || value.trim() === '')) {
      return;
    }
    
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
    const response = await createUserProfile(formData);
    setMsg({ ok: true, text: "Perfil creado con éxito." });
    
    // El usuario está en response.data.user según la estructura que devuelve el backend
    const userData = response.data?.user || response.user;
    
    if (response.success && userData && updateAuthUser) {
      updateAuthUser(userData);
      
      // Usar replace para evitar que el usuario pueda volver atrás a la página de creación
      setTimeout(() => {
        router.replace("/");
      }, 300);
    } else {
      console.error('No se pudo actualizar el usuario:', { 
        success: response.success, 
        hasUser: !!userData, 
        hasUpdateFunction: !!updateAuthUser
      });
      setMsg({ ok: false, text: "Error: No se pudo actualizar la sesión." });
    }
  } catch (err) {
    // Verificar si es el error específico de perfil existente (409)
    if (err.status === 409 || err.isDuplicateProfile || (err.message && err.message.includes('already exists'))) {
      // No registrar en consola porque es un error controlado
      setMsg({ 
        ok: false, 
        text: "Este documento ya se encuentra registrado.", 
        fields: ["documentTypeId", "documentNumber"] // Múltiples campos
      });
    } else {
      // Solo registrar en consola errores no controlados
      console.error('Error al crear perfil:', err);
      
      // Usar un mensaje más genérico que no cause problemas
      const errorMessage = typeof err === 'string' ? err : 
                          err.message || 
                          "Error al crear el perfil.";
      setMsg({ ok: false, text: errorMessage });
    }
  }
};

import { createUserProfile } from "@/service/profiles/profilesFetch";
import { validateAllSocialLinks } from "@/components/utils/validations/socialLinks";
import { validateAllExperiences } from "@/components/utils/validations/experience";
import { isValidExperienceDates } from "@/components/utils/validations/fechas";
import { isValidURL } from "@/components/utils/validations/urls";

// Validación para educación (igual que experiencia)
const validateEducationEntry = (edu, birthDate) => {
  const { institution, title, startDate, endDate, isCurrent } = edu;

  if ((institution && !title) || (!institution && title)) {
    return { valid: false, error: "Completá institución y título." };
  }

  const dateCheck = isValidExperienceDates({ startDate, endDate, isCurrent }, birthDate);
  if (!dateCheck.valid) return { valid: false, error: dateCheck.error };

  return { valid: true };
};

const validateAllEducations = (educations, birthDate) => {
  for (const edu of educations) {
    const result = validateEducationEntry(edu, birthDate);
    if (!result.valid) return result;
  }
  return { valid: true };
};

// Validación para certificaciones (igual que redes sociales)
const validateCertification = ({ name, url }) => {
  if ((name && !url) || (!name && url) || (!name && !url)) {
    return { valid: false, error: "Completá nombre y URL." };
  }
  if (url && !isValidURL(url)) {
    return { valid: false, error: "Ingresá una URL válida." };
  }
  return { valid: true };
};

const validateAllCertifications = (certifications) => {
  for (const cert of certifications) {
    const result = validateCertification(cert);
    if (!result.valid) return result;
  }
  return { valid: true };
};

export const handleSubmitProfile = async (e, form, setMsg, router, updateAuthUser) => {
  e.preventDefault();

  // La validación de teléfono ahora se hace en el formulario con areaCode y phoneNumber separados
  // No necesitamos validar phoneNumber aquí porque ya está separado en areaCode + phoneNumber

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

  // Validar educaciones (igual que experiencias)
  const eduValidation = validateAllEducations(form.education, form.birthDate);
  if (!eduValidation.valid) {
    return setMsg({ ok: false, text: eduValidation.error });
  }

const socialValidation = validateAllSocialLinks(form.socialLinks);
  if (!socialValidation.valid) {
    return setMsg({ ok: false, text: socialValidation.error });
  }

  // Validar certificaciones (igual que redes sociales)
  const certValidation = validateAllCertifications(form.certifications);
  if (!certValidation.valid) {
    return setMsg({ ok: false, text: certValidation.error });
  }

  const formData = new FormData();
  
  Object.entries(form).forEach(([key, value]) => {
    // No enviar phoneNumber ni areaCode si están vacíos
    if (key === 'phoneNumber' && (!value || value.trim() === '')) {
      return;
    }
    if (key === 'areaCode' && (!value || value.trim() === '')) {
      return;
    }
    
    if (Array.isArray(value)) {
      let processedValue;
      
      if (key === "experience") {
        processedValue = updatedExperience;
      } else if (key === "skills") {
        // Convertir skills a array de IDs
        processedValue = value.map(skill => skill.id);
      } else {
        processedValue = value;
      }
      
      const jsonString = JSON.stringify(processedValue);
      formData.set(key, jsonString);
    } else if (value instanceof File) {
      formData.set(key, value);
    } else if (typeof value === "number") {
      formData.set(key, value.toString());
    } else if (value !== null && value !== undefined) {
      formData.set(key, value);
    } else {
    }
  });
  
  try {
    // POST /users/profile - El backend detecta si hay perfil vacío y lo actualiza
    const response = await createUserProfile(formData);
    
    // El usuario puede estar en diferentes ubicaciones según la respuesta del backend
    const userData = response.data?.user || response.user || response.data;
    if (response.success !== false && userData && updateAuthUser) {
      // Actualizar el usuario en el contexto
      updateAuthUser(userData);
      // Mostrar mensaje de éxito
      setMsg({ ok: true, text: "¡Perfil creado con éxito! Redirigiendo a la comunidad..." });
      // Esperar y redirigir
      setTimeout(() => {
        window.location.href = "/";  // Usar window.location para forzar recarga completa
      }, 2000);
    } else if (userData && updateAuthUser) {
      // Si no hay success pero sí hay userData, asumir éxito
      updateAuthUser(userData);
      setMsg({ ok: true, text: "¡Perfil creado con éxito! Redirigiendo a la comunidad..." });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      console.error('No se pudo actualizar el usuario:', { 
        response: response,
        hasUser: !!userData, 
        hasUpdateFunction: !!updateAuthUser
      });
      setMsg({ ok: false, text: "Error: No se pudo actualizar la sesión del usuario." });
    }
  } catch (err) {
    // NO mostrar el error en consola para evitar el ISSUE
    // console.error('Error al crear perfil:', err);
    
    // Manejar error de documento duplicado (409)
    const statusCode = err.statusCode || err.status;
    if (statusCode === 409 && err.message && err.message.toLowerCase().includes('document number')) {
      setMsg({ 
        ok: false, 
        text: "Ya existe un usuario registrado con este número de documento"
      });
      return;
    }
    
    // Manejar error de perfil ya existente con datos
    if (err.message && err.message.includes('Profile already exists')) {
      setMsg({ ok: false, text: "Ya tenés un perfil creado. Redirigiendo a edición..." });
      setTimeout(() => {
        window.location.href = "/profile/edit";
      }, 2000);
      return;
    }
    
    // Usar un mensaje más genérico que no cause problemas
    const errorMessage = typeof err === 'string' ? err : 
                        err.message || 
                        "Error al crear el perfil.";
    setMsg({ ok: false, text: errorMessage });
  }
};

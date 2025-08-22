import { createUserProfile } from "@/service/profiles/profilesFetch";
import { updateUserProfile } from "@/service/profiles/updateProfile";
import { validateSimplePhone } from "@/components/utils/validations/phones";
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
  
  // Debug temporal - verificar estructura exacta que esperan
  console.log('=== ESTRUCTURA COMPLETA ENVIADA ===');
  console.log('Form completo:', form);
  console.log('Skills:', JSON.stringify(form.skills));
  console.log('Experience:', JSON.stringify(updatedExperience));
  console.log('Education:', JSON.stringify(form.education));
  console.log('Certifications:', JSON.stringify(form.certifications));
  console.log('Social Links:', JSON.stringify(form.socialLinks));
  
  Object.entries(form).forEach(([key, value]) => {
    // No enviar phoneNumber si está vacío
    if (key === 'phoneNumber' && (!value || value.trim() === '')) {
      console.log(`Skipping empty phoneNumber`);
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
      console.log(`${key} as JSON string:`, jsonString);
      formData.set(key, jsonString);
    } else if (value instanceof File) {
      console.log(`${key}: File - ${value.name}`);
      formData.set(key, value);
    } else if (typeof value === "number") {
      console.log(`${key}: ${value} (as string: ${value.toString()})`);
      formData.set(key, value.toString());
    } else if (value !== null && value !== undefined) {
      console.log(`${key}: ${value}`);
      formData.set(key, value);
    } else {
      console.log(`Skipping ${key}: null or undefined`);
    }
  });
  
  // Mostrar todo lo que va en FormData
  console.log('=== FORMDATA FINAL ===');
  for (let [key, value] of formData.entries()) {
    console.log(`FormData ${key}:`, value);
  }

  try {
    let response;
    try {
      response = await createUserProfile(formData);
    } catch (err) {
      // Si el error es porque el perfil ya existe, intentar actualizarlo
      if (
        err.status === 409 ||
        err.isDuplicateProfile ||
        (err.message && (err.message.includes('already exists') || err.message.includes('Profile already exists')))
      ) {
        // Convertir formData a objeto plano para updateUserProfile
        const plainPayload = {};
        for (let [key, value] of formData.entries()) {
          try {
            plainPayload[key] = JSON.parse(value);
          } catch {
            plainPayload[key] = value;
          }
        }
        response = await updateUserProfile(plainPayload);
      } else {
        throw err;
      }
    }
    
    // Debug de la respuesta completa
    console.log('Respuesta completa del backend:', response);
    // El usuario puede estar en diferentes ubicaciones según la respuesta del backend
    const userData = response.data?.user || response.user || response.data;
    console.log('Datos del usuario extraídos:', userData);
    console.log('Función updateUser disponible:', !!updateAuthUser);
    if (response.success !== false && userData && updateAuthUser) {
      // Actualizar el usuario en el contexto
      updateAuthUser(userData);
      // Mostrar mensaje de éxito
      setMsg({ ok: true, text: "¡Perfil creado con éxito! Redirigiendo a la comunidad..." });
      // Esperar y redirigir
      setTimeout(() => {
        console.log('Redirigiendo a la comunidad...');
        window.location.href = "/";  // Usar window.location para forzar recarga completa
      }, 2000);
    } else if (userData && updateAuthUser) {
      // Si no hay success pero sí hay userData, asumir éxito
      updateAuthUser(userData);
      setMsg({ ok: true, text: "¡Perfil creado con éxito! Redirigiendo a la comunidad..." });
      setTimeout(() => {
        console.log('Redirigiendo a la comunidad (caso alternativo)...');
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

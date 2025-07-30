// src/components/profile/userProfile/EditProfileForm.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleHabilidad } from "@/components/utils/toggleHabilidad";
import { useAuth } from "@/context/AuthContext";
import InputField from "@/components/form/InputField";
import Button from "@/components/ui/Button";
import TextArea from "@/components/form/InputField";
import { config } from "@/config";
import SkillsSelector from "@/components/skills/SkillsSelector";
import Image from "next/image";
import { validateSimplePhone, isValidDate, isCurrentOrFutureDate, calculateAge } from "@/utils/validation";
import { isValidURL } from "@/components/utils/validations/urls";

export default function EditProfileForm({ user, onSubmit, onCancel, isEditing = true }) {
  const router = useRouter();
  const profilePicRef = useRef(null);
  const coverPicRef = useRef(null);
  
  const [form, setForm] = useState({
    name: user.name || "",
    lastName: user.lastName || "",
    birthDate: user.birthDate || "",
    phoneNumber: user.phoneNumber || "",
    country: user.country || "",
    state: user.state || "",
    profession: user.profession || "",
    profilePicture: null,
    coverPicture: null,
    skills: user.skills || [],
    description: user.description || "",
    experience: (user.experience || []).map(exp => ({ ...exp, confirmed: true })),
    socialLinks: (user.socialLinks || []).map(link => ({ ...link, confirmed: true })),
    education: (user.education || []).map(edu => ({ ...edu, confirmed: true })),
    certifications: (user.certifications || []).map(cert => ({ ...cert, confirmed: true })),
  });
  
  const [imgErrors, setImgErrors] = useState({ profilePicture: '', coverPicture: '' });   
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [expErrors, setExpErrors] = useState([]);
  const [expTouched, setExpTouched] = useState([]);
  const [socialErrors, setSocialErrors] = useState([]);
  const [socialTouched, setSocialTouched] = useState([]);
  const [eduErrors, setEduErrors] = useState([]);
  const [eduTouched, setEduTouched] = useState([]);
  const [certErrors, setCertErrors] = useState([]);
  const [certTouched, setCertTouched] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expConfirmError, setExpConfirmError] = useState('');
  const [socialConfirmError, setSocialConfirmError] = useState('');
  const [eduConfirmError, setEduConfirmError] = useState('');
  const [certConfirmError, setCertConfirmError] = useState('');
  
  const habilidadesDisponibles = ["Frontend", "Backend", "UX/UI", "DevOps", "Marketing", "Otra"];
  const plataformas = ["LinkedIn", "GitHub", "Twitter", "Portfolio", "Otro"];

  // Inicializar estados para experiencias y redes sociales existentes
  useEffect(() => {
    // Inicializar errores y touched para experiencias existentes
    if (form.experience.length > 0) {
      setExpErrors(form.experience.map(exp => getExperienceErrors(exp)));
      setExpTouched(form.experience.map(() => ({ title: false, project: false, startDate: false, endDate: false })));
    }
    
    // Inicializar errores y touched para redes sociales existentes
    if (form.socialLinks.length > 0) {
      setSocialErrors(form.socialLinks.map(social => getSocialErrors(social)));
      setSocialTouched(form.socialLinks.map(() => ({ platform: false, url: false })));
    }

    // Inicializar errores y touched para educación existente
    if (form.education.length > 0) {
      setEduErrors(form.education.map(edu => getEducationErrors(edu)));
      setEduTouched(form.education.map(() => ({ institution: false, title: false, startDate: false, endDate: false })));
    }

    // Inicializar errores y touched para certificaciones existentes
    if (form.certifications.length > 0) {
      setCertErrors(form.certifications.map(cert => getCertificationErrors(cert)));
      setCertTouched(form.certifications.map(() => ({ name: false, url: false })));
    }
  }, []);

  // Función para obtener el siguiente día
  const getNextDay = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Campos obligatorios
  const requiredFields = [
    { name: "name", label: "Nombre" },
    { name: "lastName", label: "Apellido" },
    { name: "country", label: "País" },
    { name: "state", label: "Localidad" },
  ];

  // Función para validar campos individuales
  const validateField = (name, value) => {
    if (requiredFields.some(f => f.name === name)) {
      if (!value || value.trim() === '') {
        return 'Este campo es obligatorio';
      }
    }
    
    // Validación específica por campo
    switch (name) {
      case 'phoneNumber':
        if (value && value.trim()) {
          const phoneValidation = validateSimplePhone(value);
          if (!phoneValidation.isValid) {
            return phoneValidation.message;
          }
        }
        break;
      
      case 'birthDate':
        if (value) {
          if (!isValidDate(value)) return 'Fecha inválida';
          if (isCurrentOrFutureDate(value)) return 'La fecha debe ser anterior a hoy';
          const age = calculateAge(value);
          if (age < 18) return 'Debes ser mayor de 18 años';
        }
        break;
    }
    
    return '';
  };

  // Función para verificar si una experiencia es válida
  function isExperienceValid(exp) {
    return (
      exp.title && exp.title.trim() !== '' &&
      exp.project && exp.project.trim() !== '' &&
      exp.startDate &&
      (exp.isCurrent || exp.endDate)
    );
  }

  // Función para verificar si una experiencia es válida
  function isExperienceValid(exp) {
    return exp.title && exp.title.trim() !== '' && 
           exp.project && exp.project.trim() !== '' && 
           exp.startDate && 
           (exp.isCurrent || exp.endDate);
  }

  // Función para obtener errores de experiencia
  const getExperienceErrors = (exp) => {
    const errors = {
      title: !exp.title || exp.title.trim() === '' ? 'Campo obligatorio' : '',
      project: !exp.project || exp.project.trim() === '' ? 'Campo obligatorio' : '',
      startDate: !exp.startDate ? 'Campo obligatorio' : '',
      endDate: !exp.isCurrent && !exp.endDate ? 'Campo obligatorio' : '',
    };

    // Validar que la fecha "Desde" no sea posterior a la fecha "Hasta"
    if (exp.startDate && exp.endDate && !exp.isCurrent) {
      const startDate = new Date(exp.startDate);
      const endDate = new Date(exp.endDate);
      if (startDate >= endDate) {
        errors.startDate = 'La fecha de inicio debe ser anterior a la fecha de fin';
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    // Validar que la experiencia esté confirmada
    if (isExperienceValid(exp) && !exp.confirmed) {
      errors.confirmation = 'Debes confirmar la experiencia antes de continuar';
    }

    return errors;
  };

  // Función para obtener errores de redes sociales
  const getSocialErrors = (social) => {
    const errors = {
      platform: !social.platform || social.platform.trim() === '' ? 'Campo obligatorio' : '',
      url: !social.url || social.url.trim() === '' ? 'Campo obligatorio' : 
           (social.url && social.url.trim() !== '' && !isValidURL(social.url.trim())) ? 'Ingresá una URL válida' : '',
    };

    // Validar que la red social esté confirmada
    if (isSocialLinkValid(social) && !social.confirmed) {
      errors.confirmation = 'Debes confirmar la red social antes de continuar';
    }

    return errors;
  };

  // Función para obtener errores de educación (igual que experiencia)
  const getEducationErrors = (edu) => {
    const errors = {
      institution: !edu.institution ? 'Campo obligatorio' : '',
      title: !edu.title ? 'Campo obligatorio' : '',
      startDate: !edu.startDate ? 'Campo obligatorio' : '',
      endDate: !edu.isCurrent && !edu.endDate ? 'Campo obligatorio' : '',
    };

    // Validar que la fecha "Desde" no sea posterior a la fecha "Hasta"
    if (edu.startDate && edu.endDate && !edu.isCurrent) {
      const startDate = new Date(edu.startDate);
      const endDate = new Date(edu.endDate);
      if (startDate >= endDate) {
        errors.startDate = 'La fecha de inicio debe ser anterior a la fecha de fin';
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    // Validar que la educación esté confirmada
    if (isEducationValid(edu) && !edu.confirmed) {
      errors.confirmation = 'Debes confirmar la educación antes de continuar';
    }

    return errors;
  };

  // Función para obtener errores de certificaciones (igual que redes sociales)
  const getCertificationErrors = (cert) => {
    const errors = {
      name: !cert.name || cert.name.trim() === '' ? 'Campo obligatorio' : '',
      url: !cert.url || cert.url.trim() === '' ? 'Campo obligatorio' : 
           (cert.url && cert.url.trim() !== '' && !isValidURL(cert.url.trim())) ? 'Ingresá una URL válida' : '',
    };

    // Validar que la certificación esté confirmada
    if (isCertificationValid(cert) && !cert.confirmed) {
      errors.confirmation = 'Debes confirmar la certificación antes de continuar';
    }

    return errors;
  };

  // Función para verificar si una educación es válida
  function isEducationValid(edu) {
    return edu.institution && edu.institution.trim() !== '' && 
           edu.title && edu.title.trim() !== '' && 
           edu.startDate && edu.startDate.trim() !== '' &&
           (edu.isCurrent || (edu.endDate && edu.endDate.trim() !== ''));
  }

  // Función para verificar si una certificación es válida
  function isCertificationValid(cert) {
    return cert.name && cert.name.trim() !== '' && cert.url && cert.url.trim() !== '';
  }

  // Función para verificar si una red social es válida
  function isSocialLinkValid(link) {
    return link.platform && link.platform.trim() !== '' && link.url && link.url.trim() !== '';
  }

  // Handlers de validación en tiempo real
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  // Experiencia y redes sociales UX (con confirmación y deshabilitado)
  function handleAddExperience() {
    setForm(prev => ({ ...prev, experience: [...prev.experience, { title: '', project: '', startDate: '', endDate: '', isCurrent: false, confirmed: false }] }));
    setExpTouched(prev => [...prev, { title: false, project: false, startDate: false, endDate: false }]);
    setExpErrors(prev => [...prev, getExperienceErrors({ title: '', project: '', startDate: '', endDate: '', isCurrent: false })]);
  }

  function handleRemoveExperience(i) {
    setForm(prev => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
    setExpTouched(prev => prev.filter((_, idx) => idx !== i));
    setExpErrors(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleExpChange(i, field, value) {
    const updated = [...form.experience];
    updated[i][field] = value;
    setForm({ ...form, experience: updated });
    
    if (expTouched[i]) {
      const errs = getExperienceErrors(updated[i]);
      setExpErrors(prev => prev.map((e, idx) => idx === i ? errs : e));
    }
  }

  function handleExpBlur(i, field) {
    setExpTouched(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: true } : t));
    const errs = getExperienceErrors(form.experience[i]);
    setExpErrors(prev => prev.map((e, idx) => idx === i ? errs : e));
  }

  function handleConfirmExperience(i) {
    const updated = [...form.experience];
    updated[i].confirmed = true;
    setForm({ ...form, experience: updated });
    
    // Actualizar errores para reflejar que ya está confirmada
    const updatedErrors = [...expErrors];
    updatedErrors[i] = getExperienceErrors(updated[i]);
    setExpErrors(updatedErrors);
    
    // Limpiar error de confirmación si todas las experiencias están confirmadas
    const allConfirmed = updated.every(exp => exp.confirmed);
    if (allConfirmed) {
      setExpConfirmError('');
    }
  }

  function handleEditExperience(i) {
    const updated = [...form.experience];
    updated[i].confirmed = false;
    setForm({ ...form, experience: updated });
  }

  function handleAddSocial() {
    setForm(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: '', url: '', confirmed: false }] }));
    setSocialTouched(prev => [...prev, { platform: false, url: false }]);
    setSocialErrors(prev => [...prev, getSocialErrors({ platform: '', url: '' })]);
  }

  function handleRemoveSocial(i) {
    setForm(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, idx) => idx !== i) }));
    setSocialTouched(prev => prev.filter((_, idx) => idx !== i));
    setSocialErrors(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSocialChange(i, field, value) {
    const updated = [...form.socialLinks];
    updated[i][field] = value;
    setForm({ ...form, socialLinks: updated });
    
    if (socialTouched[i]) {
      const errs = getSocialErrors(updated[i]);
      setSocialErrors(prev => prev.map((e, idx) => idx === i ? errs : e));
    }
  }

  function handleSocialBlur(i, field) {
    setSocialTouched(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: true } : t));
    const errs = getSocialErrors(form.socialLinks[i]);
    setSocialErrors(prev => prev.map((e, idx) => idx === i ? errs : e));
  }

  function handleConfirmSocial(i) {
    const updated = [...form.socialLinks];
    updated[i].confirmed = true;
    setForm({ ...form, socialLinks: updated });
    
    // Actualizar errores para reflejar que ya está confirmada
    const updatedErrors = [...socialErrors];
    updatedErrors[i] = getSocialErrors(updated[i]);
    setSocialErrors(updatedErrors);
    
    // Limpiar error de confirmación si todas las redes sociales están confirmadas
    const allConfirmed = updated.every(link => link.confirmed);
    if (allConfirmed) {
      setSocialConfirmError('');
    }
  }

  function handleEditSocial(i) {
    const updated = [...form.socialLinks];
    updated[i].confirmed = false;
    setForm({ ...form, socialLinks: updated });
  }

  // Funciones para manejo de educación (igual que experiencia)
  function handleAddEducation() {
    setForm(prev => ({ ...prev, education: [...prev.education, { institution: '', title: '', startDate: '', endDate: '', isCurrent: false, confirmed: false }] }));
    setEduTouched(prev => [...prev, { institution: false, title: false, startDate: false, endDate: false }]);
    setEduErrors(prev => [...prev, getEducationErrors({ institution: '', title: '', startDate: '', endDate: '', isCurrent: false })]);
  }

  function handleRemoveEducation(i) {
    setForm(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
    setEduTouched(prev => prev.filter((_, idx) => idx !== i));
    setEduErrors(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleEducationChange(i, field, value) {
    const updated = [...form.education];
    updated[i][field] = value;
    setForm({ ...form, education: updated });
    
    if (eduTouched[i]) {
      const errs = getEducationErrors(updated[i]);
      setEduErrors(prev => prev.map((e, idx) => idx === i ? errs : e));
    }
  }

  function handleEducationBlur(i, field) {
    setEduTouched(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: true } : t));
    const errs = getEducationErrors(form.education[i]);
    setEduErrors(prev => prev.map((e, idx) => idx === i ? errs : e));
  }

  function handleConfirmEducation(i) {
    const updated = [...form.education];
    updated[i].confirmed = true;
    setForm({ ...form, education: updated });
    
    // Actualizar errores para reflejar que ya está confirmada
    const updatedErrors = [...eduErrors];
    updatedErrors[i] = getEducationErrors(updated[i]);
    setEduErrors(updatedErrors);
    
    // Limpiar error de confirmación si todas las educaciones están confirmadas
    const allConfirmed = updated.every(edu => edu.confirmed);
    if (allConfirmed) {
      setEduConfirmError('');
    }
  }

  function handleEditEducation(i) {
    const updated = [...form.education];
    updated[i].confirmed = false;
    setForm({ ...form, education: updated });
  }

  // Funciones para manejo de certificaciones (igual que redes sociales)
  function handleAddCertification() {
    setForm(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', url: '', confirmed: false }] }));
    setCertTouched(prev => [...prev, { name: false, url: false }]);
    setCertErrors(prev => [...prev, getCertificationErrors({ name: '', url: '' })]);
  }

  function handleRemoveCertification(i) {
    setForm(prev => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));
    setCertTouched(prev => prev.filter((_, idx) => idx !== i));
    setCertErrors(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleCertificationChange(i, field, value) {
    const updated = [...form.certifications];
    updated[i][field] = value;
    setForm({ ...form, certifications: updated });
    
    if (certTouched[i]) {
      const errs = getCertificationErrors(updated[i]);
      setCertErrors(prev => prev.map((e, idx) => idx === i ? errs : e));
    }
  }

  function handleCertificationBlur(i, field) {
    setCertTouched(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: true } : t));
    const errs = getCertificationErrors(form.certifications[i]);
    setCertErrors(prev => prev.map((e, idx) => idx === i ? errs : e));
  }

  function handleConfirmCertification(i) {
    const updated = [...form.certifications];
    updated[i].confirmed = true;
    setForm({ ...form, certifications: updated });
    
    // Actualizar errores para reflejar que ya está confirmada
    const updatedErrors = [...certErrors];
    updatedErrors[i] = getCertificationErrors(updated[i]);
    setCertErrors(updatedErrors);
    
    // Limpiar error de confirmación si todas las certificaciones están confirmadas
    const allConfirmed = updated.every(cert => cert.confirmed);
    if (allConfirmed) {
      setCertConfirmError('');
    }
  }

  function handleEditCertification(i) {
    const updated = [...form.certifications];
    updated[i].confirmed = false;
    setForm({ ...form, certifications: updated });
  }

  // Manejo de cambios en campos con validación en tiempo real
  function handleChangeEvent(e) {
    const { name, value } = e.target;
    handleChange(name, value);
  }

  // Manejo específico del teléfono con validación
  const handlePhoneChange = (e) => {
    const { value } = e.target;
    // Permitir solo números, espacios, guiones y paréntesis
    const cleaned = value.replace(/[^\d\s\-\(\)\+]/g, '');
    handleChange('phoneNumber', cleaned);
  };

  const handlePhoneBlur = () => {
    handleBlur('phoneNumber');
  };

  function handleImageChange(e, field) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImgErrors(prev => ({ ...prev, [field]: 'La imagen no puede superar los 5MB' }));
        setForm(prev => ({ ...prev, [field]: null }));
        // Limpiar el input file si hay error
        if (field === 'profilePicture' && profilePicRef.current) {
          profilePicRef.current.value = '';
        }
        if (field === 'coverPicture' && coverPicRef.current) {
          coverPicRef.current.value = '';
        }
        return;
      }
      // Limpiar error si el archivo es válido
      setImgErrors(prev => ({ ...prev, [field]: '' }));
      setForm(prev => ({ ...prev, [field]: file }));
    } else {
      // Si no hay archivo seleccionado
      setImgErrors(prev => ({ ...prev, [field]: '' }));
      setForm(prev => ({ ...prev, [field]: null }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validar todos los campos requeridos
    const newTouched = { ...touched };
    const newErrors = { ...errors };
    let hasError = false;
    let firstErrorField = null;
    
    requiredFields.forEach(f => {
      newTouched[f.name] = true;
      const err = validateField(f.name, form[f.name]);
      newErrors[f.name] = err;
      if (err && !firstErrorField) {
        firstErrorField = f.name;
        hasError = true;
      } else if (err) {
        hasError = true;
      }
    });
    
    // Validar campos opcionales que tengan valor
    if (form.phoneNumber) {
      newTouched.phoneNumber = true;
      const phoneErr = validateField('phoneNumber', form.phoneNumber);
      newErrors.phoneNumber = phoneErr;
      if (phoneErr && !firstErrorField) {
        firstErrorField = 'phoneNumber';
        hasError = true;
      } else if (phoneErr) {
        hasError = true;
      }
    }
    
    // Validación de errores de imágenes
    if (imgErrors.profilePicture || imgErrors.coverPicture) {
      hasError = true;
    }
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    // Validar todas las experiencias (igual que crear perfil)
    const newExpTouched = form.experience.map(() => ({ title: true, project: true, startDate: true, endDate: true, confirmation: true }));
    const newExpErrors = form.experience.map(getExperienceErrors);
    let expHasError = false;
    let firstExpErrorIndex = null;
    form.experience.forEach((exp, i) => {
      const errs = getExperienceErrors(exp);
      // Si hay cualquier error (campos faltantes o no confirmada)
      if (errs.title || errs.project || errs.startDate || errs.endDate || errs.confirmation) {
        expHasError = true;
        if (firstExpErrorIndex === null) {
          firstExpErrorIndex = i;
        }
      }
    });
    setExpTouched(newExpTouched);
    setExpErrors(newExpErrors);
    
    // Validar todas las redes sociales (igual que crear perfil)
    const newSocialTouched = form.socialLinks.map(() => ({ platform: true, url: true, confirmation: true }));
    const newSocialErrors = form.socialLinks.map(getSocialErrors);
    let socialHasError = false;
    let firstSocialErrorIndex = null;
    form.socialLinks.forEach((social, i) => {
      const errs = getSocialErrors(social);
      // Si hay cualquier error (campos faltantes o no confirmada)
      if (errs.platform || errs.url || errs.confirmation) {
        socialHasError = true;
        if (firstSocialErrorIndex === null) {
          firstSocialErrorIndex = i;
        }
      }
    });
    setSocialTouched(newSocialTouched);
    setSocialErrors(newSocialErrors);
    
    // Validar todas las educaciones (igual que experiencias)
    const newEduTouched = form.education.map(() => ({ institution: true, title: true, startDate: true, endDate: true, confirmation: true }));
    const newEduErrors = form.education.map(getEducationErrors);
    let eduHasError = false;
    let firstEduErrorIndex = null;
    form.education.forEach((edu, i) => {
      const errs = getEducationErrors(edu);
      // Si hay cualquier error (campos faltantes o no confirmada)
      if (errs.institution || errs.title || errs.startDate || errs.endDate || errs.confirmation) {
        eduHasError = true;
        if (firstEduErrorIndex === null) {
          firstEduErrorIndex = i;
        }
      }
    });
    setEduTouched(newEduTouched);
    setEduErrors(newEduErrors);

    // Validar todas las certificaciones (igual que redes sociales)
    const newCertTouched = form.certifications.map(() => ({ name: true, url: true, confirmation: true }));
    const newCertErrors = form.certifications.map(getCertificationErrors);
    let certHasError = false;
    let firstCertErrorIndex = null;
    form.certifications.forEach((cert, i) => {
      const errs = getCertificationErrors(cert);
      // Si hay cualquier error (campos faltantes o no confirmada)
      if (errs.name || errs.url || errs.confirmation) {
        certHasError = true;
        if (firstCertErrorIndex === null) {
          firstCertErrorIndex = i;
        }
      }
    });
    setCertTouched(newCertTouched);
    setCertErrors(newCertErrors);
    
    // Configurar mensajes de error específicos por sección
    if (expHasError) {
      setExpConfirmError("Para continuar debes confirmar la experiencia");
    } else {
      setExpConfirmError('');
    }
    
    if (socialHasError) {
      setSocialConfirmError("Para continuar debes confirmar la red social");
    } else {
      setSocialConfirmError('');
    }

    if (eduHasError) {
      setEduConfirmError("Para continuar debes confirmar la educación");
    } else {
      setEduConfirmError('');
    }

    if (certHasError) {
      setCertConfirmError("Para continuar debes confirmar la certificación");
    } else {
      setCertConfirmError('');
    }
    
    // Si hay errores, hacer scroll al primer error y detener el submit
    if (hasError || expHasError || socialHasError || eduHasError || certHasError) {
      setIsSubmitting(false);
      
      // Scroll al primer error después de que el estado se actualice
      setTimeout(() => {
        if (firstErrorField) {
          // Buscar el campo de error en el DOM
          const errorElement = document.querySelector(`input[name="${firstErrorField}"], select[name="${firstErrorField}"], textarea[name="${firstErrorField}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorElement.focus();
          }
        } else if (firstExpErrorIndex !== null) {
          // Buscar la primera experiencia con error
          const expElements = document.querySelectorAll('[data-experience-index]');
          const expElement = Array.from(expElements).find(el => 
            el.getAttribute('data-experience-index') === firstExpErrorIndex.toString()
          );
          if (expElement) {
            expElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (firstSocialErrorIndex !== null) {
          // Buscar la primera red social con error
          const socialElements = document.querySelectorAll('[data-social-index]');
          const socialElement = Array.from(socialElements).find(el => 
            el.getAttribute('data-social-index') === firstSocialErrorIndex.toString()
          );
          if (socialElement) {
            socialElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (firstEduErrorIndex !== null) {
          // Buscar la primera educación con error
          const eduElements = document.querySelectorAll('[data-education-index]');
          const eduElement = Array.from(eduElements).find(el => 
            el.getAttribute('data-education-index') === firstEduErrorIndex.toString()
          );
          if (eduElement) {
            eduElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (firstCertErrorIndex !== null) {
          // Buscar la primera certificación con error
          const certElements = document.querySelectorAll('[data-certification-index]');
          const certElement = Array.from(certElements).find(el => 
            el.getAttribute('data-certification-index') === firstCertErrorIndex.toString()
          );
          if (certElement) {
            certElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
      
      return;
    }
    
    onSubmit(form);
  }

  const { user: authUser } = useAuth();

  return (
    <div className="min-h-screen bg-conexia-soft">
      <div className="w-full max-w-5xl mx-auto px-4 mt-4">
        <form onSubmit={handleSubmit} noValidate className="space-y-6 bg-white p-6 rounded shadow">  
          {/* Imágenes - Ahora al comienzo */}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-conexia-green mb-1">Foto de perfil</label>

                {/* Imagen actual */}
                {user.profilePicture && !form.profilePicture && (
                  <div className="mb-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-4 border-white shadow-md">
                      <Image
                        src={`${config.IMAGE_URL}/${user.profilePicture}`}
                        alt="Foto de perfil actual"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Nueva imagen seleccionada */}
                {form.profilePicture && (
                  <div className="mb-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-4 border-white shadow-md">
                      <img
                        src={URL.createObjectURL(form.profilePicture)}
                        alt="Vista previa perfil"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col items-start">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={profilePicRef}
                  onChange={e => handleImageChange(e, 'profilePicture')}
                  className="w-full mb-2"
                  style={{ color: 'transparent' }}
                />
                {form.profilePicture && (
                  <button
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, profilePicture: null })); if (profilePicRef.current) profilePicRef.current.value = ''; }}
                    className="text-red-500 text-xs hover:underline mb-1"
                  >
                    Eliminar
                  </button>
                )}
                {form.profilePicture && (
                  <span className="text-xs text-gray-700 mb-1">{form.profilePicture.name}</span>
                )}
                {imgErrors.profilePicture && <p className="text-xs text-red-600 mt-1">{imgErrors.profilePicture}</p>}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-conexia-green mb-1">Foto de portada</label>

                {/* Imagen actual */}
                {user.coverPicture && !form.coverPicture && (
                  <div className="mb-3">
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border-4 border-white shadow-md">
                      <Image
                        src={`${config.IMAGE_URL}/${user.coverPicture}`}
                        alt="Foto de portada actual"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Nueva imagen seleccionada */}
                {form.coverPicture && (
                  <div className="mb-3">
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border-4 border-white shadow-md">
                      <img
                        src={URL.createObjectURL(form.coverPicture)}
                        alt="Vista previa portada"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col items-start">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={coverPicRef}
                  onChange={e => handleImageChange(e, 'coverPicture')}
                  className="w-full mb-2"
                  style={{ color: 'transparent' }}
                />
                {form.coverPicture && (
                  <button
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, coverPicture: null })); if (coverPicRef.current) coverPicRef.current.value = ''; }}
                    className="text-red-500 text-xs hover:underline mb-1"
                  >
                    Eliminar
                  </button>
                )}
                {form.coverPicture && (
                  <span className="text-xs text-gray-700 mb-1">{form.coverPicture.name}</span>
                )}
                {imgErrors.coverPicture && <p className="text-xs text-red-600 mt-1">{imgErrors.coverPicture}</p>}
              </div>
            </div>
          </div>

          {/* Datos personales */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Nombre</label>
              <InputField 
                name="name" 
                value={form.name} 
                onChange={handleChangeEvent} 
                onBlur={() => handleBlur('name')}
                error={touched.name && errors.name} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Apellido</label>
              <InputField 
                name="lastName" 
                value={form.lastName} 
                onChange={handleChangeEvent} 
                onBlur={() => handleBlur('lastName')}
                error={touched.lastName && errors.lastName} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">País</label>
              <InputField 
                name="country" 
                value={form.country} 
                onChange={handleChangeEvent} 
                onBlur={() => handleBlur('country')}
                error={touched.country && errors.country} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Localidad</label>
              <InputField 
                name="state" 
                value={form.state} 
                onChange={handleChangeEvent} 
                onBlur={() => handleBlur('state')}
                error={touched.state && errors.state} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Teléfono</label>
              <InputField 
                name="phoneNumber" 
                value={form.phoneNumber} 
                onChange={handlePhoneChange} 
                onBlur={handlePhoneBlur}
                error={touched.phoneNumber && errors.phoneNumber} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Profesión</label>
              <InputField 
                name="profession" 
                value={form.profession} 
                onChange={handleChangeEvent} 
                onBlur={() => handleBlur('profession')}
                error={touched.profession && errors.profession} 
              />
            </div>
            <div className="md:col-span-2 mb-2">
              <label className="block text-sm font-medium text-conexia-green mb-1">Descripción</label>
              <TextArea 
                name="description" 
                value={form.description} 
                onChange={handleChangeEvent} 
                multiline 
                rows={4} 
                className="w-full min-h-[96px]" 
              />
            </div>
          </div>
          
          {/* Habilidades */}
          <div className="-mt-6">
            <label className="block font-medium text-conexia-green mb-1">Habilidades</label>
            <SkillsSelector
              selectedSkills={form.skills}
              onSkillsChange={(newSkills) => setForm(prev => ({ ...prev, skills: newSkills }))}
              maxSkills={20}
            />
          </div>
          
          {/* Experiencia */}
          <div>
            <h4 className="font-semibold text-conexia-green">Experiencia</h4>
            {form.experience.length === 0 && (
              <button type="button" onClick={handleAddExperience} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar experiencia</button>
            )}
            {form.experience.map((exp, i) => (
              <div key={i} className="grid gap-2 mt-2 border-b pb-4" data-experience-index={i}>
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-conexia-green mb-1">Título</label>
                    <InputField 
                      value={exp.title} 
                      onChange={e => handleExpChange(i, 'title', e.target.value)} 
                      onBlur={() => handleExpBlur(i, 'title')}
                      error={expTouched[i]?.title && expErrors[i]?.title}
                      disabled={exp.confirmed} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-conexia-green mb-1">Proyecto</label>
                    <InputField 
                      value={exp.project} 
                      onChange={e => handleExpChange(i, 'project', e.target.value)} 
                      onBlur={() => handleExpBlur(i, 'project')}
                      error={expTouched[i]?.project && expErrors[i]?.project}
                      disabled={exp.confirmed} 
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-2 items-end">
                  <div className="flex flex-col min-h-[80px]">
                    <label className="text-sm text-conexia-green mb-1">Desde</label>      
                    <input 
                      type="date" 
                      className={`border rounded p-2 ${expTouched[i]?.startDate && expErrors[i]?.startDate ? 'border-red-500 ring-red-300' : ''}`}
                      value={exp.startDate} 
                      onChange={e => handleExpChange(i, 'startDate', e.target.value)} 
                      onBlur={() => handleExpBlur(i, 'startDate')}
                      onKeyDown={e => e.preventDefault()}
                      min={form.birthDate ? getNextDay(form.birthDate) : undefined}
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="dd/mm/aaaa"
                      disabled={exp.confirmed} 
                    />
                    <div style={{ minHeight: 20 }}>
                      {expTouched[i]?.startDate && expErrors[i]?.startDate && <p className="text-xs text-red-600 mt-1 text-left">{expErrors[i].startDate}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col min-h-[80px]">
                    <label className="text-sm text-conexia-green mb-1">Hasta</label>      
                    <input 
                      type="date" 
                      className={`border rounded p-2 ${expTouched[i]?.endDate && expErrors[i]?.endDate ? 'border-red-500 ring-red-300' : ''}`}
                      value={exp.endDate} 
                      onChange={e => handleExpChange(i, 'endDate', e.target.value)} 
                      onBlur={() => handleExpBlur(i, 'endDate')}
                      disabled={exp.isCurrent || exp.confirmed} 
                      onKeyDown={e => e.preventDefault()}
                      min={exp.isCurrent ? undefined : (exp.startDate ? getNextDay(exp.startDate) : undefined)}
                      max={exp.isCurrent ? undefined : new Date().toISOString().split('T')[0]}
                      placeholder={exp.isCurrent ? "dd/mm/yyyy" : "dd/mm/aaaa"}
                    />
                    <div style={{ minHeight: 20 }}>
                      {expTouched[i]?.endDate && expErrors[i]?.endDate && <p className="text-xs text-red-600 mt-1 text-left">{expErrors[i].endDate}</p>}
                    </div>
                  </div>
                  <label className="text-sm text-conexia-green mb-1 flex items-center gap-2">
                    <input type="checkbox" checked={exp.isCurrent} onChange={e => handleExpChange(i, 'isCurrent', e.target.checked)} disabled={exp.confirmed} />Actualmente trabajo aquí
                  </label>
                </div>
                {!exp.confirmed && expConfirmError && isExperienceValid(exp) && <p className="text-xs text-red-600 mt-1 mb-4">Para continuar debes confirmar la experiencia</p>}
                <div className="flex justify-end gap-2 items-end">
                  <button
                    type="button"
                    className={`w-6 h-6 flex items-center justify-center rounded ${exp.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!exp.confirmed && !isExperienceValid(exp) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={exp.confirmed || !isExperienceValid(exp)}
                    onClick={() => handleConfirmExperience(i)}
                    title="Confirmar experiencia"
                    style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${exp.confirmed ? 'text-green-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  {exp.confirmed && (
                    <button
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => handleEditExperience(i)}
                      title="Editar experiencia"
                      style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(i)}
                    className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center"
                    title="Eliminar"
                    style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {form.experience.length > 0 && (
              <button type="button" onClick={handleAddExperience} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar experiencia</button>
            )}
          </div>

          {/* Educación */}
          <div>
            <h4 className="font-semibold text-conexia-green">Educación</h4>
            {form.education.length === 0 && (
              <button type="button" onClick={handleAddEducation} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar educación</button>
            )}
            {form.education.map((edu, i) => (
              <div key={i} className="grid gap-2 mt-2 border-b pb-4" data-education-index={i}>
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-conexia-green mb-1">Institución</label>
                    <InputField 
                      value={edu.institution} 
                      onChange={e => handleEducationChange(i, 'institution', e.target.value)} 
                      onBlur={() => handleEducationBlur(i, 'institution')}
                      error={eduTouched[i]?.institution && eduErrors[i]?.institution}
                      disabled={edu.confirmed} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-conexia-green mb-1">Título</label>
                    <InputField 
                      value={edu.title} 
                      onChange={e => handleEducationChange(i, 'title', e.target.value)} 
                      onBlur={() => handleEducationBlur(i, 'title')}
                      error={eduTouched[i]?.title && eduErrors[i]?.title}
                      disabled={edu.confirmed} 
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-2 items-end">
                  <div className="flex flex-col min-h-[80px]">
                    <label className="text-sm text-conexia-green mb-1">Desde</label>      
                    <input 
                      type="date" 
                      className={`border rounded p-2 ${eduTouched[i]?.startDate && eduErrors[i]?.startDate ? 'border-red-500 ring-red-300' : ''}`}
                      value={edu.startDate} 
                      onChange={e => handleEducationChange(i, 'startDate', e.target.value)} 
                      onBlur={() => handleEducationBlur(i, 'startDate')}
                      onKeyDown={e => e.preventDefault()}
                      min={form.birthDate ? getNextDay(form.birthDate) : undefined}
                      max={new Date().toISOString().split('T')[0]}
                      placeholder="dd/mm/aaaa"
                      disabled={edu.confirmed} 
                    />
                    <div style={{ minHeight: 20 }}>
                      {eduTouched[i]?.startDate && eduErrors[i]?.startDate && <p className="text-xs text-red-600 mt-1 text-left">{eduErrors[i].startDate}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col min-h-[80px]">
                    <label className="text-sm text-conexia-green mb-1">Hasta</label>      
                    <input 
                      type="date" 
                      className={`border rounded p-2 ${eduTouched[i]?.endDate && eduErrors[i]?.endDate ? 'border-red-500 ring-red-300' : ''}`}
                      value={edu.endDate} 
                      onChange={e => handleEducationChange(i, 'endDate', e.target.value)} 
                      onBlur={() => handleEducationBlur(i, 'endDate')}
                      disabled={edu.isCurrent || edu.confirmed} 
                      onKeyDown={e => e.preventDefault()}
                      min={edu.isCurrent ? undefined : (edu.startDate ? getNextDay(edu.startDate) : undefined)}
                      max={edu.isCurrent ? undefined : new Date().toISOString().split('T')[0]}
                      placeholder={edu.isCurrent ? "dd/mm/yyyy" : "dd/mm/aaaa"}
                    />
                    <div style={{ minHeight: 20 }}>
                      {eduTouched[i]?.endDate && eduErrors[i]?.endDate && <p className="text-xs text-red-600 mt-1 text-left">{eduErrors[i].endDate}</p>}
                    </div>
                  </div>
                  <label className="text-sm text-conexia-green mb-1 flex items-center gap-2">
                    <input type="checkbox" checked={edu.isCurrent} onChange={e => handleEducationChange(i, 'isCurrent', e.target.checked)} disabled={edu.confirmed} />Actualmente estudio aquí
                  </label>
                </div>
                {!edu.confirmed && eduConfirmError && isEducationValid(edu) && <p className="text-xs text-red-600 mt-1 mb-4">Para continuar debes confirmar la educación</p>}
                <div className="flex justify-end gap-2 items-end">
                  <button
                    type="button"
                    className={`w-6 h-6 flex items-center justify-center rounded ${edu.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!edu.confirmed && !isEducationValid(edu) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={edu.confirmed || !isEducationValid(edu)}
                    onClick={() => handleConfirmEducation(i)}
                    title="Confirmar educación"
                    style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${edu.confirmed ? 'text-green-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  {edu.confirmed && (
                    <button
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => handleEditEducation(i)}
                      title="Editar educación"
                      style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(i)}
                    className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center"
                    title="Eliminar"
                    style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {form.education.length > 0 && (
              <button type="button" onClick={handleAddEducation} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar educación</button>
            )}
          </div>

          {/* Certificaciones */}
          <div>
            <h4 className="font-semibold text-conexia-green">Certificaciones</h4>
            {form.certifications.length === 0 && (
              <button type="button" onClick={handleAddCertification} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar certificación</button>
            )}
            {form.certifications.map((cert, i) => (
              <div key={i} className="mt-2" data-certification-index={i}>
                <div className="grid md:grid-cols-3 gap-2 items-center">       
                  <div className="flex flex-col items-start h-full">
                    <label className="block font-semibold text-conexia-green text-sm mb-0">Nombre</label>
                    <InputField 
                      value={cert.name} 
                      onChange={e => handleCertificationChange(i, 'name', e.target.value)} 
                      onBlur={() => handleCertificationBlur(i, 'name')}
                      error={certTouched[i]?.name && certErrors[i]?.name}
                      disabled={cert.confirmed} 
                    />
                  </div>
                  <div className="flex flex-col items-start h-full">
                    <label className="block font-semibold text-conexia-green text-sm mb-0">URL</label>
                    <InputField 
                      value={cert.url} 
                      onChange={e => handleCertificationChange(i, 'url', e.target.value)} 
                      onBlur={() => handleCertificationBlur(i, 'url')}
                      error={certTouched[i]?.url && certErrors[i]?.url}
                      disabled={cert.confirmed} 
                    />
                  </div>
                  <div className="flex flex-row justify-end items-center gap-2 h-full">     
                    <button
                      type="button"
                      className={`w-6 h-6 flex items-center justify-center rounded ${cert.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!cert.confirmed && !isCertificationValid(cert) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={cert.confirmed || !isCertificationValid(cert)}
                      onClick={() => handleConfirmCertification(i)}
                      title="Confirmar certificación"
                      style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${cert.confirmed ? 'text-green-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    {cert.confirmed && (
                      <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => handleEditCertification(i)}
                        title="Editar certificación"
                        style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(i)}
                      className="w-6 h-6 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                      title="Eliminar"
                      style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {!cert.confirmed && certConfirmError && isCertificationValid(cert) && <p className="text-xs text-red-600 mt-0">Para continuar debes confirmar la certificación</p>}
              </div>
            ))}
            {form.certifications.length > 0 && (
              <button type="button" onClick={handleAddCertification} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar certificación</button>
            )}
          </div>
          
          {/* Redes Sociales */}
          <div>
            <h4 className="font-semibold text-conexia-green">Redes Sociales</h4>
            {form.socialLinks.length === 0 && (
              <button type="button" onClick={handleAddSocial} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar red social</button>
            )}
            {form.socialLinks.map((link, i) => (
              <div key={i} className="mt-2" data-social-index={i}>
                <div className="grid md:grid-cols-3 gap-2 items-center">       
                  <div className="flex flex-col items-start h-full">
                    <label className="block font-semibold text-conexia-green text-sm mb-0">Plataforma</label>
                    <select
                      value={link.platform}
                      onChange={e => handleSocialChange(i, 'platform', e.target.value)}
                      onBlur={() => handleSocialBlur(i, 'platform')}
                      className={`border p-2 rounded w-full h-[42px] ${socialTouched[i]?.platform && socialErrors[i]?.platform ? 'border-red-500 ring-red-300' : ''}`}
                      disabled={link.confirmed}
                    >
                      <option value="">Seleccionar plataforma</option>
                      {plataformas.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {socialTouched[i]?.platform && socialErrors[i]?.platform && <p className="text-xs text-red-600 mt-1 text-left">{socialErrors[i].platform}</p>}
                  </div>
                  <div className="flex flex-col items-start h-full">
                    <label className="block font-semibold text-conexia-green text-sm mb-0">URL</label>
                    <InputField 
                      value={link.url} 
                      onChange={e => handleSocialChange(i, 'url', e.target.value)} 
                      onBlur={() => handleSocialBlur(i, 'url')}
                      error={socialTouched[i]?.url && socialErrors[i]?.url}
                      disabled={link.confirmed} 
                    />
                  </div>
                  <div className="flex flex-row justify-end items-center gap-2 h-full">     
                    <button
                      type="button"
                      className={`w-6 h-6 flex items-center justify-center rounded ${link.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!link.confirmed && !isSocialLinkValid(link) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={link.confirmed || !isSocialLinkValid(link)}
                      onClick={() => handleConfirmSocial(i)}
                      title="Confirmar red"
                      style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${link.confirmed ? 'text-green-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    {link.confirmed && (
                      <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => handleEditSocial(i)}
                        title="Editar red social"
                        style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSocial(i)}
                      className="w-6 h-6 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                      title="Eliminar"
                      style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {!link.confirmed && socialConfirmError && isSocialLinkValid(link) && <p className="text-xs text-red-600 mt-0">Para continuar debes confirmar la red social</p>}
              </div>
            ))}
            {form.socialLinks.length > 0 && (
              <button type="button" onClick={handleAddSocial} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar red social</button>
            )}
          </div>
          
          {isEditing && (
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button 
                type="submit" 
                className="w-full md:w-auto bg-conexia-green text-white py-2 px-8 rounded font-semibold hover:bg-conexia-green/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar cambios'}
              </button>   
              <button
                type="button"
                className="w-full md:w-auto bg-[#ff4d58] text-white py-2 px-8 rounded font-semibold hover:bg-red-500"
                style={{ minWidth: '120px' }}
                onClick={() => {
                  if (onCancel) {
                    // Si hay una función onCancel, usarla
                    onCancel();
                  } else {
                    // Fallback: navegar directamente
                    try {
                      router.replace(`/profile/${user.id}`);
                    } catch (error) {
                      console.error('Error al navegar:', error);
                      window.location.href = `/profile/${user.id}`;
                    }
                  }
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
      {/* Margen inferior verde */}
      <div className="bg-conexia-soft w-full pb-16 md:pb-4" style={{ height: 20 }}></div> 
    </div>
  );
}

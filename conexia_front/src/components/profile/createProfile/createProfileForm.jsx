// app/create-profile/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { getDocumentTypes } from "@/service/profiles/profilesFetch";
import { handleDynamicFieldChange, validateDynamicField } from "@/components/utils/validations/addElement";
import { removeItemFromFormArray } from "@/components/utils/removeItemArray";
import ConexiaLogo from "@/components/ui/ConexiaLogo";
import { toggleHabilidad } from "@/components/utils/toggleHabilidad";
import { useAuth } from "@/context/AuthContext";
import { isValidURL } from "@/components/utils/validations/urls";

import InputField from "@/components/form/InputField";
import TextArea from "@/components/form/InputField";
import { handleSubmitProfile } from "@/components/utils/handlers";
import RubroSkillsSelector from "@/components/skills/RubroSkillsSelector";
import PhoneInput from "@/components/form/PhoneInput";
import DateInput from "@/components/form/DateInput";



export default function CreateProfileForm() {
  // Refs para los inputs de imagen
  const profilePicRef = useRef(null);
  const coverPicRef = useRef(null);
  const router = useRouter();
  const { updateUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    birthDate: null,
    documentTypeId: "",
    documentNumber: "",
    areaCode: "",
    phoneNumber: "",
    country: "",
    state: "",
    profession: "",
    profilePicture: null,
    coverPicture: null,
    skills: [],
    description: "",
    experience: [],
    socialLinks: [],
    education: [],
    certifications: [],
  });

  const [errors, setErrors] = useState({});
  const [imgErrors, setImgErrors] = useState({ profilePicture: '', coverPicture: '' });
  // Validación y manejo de imágenes
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

  function handleRemoveImage(field) {
    setForm(prev => ({ ...prev, [field]: null }));
    setImgErrors(prev => ({ ...prev, [field]: '' }));
    // Limpiar el input file visualmente
    if (field === 'profilePicture' && profilePicRef.current) {
      profilePicRef.current.value = '';
    }
    if (field === 'coverPicture' && coverPicRef.current) {
      coverPicRef.current.value = '';
    }
  }
  const [touched, setTouched] = useState({});
  const [msg, setMsg] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const habilidadesDisponibles = ["Frontend", "Backend", "UX/UI", "DevOps", "Marketing", "Otra"];
  const plataformas = ["LinkedIn", "GitHub", "Twitter", "Portfolio", "Otro"];
  const [expTouched, setExpTouched] = useState([]);
  const [expErrors, setExpErrors] = useState([]);
  const [socialTouched, setSocialTouched] = useState([]);
  const [socialErrors, setSocialErrors] = useState([]);
  const [eduTouched, setEduTouched] = useState([]);
  const [eduErrors, setEduErrors] = useState([]);
  const [certTouched, setCertTouched] = useState([]);
  const [certErrors, setCertErrors] = useState([]);

  // Efecto para manejar errores específicos de campos desde el backend
  useEffect(() => {
    if (msg && !msg.ok && typeof msg.text === 'string') {
      // Manejar múltiples campos
      if (msg.fields && Array.isArray(msg.fields)) {
        const newErrors = { ...errors };
        const newTouched = { ...touched };
        
        msg.fields.forEach(fieldName => {
          newErrors[fieldName] = msg.text;
          newTouched[fieldName] = true;
        });
        
        setErrors(newErrors);
        setTouched(newTouched);
        
        // Hacer scroll al primer campo con error
        setTimeout(() => {
          const firstField = msg.fields[0];
          const errorElement = document.querySelector(`input[name="${firstField}"], select[name="${firstField}"], textarea[name="${firstField}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorElement.focus();
          }
        }, 200);
      }
      // Manejar campo único (mantener compatibilidad)
      else if (msg.field) {
        setErrors(prev => ({
          ...prev,
          [msg.field]: msg.text
        }));
        setTouched(prev => ({
          ...prev,
          [msg.field]: true
        }));
        
        // Hacer scroll al campo con error después de que se actualice el estado
        setTimeout(() => {
          const errorElement = document.querySelector(`input[name="${msg.field}"], select[name="${msg.field}"], textarea[name="${msg.field}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorElement.focus();
          }
        }, 200);
      }
    }
  }, [msg]);
  

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const tipo = await getDocumentTypes();
        setDocumentTypes(tipo.data);
      } catch (error) {
        console.error("Error al cargar tipos de documento", error);
      }
    };

    fetchDocs();
  }, []);

  // Validación de campos obligatorios
  const requiredFields = [
    { name: "name", label: "Nombre" },
    { name: "lastName", label: "Apellido" },
    { name: "birthDate", label: "Fecha de nacimiento" },
    { name: "documentTypeId", label: "Tipo de documento" },
    { name: "documentNumber", label: "Número de documento" },
    { name: "profession", label: "Profesión" },
  ];

  const validateField = (field, value) => {
    if (requiredFields.some(f => f.name === field)) {
      // Para birthDate (Date object), verificar si existe
      if (field === "birthDate") {
        if (!value) {
          return "Este campo es obligatorio";
        }
      } else {
        // Para otros campos (strings), usar trim
        if (!value || value.trim() === "") {
          return "Este campo es obligatorio";
        }
      }
    }
    
    // Validación de número de documento según el tipo
    if (field === "documentNumber" && value && form.documentTypeId) {
      const docType = parseInt(form.documentTypeId);
      const docNumber = value.trim();
      
      if (docType === 1) {
        // DNI: 7-8 dígitos numéricos
        if (!/^\d{7,8}$/.test(docNumber)) {
          return "El DNI debe tener 7 u 8 dígitos";
        }
      } else if (docType === 3) {
        // Pasaporte: 6-9 caracteres alfanuméricos
        if (!/^[A-Z0-9]{6,9}$/i.test(docNumber)) {
          return "El pasaporte debe tener entre 6 y 9 caracteres alfanuméricos";
        }
      }
    }
    
    // Validación de mayor de 18 años para fecha de nacimiento
    if (field === "birthDate" && value) {
      const birth = value instanceof Date ? value : new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      const day = today.getDate() - birth.getDate();
      let is18 = age > 18 || (age === 18 && (m > 0 || (m === 0 && day >= 0)));
      if (!is18) {
        return "Debes ser mayor de 18 años";
      }
    }
    return "";
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Si se cambia el tipo de documento, revalidar el número de documento
    if (field === "documentTypeId" && form.documentNumber) {
      if (touched.documentNumber) {
        setErrors((prev) => ({ 
          ...prev, 
          documentNumber: validateField("documentNumber", form.documentNumber) 
        }));
      }
    }
    
    // Limpiar errores del backend cuando el usuario empiece a escribir
    if (msg && !msg.ok) {
      // Si es un error de campo único
      if (msg.field === field) {
        setMsg(null);
      }
      // Si es un error de múltiples campos y el campo actual está en la lista
      else if (msg.fields && msg.fields.includes(field)) {
        setMsg(null);
      }
    }
    
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  // Funciones específicas para el teléfono
  const validateAreaCode = (value) => {
    if (!value || value.trim() === "") {
      return ""; // Opcional
    }
    if (!/^\+\d{1,4}$/.test(value.trim())) {
      return "Formato: +XX (ejemplo: +54)";
    }
    return "";
  };

  const validatePhoneNumber = (value) => {
    if (!value || value.trim() === "") {
      return ""; // Opcional
    }
    if (!/^[0-9]{6,15}$/.test(value.trim())) {
      return "Debe tener entre 6 y 15 dígitos";
    }
    return "";
  };

  const handleAreaCodeChange = (value) => {
    setForm((prev) => ({ ...prev, areaCode: value }));
    if (touched.areaCode && value && value.trim() !== "") {
      setErrors((prev) => ({ 
        ...prev, 
        areaCode: validateAreaCode(value)
      }));
    } else if (touched.areaCode && (!value || value.trim() === "")) {
      setErrors((prev) => ({ ...prev, areaCode: "" }));
    }
  };

  const handleAreaCodeBlur = () => {
    setTouched((prev) => ({ ...prev, areaCode: true }));
    if (form.areaCode && form.areaCode.trim() !== "") {
      setErrors((prev) => ({ 
        ...prev, 
        areaCode: validateAreaCode(form.areaCode)
      }));
    } else {
      setErrors((prev) => ({ ...prev, areaCode: "" }));
    }
  };

  const handlePhoneChange = (value) => {
    // Solo permitir dígitos
    const digitsOnly = value.replace(/\D/g, '');
    setForm((prev) => ({ ...prev, phoneNumber: digitsOnly }));
    if (touched.phoneNumber && digitsOnly && digitsOnly.trim() !== "") {
      setErrors((prev) => ({ 
        ...prev, 
        phoneNumber: validatePhoneNumber(digitsOnly)
      }));
    } else if (touched.phoneNumber && (!digitsOnly || digitsOnly.trim() === "")) {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phoneNumber: true }));
    if (form.phoneNumber && form.phoneNumber.trim() !== "") {
      setErrors((prev) => ({ 
        ...prev, 
        phoneNumber: validatePhoneNumber(form.phoneNumber)
      }));
    } else {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };
  function isExperienceValid(exp) {
    return (
      exp.title && exp.title.trim() !== '' &&
      exp.project && exp.project.trim() !== '' &&
      exp.startDate &&
      (exp.isCurrent || exp.endDate)
    );
  }

  function getExperienceErrors(exp) {
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
  }

  function isSocialLinkValid(link) {
    return link.platform && link.platform.trim() !== '' && link.url && link.url.trim() !== '';
  }

  function getSocialErrors(link) {
    const errors = {
      platform: !link.platform || link.platform.trim() === '' ? 'Campo obligatorio' : '',
      url: !link.url || link.url.trim() === '' ? 'Campo obligatorio' : 
           (link.url && link.url.trim() !== '' && !isValidURL(link.url.trim())) ? 'Ingresá una URL válida' : '',
    };

    // Validar que la red social esté confirmada
    if (isSocialLinkValid(link) && !link.confirmed) {
      errors.confirmation = 'Debes confirmar la red social antes de continuar';
    }

    return errors;
  }

  // Función para obtener errores de educación (igual que experiencia)
  function getEducationErrors(edu) {
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
  }

  // Función para obtener errores de certificaciones (igual que redes sociales)
  function getCertificationErrors(cert) {
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
  }

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

  // Confirmación de experiencia/red social
  function handleAddExperience() {
    setForm((prev) => ({ ...prev, experience: [...prev.experience, { title: '', project: '', startDate: '', endDate: '', isCurrent: false, confirmed: false }] }));
    setExpTouched((prev) => [...prev, { title: false, project: false, startDate: false, endDate: false, confirmation: false }]);
    setExpErrors((prev) => [...prev, getExperienceErrors({ title: '', project: '', startDate: '', endDate: '', isCurrent: false, confirmed: false })]);
  }

  function handleExpChange(i, field, value) {
    const updated = [...form.experience];
    updated[i][field] = value;
    setForm({ ...form, experience: updated });
    if (expTouched[i]) {
      const errs = getExperienceErrors(updated[i]);
      setExpErrors((prev) => prev.map((e, idx) => idx === i ? errs : e));
    }
  }

  function handleExpBlur(i, field) {
    setExpTouched((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: true } : t));
    const errs = getExperienceErrors(form.experience[i]);
    setExpErrors((prev) => prev.map((e, idx) => idx === i ? errs : e));
  }

  function handleConfirmExperience(i) {
    const updated = [...form.experience];
    updated[i] = { ...updated[i], confirmed: true };
    setForm({ ...form, experience: updated });
    
    // Actualizar errores para reflejar que ya está confirmada
    const updatedErrors = [...expErrors];
    updatedErrors[i] = getExperienceErrors(updated[i]);
    setExpErrors(updatedErrors);
  }

  function handleRemoveExperience(i) {
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
    setExpTouched((prev) => prev.filter((_, idx) => idx !== i));
    setExpErrors((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleAddSocial() {
    setForm((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: '', url: '', confirmed: false }] }));
    setSocialTouched((prev) => [...prev, { platform: false, url: false, confirmation: false }]);
    setSocialErrors((prev) => [...prev, getSocialErrors({ platform: '', url: '', confirmed: false })]);
  }

  function handleSocialChange(i, field, value) {
    const updated = [...form.socialLinks];
    updated[i][field] = value;
    setForm({ ...form, socialLinks: updated });
    if (socialTouched[i]) {
      const errs = getSocialErrors(updated[i]);
      setSocialErrors((prev) => prev.map((e, idx) => idx === i ? errs : e));
    }
  }

  function handleSocialBlur(i, field) {
    setSocialTouched((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: true } : t));
    const errs = getSocialErrors(form.socialLinks[i]);
    setSocialErrors((prev) => prev.map((e, idx) => idx === i ? errs : e));
  }

  function handleConfirmSocial(i) {
    const updated = [...form.socialLinks];
    updated[i] = { ...updated[i], confirmed: true };
    setForm({ ...form, socialLinks: updated });
    
    // Actualizar errores para reflejar que ya está confirmada
    const updatedErrors = [...socialErrors];
    updatedErrors[i] = getSocialErrors(updated[i]);
    setSocialErrors(updatedErrors);
  }

  function handleRemoveSocial(i) {
    setForm((prev) => ({ ...prev, socialLinks: prev.socialLinks.filter((_, idx) => idx !== i) }));
    setSocialTouched((prev) => prev.filter((_, idx) => idx !== i));
    setSocialErrors((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Funciones para manejar educación
  function handleAddEducation() {
    setForm((prev) => ({ ...prev, education: [...prev.education, { institution: '', title: '', startDate: '', endDate: '', isCurrent: false, confirmed: false }] }));
    setEduTouched((prev) => [...prev, { institution: false, title: false, startDate: false, endDate: false, confirmation: false }]);
    setEduErrors((prev) => [...prev, getEducationErrors({ institution: '', title: '', startDate: '', endDate: '', isCurrent: false, confirmed: false })]);
  }

  function handleEducationChange(i, field, value) {
    const updated = [...form.education];
    updated[i][field] = value;
    setForm({ ...form, education: updated });
    if (eduTouched[i]) {
      const errs = getEducationErrors(updated[i]);
      setEduErrors((prev) => prev.map((e, idx) => idx === i ? errs : e));
    }
  }

  function handleEducationBlur(i, field) {
    setEduTouched((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: true } : t));
    const errs = getEducationErrors(form.education[i]);
    setEduErrors((prev) => prev.map((e, idx) => idx === i ? errs : e));
  }

  function handleConfirmEducation(i) {
    const updated = [...form.education];
    updated[i] = { ...updated[i], confirmed: true };
    setForm({ ...form, education: updated });
    
    // Actualizar errores para reflejar que ya está confirmada
    const updatedErrors = [...eduErrors];
    updatedErrors[i] = getEducationErrors(updated[i]);
    setEduErrors(updatedErrors);
  }

  function handleRemoveEducation(i) {
    setForm((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
    setEduTouched((prev) => prev.filter((_, idx) => idx !== i));
    setEduErrors((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Funciones para manejar certificaciones
  function handleAddCertification() {
    setForm((prev) => ({ ...prev, certifications: [...prev.certifications, { name: '', url: '', confirmed: false }] }));
    setCertTouched((prev) => [...prev, { name: false, url: false, confirmation: false }]);
    setCertErrors((prev) => [...prev, getCertificationErrors({ name: '', url: '', confirmed: false })]);
  }

  function handleCertificationChange(i, field, value) {
    const updated = [...form.certifications];
    updated[i][field] = value;
    setForm({ ...form, certifications: updated });
    if (certTouched[i]) {
      const errs = getCertificationErrors(updated[i]);
      setCertErrors((prev) => prev.map((e, idx) => idx === i ? errs : e));
    }
  }

  function handleCertificationBlur(i, field) {
    setCertTouched((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: true } : t));
    const errs = getCertificationErrors(form.certifications[i]);
    setCertErrors((prev) => prev.map((e, idx) => idx === i ? errs : e));
  }

  function handleConfirmCertification(i) {
    const updated = [...form.certifications];
    updated[i] = { ...updated[i], confirmed: true };
    setForm({ ...form, certifications: updated });
    
    // Actualizar errores para reflejar que ya está confirmada
    const updatedErrors = [...certErrors];
    updatedErrors[i] = getCertificationErrors(updated[i]);
    setCertErrors(updatedErrors);
  }

  function handleRemoveCertification(i) {
    setForm((prev) => ({ ...prev, certifications: prev.certifications.filter((_, idx) => idx !== i) }));
    setCertTouched((prev) => prev.filter((_, idx) => idx !== i));
    setCertErrors((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Nuevo handleSubmit para mostrar errores debajo de los campos al enviar
  function handleSubmit(e) {
    e.preventDefault();
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

    // Validación específica del teléfono al enviar - solo si tiene contenido
    if (form.areaCode && form.areaCode.trim() !== "") {
      const areaCodeError = validateAreaCode(form.areaCode);
      if (areaCodeError) {
        newErrors.areaCode = areaCodeError;
        hasError = true;
      }
    }
    
    if (form.phoneNumber && form.phoneNumber.trim() !== "") {
      const phoneError = validatePhoneNumber(form.phoneNumber);
      if (phoneError) {
        newErrors.phoneNumber = phoneError;
        hasError = true;
      }
    }

    // Validación cruzada: si hay areaCode debe haber phoneNumber y viceversa
    if ((form.areaCode && form.areaCode.trim() !== "" && (!form.phoneNumber || form.phoneNumber.trim() === "")) ||
        (form.phoneNumber && form.phoneNumber.trim() !== "" && (!form.areaCode || form.areaCode.trim() === ""))) {
      if (form.areaCode && !form.phoneNumber) {
        newErrors.phoneNumber = "Si ingresás código de área, también debes ingresar el número";
      }
      if (form.phoneNumber && !form.areaCode) {
        newErrors.areaCode = "Si ingresás número, también debes ingresar el código de área";
      }
      hasError = true;
    }

    // Validación de errores de imágenes
    if (imgErrors.profilePicture || imgErrors.coverPicture) {
      hasError = true;
    }

    setTouched(newTouched);
    setErrors(newErrors);

    // Marcar todos los campos de experiencia como touched SOLO al intentar submit
    const newExpTouched = form.experience.map(() => ({
      title: true, project: true, startDate: true, endDate: true, confirmation: true
    }));
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

    // Marcar todos los campos de redes sociales como touched SOLO al intentar submit
    const newSocialTouched = form.socialLinks.map(() => ({ platform: true, url: true, confirmation: true }));
    const newSocialErrors = form.socialLinks.map(getSocialErrors);
    let socialHasError = false;
    let firstSocialErrorIndex = null;
    form.socialLinks.forEach((link, i) => {
      const errs = getSocialErrors(link);
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

    // Marcar todos los campos de educación como touched SOLO al intentar submit
    const newEduTouched = form.education.map(() => ({ institution: true, title: true, startDate: true, endDate: true, confirmation: true }));
    const newEduErrors = form.education.map(getEducationErrors);
    let eduHasError = false;
    let firstEduErrorIndex = null;
    form.education.forEach((edu, i) => {
      const errs = getEducationErrors(edu);
      if (errs.institution || errs.title || errs.startDate || errs.endDate || errs.confirmation) {
        eduHasError = true;
        if (firstEduErrorIndex === null) {
          firstEduErrorIndex = i;
        }
      }
    });
    setEduTouched(newEduTouched);
    setEduErrors(newEduErrors);

    // Marcar todos los campos de certificaciones como touched SOLO al intentar submit
    const newCertTouched = form.certifications.map(() => ({ name: true, url: true, confirmation: true }));
    const newCertErrors = form.certifications.map(getCertificationErrors);
    let certHasError = false;
    let firstCertErrorIndex = null;
    form.certifications.forEach((cert, i) => {
      const errs = getCertificationErrors(cert);
      if (errs.name || errs.url || errs.confirmation) {
        certHasError = true;
        if (firstCertErrorIndex === null) {
          firstCertErrorIndex = i;
        }
      }
    });
    setCertTouched(newCertTouched);
    setCertErrors(newCertErrors);

    // Si hay errores, hacer scroll al primer error y detener el submit
    if (hasError || expHasError || socialHasError || eduHasError || certHasError) {
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
      }, 200);
      
      return;
    }
    
    // Si no hay errores, limpiar 'confirmed' y campos vacíos antes de enviar al backend
    const cleanForm = {
      ...form,
      // Convertir la fecha de Date object a string YYYY-MM-DD
      birthDate: form.birthDate instanceof Date 
        ? form.birthDate.toISOString().split('T')[0] 
        : form.birthDate,
      experience: form.experience.map(({ confirmed, ...exp }) => {
        const cleanExp = {
          title: exp.title.trim(),
          project: exp.project.trim(),
          startDate: exp.startDate.trim(),
          isCurrent: Boolean(exp.isCurrent)
        };
        
        // Solo agregar endDate si no es actual y tiene valor
        if (!exp.isCurrent && exp.endDate?.trim()) {
          cleanExp.endDate = exp.endDate.trim();
        }
        
        return cleanExp;
      }),
      socialLinks: form.socialLinks
        .filter(link => link && typeof link === 'object' && link.platform?.trim() && link.url?.trim())
        .map(({ confirmed, ...link }) => ({
          platform: link.platform.trim(),
          url: link.url.trim()
        })),
      education: form.education
        .filter(edu => edu && typeof edu === 'object' && edu.institution?.trim() && edu.title?.trim() && edu.startDate?.trim())
        .map(({ confirmed, ...edu }) => {
          const cleanEdu = {
            institution: edu.institution.trim(),
            title: edu.title.trim(),
            startDate: edu.startDate.trim(),
            isCurrent: Boolean(edu.isCurrent)
          };
          
          // Solo agregar endDate si no es actual y tiene valor
          if (!edu.isCurrent && edu.endDate?.trim()) {
            cleanEdu.endDate = edu.endDate.trim();
          }
          
          return cleanEdu;
        }),
      certifications: form.certifications
        .filter(cert => cert && typeof cert === 'object' && cert.name?.trim() && cert.url?.trim())
        .map(({ confirmed, ...cert }) => ({
          name: cert.name.trim(),
          url: cert.url.trim()
        })),
    };
    handleSubmitProfile(e, cleanForm, setMsg, router, updateUser);
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-center mb-6">
        <ConexiaLogo width={80} height={32} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Nombre</label>
            <InputField
              name="name"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              error={errors.name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Apellido</label>
            <InputField
              name="lastName"
              value={form.lastName}
              onChange={e => handleChange("lastName", e.target.value)}
              onBlur={() => handleBlur("lastName")}
              error={errors.lastName}
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Fecha de nacimiento</label>
            <DateInput
              value={form.birthDate}
              onChange={(date) => {
                handleChange("birthDate", date);
                if (touched.birthDate) {
                  handleBlur("birthDate");
                }
              }}
              error={errors.birthDate}
              maxDate={new Date()}
              placeholder="Seleccioná tu fecha de nacimiento"
            />
          </div>
        </div>
        
        {/* Teléfono con selector de país */}
        <PhoneInput
          areaCode={form.areaCode}
          phoneNumber={form.phoneNumber}
          onAreaCodeChange={(value) => handleAreaCodeChange(value)}
          onPhoneNumberChange={(value) => handlePhoneChange(value)}
          areaCodeError={errors.areaCode}
          phoneNumberError={errors.phoneNumber}
          onBlur={() => {
            handleAreaCodeBlur();
            handlePhoneBlur();
          }}
        />
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Tipo de documento</label>
            <select
              name="documentTypeId"
              value={form.documentTypeId}
              onChange={e => {
                handleChange("documentTypeId", e.target.value);
                // Limpiar el número de documento al cambiar el tipo
                if (form.documentNumber) {
                  setForm(prev => ({ ...prev, documentNumber: '' }));
                  setErrors(prev => ({ ...prev, documentNumber: '' }));
                }
              }}
              onBlur={() => handleBlur("documentTypeId")}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40 ${errors.documentTypeId ? 'border-red-500 ring-red-300' : ''}`}
            >
              <option value="" disabled hidden>Seleccioná una opción</option>
              {documentTypes.filter(t => t.id === 1 || t.id === 3).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {errors.documentTypeId && <p className="text-xs text-red-600 mt-1 text-left">{errors.documentTypeId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Número de documento</label>
            <InputField
              name="documentNumber"
              value={form.documentNumber}
              onChange={e => handleChange("documentNumber", e.target.value)}
              onBlur={() => handleBlur("documentNumber")}
              error={errors.documentNumber}
              placeholder={
                form.documentTypeId === "1" ? "12345678" : 
                form.documentTypeId === "3" ? "ABC123456" : 
                "Seleccioná tipo de documento"
              }
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">País (Opcional)</label>
            <InputField name="country" value={form.country} onChange={e => handleChange("country", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Ciudad (Opcional)</label>
            <InputField name="state" value={form.state} onChange={e => handleChange("state", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-conexia-green mb-1">Profesión</label>
          <InputField
            name="profession"
            value={form.profession}
            onChange={e => handleChange("profession", e.target.value)}
            onBlur={() => handleBlur("profession")}
            error={errors.profession}
          />
        </div>
        {/* Imágenes */}
        <div className="flex flex-col gap-6">
          {/* Foto de perfil */}
          <div className="flex flex-row items-start gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-conexia-green mb-1">Foto de perfil (Opcional)</label>
              <p className="text-xs text-gray-500 mb-1">
                Formato permitido: <span className="font-semibold text-conexia-green">JPG, PNG</span>. Máx. <span className="font-semibold text-conexia-green">1 archivo</span> y hasta <span className="font-semibold text-conexia-green">5MB</span>.
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png"
                ref={profilePicRef}
                onChange={e => handleImageChange(e, 'profilePicture')}
                className="w-full mb-2"
                style={{ color: 'transparent' }}
              />
              {form.profilePicture && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('profilePicture')}
                    className="text-red-500 text-xs hover:underline mb-1"
                  >
                    Eliminar
                  </button>
                  <span className="text-xs text-gray-700 mb-1 block">{form.profilePicture.name}</span>
                </>
              )}
              {imgErrors.profilePicture && <p className="text-xs text-red-600 mt-1 text-left">{imgErrors.profilePicture}</p>}
            </div>
            {/* Previsualización a la derecha */}
            {form.profilePicture && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-4 border-white shadow-md mt-6">
                <img
                  src={URL.createObjectURL(form.profilePicture)}
                  alt="Vista previa perfil"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Foto de portada */}
          <div className="flex flex-row items-start gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-conexia-green mb-1">Foto de portada (Opcional)</label>
              <p className="text-xs text-gray-500 mb-1">
                Formato permitido: <span className="font-semibold text-conexia-green">JPG, PNG</span>. Máx. <span className="font-semibold text-conexia-green">1 archivo</span> y hasta <span className="font-semibold text-conexia-green">5MB</span>.
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png"
                ref={coverPicRef}
                onChange={e => handleImageChange(e, 'coverPicture')}
                className="w-full mb-2"
                style={{ color: 'transparent' }}
              />
              {form.coverPicture && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('coverPicture')}
                    className="text-red-500 text-xs hover:underline mb-1"
                  >
                    Eliminar
                  </button>
                  <span className="text-xs text-gray-700 mb-1 block">{form.coverPicture.name}</span>
                </>
              )}
              {imgErrors.coverPicture && <p className="text-xs text-red-600 mt-1 text-left">{imgErrors.coverPicture}</p>}
            </div>
            {/* Previsualización a la derecha */}
            {form.coverPicture && (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border-4 border-white shadow-md mt-6">
                <img
                  src={URL.createObjectURL(form.coverPicture)}
                  alt="Vista previa portada"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-conexia-green mb-1">Descripción (Opcional)</label>
          <TextArea name="description" value={form.description} onChange={e => handleChange("description", e.target.value)} />
        </div>

        {/* Habilidades por Rubro */}
        <div className="-mt-6">
          <label className="block font-medium text-conexia-green mb-1">Habilidades (Opcional)</label>
          <RubroSkillsSelector
            selectedSkills={form.skills}
            onSkillsChange={(newSkills) => setForm(prev => ({ ...prev, skills: newSkills }))}
            maxSkills={20}
          />
        </div>

    {/* Experiencia */}
    <div>
      <h4 className="font-semibold text-conexia-green">Experiencia (Opcional)</h4>
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
                max={getTodayDate()}
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
                max={getTodayDate()}
                placeholder="dd/mm/yyyy"
              />
              <div style={{ minHeight: 20 }}>
                {expTouched[i]?.endDate && expErrors[i]?.endDate && <p className="text-xs text-red-600 mt-1 text-left">{expErrors[i].endDate}</p>}
              </div>
            </div>
            <label className="text-sm text-conexia-green mb-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={exp.isCurrent}
                onChange={e => {
                  if (exp.confirmed) return;
                  handleExpChange(i, 'isCurrent', e.target.checked);
                  if (e.target.checked) handleExpChange(i, 'endDate', '');
                }}
                disabled={exp.confirmed}
              />
              Actualmente trabajo aquí
            </label>
          </div>
          <div className="flex justify-end gap-2 items-end">
            <button
              type="button"
              className={`w-6 h-6 flex items-center justify-center rounded ${exp.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!isExperienceValid(exp) && !exp.confirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={exp.confirmed || !isExperienceValid(exp)}
              onClick={() => handleConfirmExperience(i)}
              title="Confirmar experiencia"
              style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${exp.confirmed ? 'text-green-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
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
          {expTouched[i]?.confirmation && expErrors[i]?.confirmation && (
            <p className="text-xs text-red-600 mt-1 text-left">{expErrors[i].confirmation}</p>
          )}
        </div>
      ))}
      {form.experience.length > 0 && (
        <button type="button" onClick={handleAddExperience} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar experiencia</button>
      )}
    </div>

    {/* Educación */}
    <div>
      <h4 className="font-semibold text-conexia-green">Educación (Opcional)</h4>
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
                max={getTodayDate()}
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
                max={getTodayDate()}
                placeholder="dd/mm/yyyy"
              />
              <div style={{ minHeight: 20 }}>
                {eduTouched[i]?.endDate && eduErrors[i]?.endDate && <p className="text-xs text-red-600 mt-1 text-left">{eduErrors[i].endDate}</p>}
              </div>
            </div>
            <label className="text-sm text-conexia-green mb-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={edu.isCurrent}
                onChange={e => {
                  if (edu.confirmed) return;
                  handleEducationChange(i, 'isCurrent', e.target.checked);
                  if (e.target.checked) handleEducationChange(i, 'endDate', '');
                }}
                disabled={edu.confirmed}
              />
              Actualmente estudio aquí
            </label>
          </div>
          <div className="flex justify-end gap-2 items-end">
            <button
              type="button"
              className={`w-6 h-6 flex items-center justify-center rounded ${edu.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!isEducationValid(edu) && !edu.confirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={edu.confirmed || !isEducationValid(edu)}
              onClick={() => handleConfirmEducation(i)}
              title="Confirmar educación"
              style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${edu.confirmed ? 'text-green-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
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
          {eduTouched[i]?.confirmation && eduErrors[i]?.confirmation && (
            <p className="text-xs text-red-600 mt-1 text-left">{eduErrors[i].confirmation}</p>
          )}
        </div>
      ))}
      {form.education.length > 0 && (
        <button type="button" onClick={handleAddEducation} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar educación</button>
      )}
    </div>

    {/* Certificaciones */}
    <div>
      <h4 className="font-semibold text-conexia-green">Certificaciones (Opcional)</h4>
      {form.certifications.length === 0 && (
        <button type="button" onClick={handleAddCertification} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar certificación</button>
      )}
      {form.certifications.map((cert, i) => (
        <div key={i} className="grid md:grid-cols-3 gap-2 items-center mt-2" data-certification-index={i}>
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
              className={`w-6 h-6 flex items-center justify-center rounded ${cert.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!isCertificationValid(cert) && !cert.confirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={cert.confirmed || !isCertificationValid(cert)}
              onClick={() => handleConfirmCertification(i)}
              title="Confirmar certificación"
              style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${cert.confirmed ? 'text-green-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
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
          {certTouched[i]?.confirmation && certErrors[i]?.confirmation && (
            <p className="text-xs text-red-600 mt-1 text-left">{certErrors[i].confirmation}</p>
          )}
        </div>
      ))}
      {form.certifications.length > 0 && (
        <button type="button" onClick={handleAddCertification} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar certificación</button>
      )}
    </div>

    {/* Redes Sociales */}
    <div>
      <h4 className="font-semibold text-conexia-green">Redes Sociales (Opcional)</h4>
      {form.socialLinks.length === 0 && (
        <button type="button" onClick={handleAddSocial} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar red social</button>
      )}
      {form.socialLinks.map((link, i) => (
        <div key={i} className="grid md:grid-cols-3 gap-2 items-center mt-2" data-social-index={i}>
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
              className={`w-6 h-6 flex items-center justify-center rounded ${link.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!isSocialLinkValid(link) && !link.confirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={link.confirmed || !isSocialLinkValid(link)}
              onClick={() => handleConfirmSocial(i)}
              title="Confirmar red"
              style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${link.confirmed ? 'text-green-600' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
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
          {socialTouched[i]?.confirmation && socialErrors[i]?.confirmation && (
            <p className="text-xs text-red-600 mt-1 text-left">{socialErrors[i].confirmation}</p>
          )}
        </div>
      ))}
      {form.socialLinks.length > 0 && (
        <button type="button" onClick={handleAddSocial} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar red social</button>
      )}
    </div>



        <button type="submit" className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90">
          Crear perfil
        </button>
        {msg && (!msg.field && !msg.fields || msg.ok) && msg.text && typeof msg.text === 'string' && (
          <p className={`text-center mt-2 text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>
            {msg.text}
          </p>
        )}
      </form>
    </div>
  );
}

// Utilidad para obtener el día siguiente a una fecha (formato yyyy-mm-dd)
function getNextDay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

// Utilidad para obtener el día anterior a una fecha (formato yyyy-mm-dd)
function getPrevDay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

// Utilidad para obtener la fecha actual (formato yyyy-mm-dd)
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Reutilizables
function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>}
      <input {...props} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40" />
    </div>
  );
}


function File({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>}
      <input type="file" accept="image/jpeg,image/png" className="w-full" {...props} />
    </div>
  );
}

function Select({ label, options = [], ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>}
      <select
        {...props}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40"
      >
        <option value="" disabled hidden>Seleccioná una opción</option> {/* ← esta es la opción por defecto */}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// app/create-profile/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { getDocumentTypes } from "@/service/profiles/profilesFetch";
import { handleDynamicFieldChange, validateDynamicField } from "@/components/utils/validations/addElement";
import { removeItemFromFormArray } from "@/components/utils/removeItemArray";
import { toggleHabilidad } from "@/components/utils/toggleHabilidad";

import InputField from "@/components/form/InputField";
import TextArea from "@/components/form/InputField";
import { handleSubmitProfile } from "@/components/utils/handlers";



export default function CreateProfileForm() {
  // Refs para los inputs de imagen
  const profilePicRef = useRef(null);
  const coverPicRef = useRef(null);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    birthDate: "",
    documentTypeId: "",
    documentNumber: "",
    phoneNumber: "",
    country: "",
    state: "",
    profilePicture: null,
    coverPicture: null,
    skills: [],
    description: "",
    experience: [],
    socialLinks: [],
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
        return;
      }
      setImgErrors(prev => ({ ...prev, [field]: '' }));
      setForm(prev => ({ ...prev, [field]: file }));
    } else {
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
  ];

  const validateField = (field, value) => {
    if (requiredFields.some(f => f.name === field)) {
      if (!value || value.trim() === "") {
        return "Este campo es obligatorio";
      }
    }
    // Validación de mayor de 18 años para fecha de nacimiento
    if (field === "birthDate" && value) {
      const birth = new Date(value);
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
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
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

    return errors;
  }

  function isSocialLinkValid(link) {
    return link.platform && link.platform.trim() !== '' && link.url && link.url.trim() !== '';
  }

  function getSocialErrors(link) {
    return {
      platform: !link.platform || link.platform.trim() === '' ? 'Campo obligatorio' : '',
      url: !link.url || link.url.trim() === '' ? 'Campo obligatorio' : '',
    };
  }

  // Confirmación de experiencia/red social
  function handleAddExperience() {
    setForm((prev) => ({ ...prev, experience: [...prev.experience, { title: '', project: '', startDate: '', endDate: '', isCurrent: false, confirmed: false }] }));
    setExpTouched((prev) => [...prev, { title: false, project: false, startDate: false, endDate: false }]);
    setExpErrors((prev) => [...prev, getExperienceErrors({ title: '', project: '', startDate: '', endDate: '', isCurrent: false })]);
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
  }

  function handleRemoveExperience(i) {
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
    setExpTouched((prev) => prev.filter((_, idx) => idx !== i));
    setExpErrors((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleAddSocial() {
    setForm((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: '', url: '', confirmed: false }] }));
    setSocialTouched((prev) => [...prev, { platform: false, url: false }]);
    setSocialErrors((prev) => [...prev, getSocialErrors({ platform: '', url: '' })]);
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
  }

  function handleRemoveSocial(i) {
    setForm((prev) => ({ ...prev, socialLinks: prev.socialLinks.filter((_, idx) => idx !== i) }));
    setSocialTouched((prev) => prev.filter((_, idx) => idx !== i));
    setSocialErrors((prev) => prev.filter((_, idx) => idx !== i));
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
    setTouched(newTouched);
    setErrors(newErrors);

    // Marcar todos los campos de experiencia como touched SOLO al intentar submit
    const newExpTouched = form.experience.map(() => ({
      title: true, project: true, startDate: true, endDate: true
    }));
    const newExpErrors = form.experience.map(getExperienceErrors);
    let expHasError = false;
    let firstExpErrorIndex = null;
    form.experience.forEach((exp, i) => {
      const errs = getExperienceErrors(exp);
      if ((!exp.confirmed && (errs.title || errs.project || errs.startDate || errs.endDate)) || !exp.confirmed) {
        if (!firstErrorField && firstExpErrorIndex === null) {
          firstExpErrorIndex = i;
        }
        expHasError = true;
      }
    });
    setExpTouched(newExpTouched);
    setExpErrors(newExpErrors);

    // Marcar todos los campos de redes sociales como touched SOLO al intentar submit
    const newSocialTouched = form.socialLinks.map(() => ({ platform: true, url: true }));
    const newSocialErrors = form.socialLinks.map(getSocialErrors);
    let socialHasError = false;
    let firstSocialErrorIndex = null;
    form.socialLinks.forEach((link, i) => {
      const errs = getSocialErrors(link);
      if ((!link.confirmed && (errs.platform || errs.url)) || !link.confirmed) {
        if (!firstErrorField && firstExpErrorIndex === null && firstSocialErrorIndex === null) {
          firstSocialErrorIndex = i;
        }
        socialHasError = true;
      }
    });
    setSocialTouched(newSocialTouched);
    setSocialErrors(newSocialErrors);

    // Si hay errores, hacer scroll al primer error y detener el submit
    if (hasError || expHasError || socialHasError) {
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
        }
      }, 100);
      
      return;
    }
    
    // Si no hay errores, limpiar 'confirmed' antes de enviar al backend
    const cleanForm = {
      ...form,
      experience: form.experience.map(({ confirmed, ...rest }) => rest),
      socialLinks: form.socialLinks.map(({ confirmed, ...rest }) => rest),
    };
    handleSubmitProfile(e, cleanForm, setMsg, router);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} className="mx-auto mb-6" />
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Nombre</label>
            <InputField
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              error={errors.name}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Apellido</label>
            <InputField
              value={form.lastName}
              onChange={e => handleChange("lastName", e.target.value)}
              onBlur={() => handleBlur("lastName")}
              error={errors.lastName}
              required
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={e => handleChange("birthDate", e.target.value)}
              onBlur={() => handleBlur("birthDate")}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40 ${errors.birthDate ? 'border-red-500 ring-red-300' : ''}`}
            />
            {errors.birthDate && <p className="text-xs text-red-600 mt-1 text-left">{errors.birthDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Teléfono</label>
            <InputField
              value={form.phoneNumber}
              onChange={e => handleChange("phoneNumber", e.target.value)}
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Tipo de documento</label>
            <select
              value={form.documentTypeId}
              onChange={e => handleChange("documentTypeId", e.target.value)}
              onBlur={() => handleBlur("documentTypeId")}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40 ${errors.documentTypeId ? 'border-red-500 ring-red-300' : ''}`}
            >
              <option value="" disabled hidden>Seleccioná una opción</option>
              {documentTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {errors.documentTypeId && <p className="text-xs text-red-600 mt-1 text-left">{errors.documentTypeId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Número de documento</label>
            <InputField
              value={form.documentNumber}
              onChange={e => handleChange("documentNumber", e.target.value)}
              onBlur={() => handleBlur("documentNumber")}
              error={errors.documentNumber}
              required
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">País</label>
            <InputField value={form.country} onChange={e => handleChange("country", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Ciudad</label>
            <InputField value={form.state} onChange={e => handleChange("state", e.target.value)} />
          </div>
        </div>
        {/* Imágenes */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Foto de perfil</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              ref={profilePicRef}
              onChange={e => handleImageChange(e, 'profilePicture')}
            />
            {form.profilePicture && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-700">{form.profilePicture.name}</span>
                <button type="button" onClick={() => handleRemoveImage('profilePicture')} className="text-red-500 text-xs hover:underline">Eliminar</button>
              </div>
            )}
            {imgErrors.profilePicture && <p className="text-xs text-red-600 mt-1 text-left">{imgErrors.profilePicture}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Foto de portada</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              ref={coverPicRef}
              onChange={e => handleImageChange(e, 'coverPicture')}
            />
            {form.coverPicture && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-700">{form.coverPicture.name}</span>
                <button type="button" onClick={() => handleRemoveImage('coverPicture')} className="text-red-500 text-xs hover:underline">Eliminar</button>
              </div>
            )}
            {imgErrors.coverPicture && <p className="text-xs text-red-600 mt-1 text-left">{imgErrors.coverPicture}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-conexia-green mb-1">Descripción</label>
          <TextArea value={form.description} onChange={e => handleChange("description", e.target.value)} />
        </div>

        {/* Habilidades */}
        <div>
          <label className="block font-medium text-conexia-green mb-1">Habilidades</label>
          <div className="flex flex-wrap gap-2">
            {habilidadesDisponibles.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => toggleHabilidad(h, form, setForm)}
                className={`px-3 py-1 rounded border text-sm font-medium ${
                  form.skills.includes(h) ? "bg-conexia-green text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
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
                required
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
                required
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
                min={exp.startDate ? getNextDay(exp.startDate) : undefined}
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
        </div>
      ))}
      {form.experience.length > 0 && (
        <button type="button" onClick={handleAddExperience} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar experiencia</button>
      )}
    </div>

    {/* Redes Sociales */}
    <div>
      <h4 className="font-semibold text-conexia-green">Redes Sociales</h4>
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
              required
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
        </div>
      ))}
      {form.socialLinks.length > 0 && (
        <button type="button" onClick={handleAddSocial} className="mt-2 text-sm text-conexia-green hover:underline">+ Agregar red social</button>
      )}
    </div>



        <button type="submit" className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90">
          Crear perfil
        </button>
        {msg && <p className={`text-center mt-2 text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
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

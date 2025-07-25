// src/components/profile/userProfile/EditProfileForm.jsx
"use client";

import { useState, useRef } from "react";
import { toggleHabilidad } from "@/components/utils/toggleHabilidad";
import NavbarHome from "@/components/navbar/NavbarHome";
import NavbarAdmin from "@/components/navbar/NavbarAdmin";
import NavbarCommunity from "@/components/navbar/NavbarCommunity";
import { useAuth } from "@/context/AuthContext";
import InputField from "@/components/form/InputField";
import Button from "@/components/ui/Button";
import TextArea from "@/components/form/InputField";
import { config } from "@/config";
import Image from "next/image";

export default function EditProfileForm({ user, onSubmit, isEditing = true }) {
  const profilePicRef = useRef(null);
  const coverPicRef = useRef(null);
  const [form, setForm] = useState({
    name: user.name || "",
    lastName: user.lastName || "",
    birthDate: user.birthDate || "",
    phoneNumber: user.phoneNumber || "",
    country: user.country || "",
    state: user.state || "",
    profilePicture: null,
    coverPicture: null,
    skills: user.skills || [],
    description: user.description || "",
    experience: user.experience || [],
    socialLinks: user.socialLinks || [],
  });
  const [imgErrors, setImgErrors] = useState({ profilePicture: '', coverPicture: '' });
  const [errors, setErrors] = useState({});
  const habilidadesDisponibles = ["Frontend", "Backend", "UX/UI", "DevOps", "Marketing", "Otra"];
  const plataformas = ["LinkedIn", "GitHub", "Twitter", "Portfolio", "Otro"];
  // Experiencia y redes sociales UX (con confirmación y deshabilitado)
  function handleAddExperience() {
    setForm((prev) => ({ ...prev, experience: [...prev.experience, { title: '', project: '', startDate: '', endDate: '', isCurrent: false, confirmed: false }] }));
  }
  function handleRemoveExperience(i) {
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
  }
  function handleExpChange(i, field, value) {
    const updated = [...form.experience];
    updated[i][field] = value;
    setForm({ ...form, experience: updated });
  }
  function handleConfirmExperience(i) {
    const updated = [...form.experience];
    updated[i].confirmed = true;
    setForm({ ...form, experience: updated });
  }
  function handleAddSocial() {
    setForm((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: '', url: '', confirmed: false }] }));
  }
  function handleRemoveSocial(i) {
    setForm((prev) => ({ ...prev, socialLinks: prev.socialLinks.filter((_, idx) => idx !== i) }));
  }
  function handleSocialChange(i, field, value) {
    const updated = [...form.socialLinks];
    updated[i][field] = value;
    setForm({ ...form, socialLinks: updated });
  }
  function handleConfirmSocial(i) {
    const updated = [...form.socialLinks];
    updated[i].confirmed = true;
    setForm({ ...form, socialLinks: updated });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

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
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Validaciones mínimas
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio';
    if (!form.country.trim()) newErrors.country = 'El país es obligatorio';
    if (!form.state.trim()) newErrors.state = 'La localidad es obligatoria';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(form);
  }

  const { user: authUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-conexia-soft">
      <div className="w-full max-w-5xl mx-auto px-4 mt-4">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          {/* Imágenes - Ahora al comienzo */}
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-conexia-green mb-1">Foto de perfil</label>
                
                {/* Imagen actual */}
                {user.profilePicture && !form.profilePicture && (
                  <div className="mb-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
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
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
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
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
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
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
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
              <InputField name="name" value={form.name} onChange={handleChange} error={errors.name} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Apellido</label>
              <InputField name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Fecha de nacimiento</label>
              <InputField name="birthDate" value={form.birthDate || ''} onChange={handleChange} type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Teléfono</label>
              <InputField name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">País</label>
              <InputField name="country" value={form.country} onChange={handleChange} error={errors.country} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">Localidad</label>
              <InputField name="state" value={form.state} onChange={handleChange} error={errors.state} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-conexia-green mb-1">Descripción</label>
              <TextArea name="description" value={form.description} onChange={handleChange} multiline rows={4} className="w-full min-h-[96px]" />
            </div>
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
                  className={`px-3 py-1 rounded border text-sm font-medium ${form.skills.includes(h) ? "bg-conexia-green text-white" : "bg-gray-100 text-gray-700"}`}
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
              <div key={i} className="grid gap-2 mt-2 border-b pb-4">
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-conexia-green mb-1">Título</label>
                    <InputField value={exp.title} onChange={e => handleExpChange(i, 'title', e.target.value)} required disabled={exp.confirmed} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-conexia-green mb-1">Proyecto</label>
                    <InputField value={exp.project} onChange={e => handleExpChange(i, 'project', e.target.value)} required disabled={exp.confirmed} />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-2 items-end">
                  <div className="flex flex-col min-h-[80px]">
                    <label className="text-sm text-conexia-green mb-1">Desde</label>
                    <input type="date" className="border rounded p-2" value={exp.startDate} onChange={e => handleExpChange(i, 'startDate', e.target.value)} disabled={exp.confirmed} />
                  </div>
                  <div className="flex flex-col min-h-[80px]">
                    <label className="text-sm text-conexia-green mb-1">Hasta</label>
                    <input type="date" className="border rounded p-2" value={exp.endDate} onChange={e => handleExpChange(i, 'endDate', e.target.value)} disabled={exp.isCurrent || exp.confirmed} />
                  </div>
                  <label className="text-sm text-conexia-green mb-1 flex items-center gap-2">
                    <input type="checkbox" checked={exp.isCurrent} onChange={e => handleExpChange(i, 'isCurrent', e.target.checked)} disabled={exp.confirmed} />Actualmente trabajo aquí
                  </label>
                </div>
                <div className="flex justify-end gap-2 items-end">
                  <button
                    type="button"
                    className={`w-6 h-6 flex items-center justify-center rounded ${exp.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!exp.confirmed && !(exp.title && exp.project && exp.startDate && (exp.isCurrent || exp.endDate)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={exp.confirmed || !(exp.title && exp.project && exp.startDate && (exp.isCurrent || exp.endDate))}
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
              <div key={i} className="grid md:grid-cols-3 gap-2 items-center mt-2">
                <div className="flex flex-col items-start h-full">
                  <label className="block font-semibold text-conexia-green text-sm mb-0">Plataforma</label>
                  <select
                    value={link.platform}
                    onChange={e => handleSocialChange(i, 'platform', e.target.value)}
                    className="border p-2 rounded w-full h-[42px]"
                    disabled={link.confirmed}
                  >
                    <option value="">Seleccionar plataforma</option>
                    {plataformas.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col items-start h-full">
                  <label className="block font-semibold text-conexia-green text-sm mb-0">URL</label>
                  <InputField value={link.url} onChange={e => handleSocialChange(i, 'url', e.target.value)} required disabled={link.confirmed} />
                </div>
                <div className="flex flex-row justify-end items-center gap-2 h-full">
                  <button
                    type="button"
                    className={`w-6 h-6 flex items-center justify-center rounded ${link.confirmed ? 'bg-green-100' : 'bg-conexia-green hover:bg-green-700'} ${!link.confirmed && !(link.platform && link.url) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={link.confirmed || !(link.platform && link.url)}
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
          {isEditing && (
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button type="submit" className="w-full md:w-auto bg-conexia-green text-white py-2 px-8 rounded font-semibold hover:bg-conexia-green/90">Confirmar cambios</button>
              <button
                type="button"
                className="w-full md:w-auto bg-[#ff4d58] text-white py-2 px-8 rounded font-semibold hover:bg-red-500"
                style={{ minWidth: '120px' }}
                onClick={() => { window.location.href = "/"; }}
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

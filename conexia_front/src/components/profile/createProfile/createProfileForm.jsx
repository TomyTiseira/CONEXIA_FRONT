// app/create-profile/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getDocumentTypes } from "@/service/profiles/profilesFetch";
import { handleDynamicFieldChange, validateDynamicField } from "@/components/utils/validations/addElement";
import { removeItemFromFormArray } from "@/components/utils/removeItemArray";
import { toggleHabilidad } from "@/components/utils/toggleHabilidad";
import {
  handleAddExperience,
  handleAddSocialLink,
  handleFileChange,
  handleSubmitProfile
} from "@/components/utils/handlers";


export default function CreateProfileForm() {
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
    experience: [{ title: "", project: "", startDate: "", endDate: "", isCurrent: false }],
    socialLinks: [{ platform: "", url: "" }],
  });

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const habilidadesDisponibles = ["Frontend", "Backend", "UX/UI", "DevOps", "Marketing", "Otra"];
  const plataformas = ["LinkedIn", "GitHub", "Twitter", "Portfolio", "Otro"];
  const [fieldErrors, setFieldErrors] = useState({ experience: "", socialLinks: "",});
  

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

  // Validación de experiencia
  function isExperienceValid(exp) {
    return (
      exp.title.trim() !== '' &&
      exp.project.trim() !== '' &&
      exp.startDate &&
      (exp.isCurrent || exp.endDate)
    );
  }

  function isSocialLinkValid(link) {
    return link.platform.trim() !== '' && link.url.trim() !== '';
  }

  // Confirmación de experiencia/red social
  function handleConfirmExperience(i) {
    const updated = [...form.experience];
    updated[i] = { ...updated[i], confirmed: true };
    setForm({ ...form, experience: updated });
  }
  function handleConfirmSocial(i) {
    const updated = [...form.socialLinks];
    updated[i] = { ...updated[i], confirmed: true };
    setForm({ ...form, socialLinks: updated });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} className="mx-auto mb-6" />
      <form onSubmit={(e) => handleSubmitProfile(e, form, setMsg, router)} className="space-y-6 bg-white p-6 rounded shadow">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              required
              onKeyDown={(e) => e.preventDefault()} // Previene escritura con teclado
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40"
            />
          </div>
          <Input label="Teléfono" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="Tipo de documento"
            value={form.documentTypeId}
            options={documentTypes.map((t) => ({ label: t.name, value: t.id }))}
            onChange={(e) => setForm({ ...form, documentTypeId: e.target.value })}
          />
          <Input label="Número de documento" value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} required />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="País" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <Input label="Ciudad" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <File label="Foto de perfil" onChange={(e) => handleFileChange(e, "profilePicture", form, setForm, setMsg)} />
          <File label="Foto de portada" onChange={(e) => handleFileChange(e, "coverPicture", form, setForm, setMsg)} />
        </div>

        <TextArea label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

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
      {form.experience.map((exp, i) => (
        <div key={i} className="grid gap-2 mt-2 border-b pb-4">
          {/* Fila Título y Proyecto */}
          <div className="grid md:grid-cols-2 gap-2">
            <Input
              label="Título"
              value={exp.title}
              onChange={(e) => handleDynamicFieldChange(form, setForm, "experience", i, "title", e.target.value)}
              disabled={exp.confirmed}
            />
            <Input
              label="Proyecto"
              value={exp.project}
              onChange={(e) => handleDynamicFieldChange(form, setForm, "experience", i, "project", e.target.value)}
              disabled={exp.confirmed}
            />
          </div>

          {/* Fila Fechas y Checkbox */}
          <div className="grid md:grid-cols-3 gap-2 items-end">
            <div className="flex flex-col">
              <label className="text-sm text-conexia-green mb-1">Desde</label>
              <input
                type="date"
                className="border rounded p-2"
                value={exp.startDate}
                onChange={(e) => handleDynamicFieldChange(form, setForm, "experience", i, "startDate", e.target.value)}
                onKeyDown={(e) => e.preventDefault()}
                min={form.birthDate ? getNextDay(form.birthDate) : undefined}
                max={undefined}
                disabled={exp.confirmed}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-conexia-green mb-1">Hasta</label>
              <input
                type="date"
                className="border rounded p-2"
                value={exp.endDate}
                onChange={(e) => handleDynamicFieldChange(form, setForm, "experience", i, "endDate", e.target.value)}
                disabled={exp.isCurrent || exp.confirmed}
                onKeyDown={(e) => e.preventDefault()}
                min={exp.startDate ? getNextDay(exp.startDate) : undefined}
              />
            </div>

            <label className="text-sm text-conexia-green mb-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={exp.isCurrent}
                onChange={(e) => {
                  if (exp.confirmed) return;
                  const checked = e.target.checked;
                  const updatedExperience = [...form.experience];
                  updatedExperience[i] = {
                    ...updatedExperience[i],
                    isCurrent: checked,
                    endDate: checked ? "" : updatedExperience[i].endDate
                  };
                  setForm({ ...form, experience: updatedExperience });
                }}
                disabled={exp.confirmed}
              />
              Actualmente trabajo aquí
            </label>
          </div>

          {/* Botón confirmar experiencia */}
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
              onClick={() => removeItemFromFormArray(form, setForm, "experience", i)}
              className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center"
              title="Eliminar"
              style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => handleAddExperience(form, setForm, setFieldErrors, form.birthDate)}
        className="mt-2 text-sm text-conexia-green hover:underline"
      >
        + Agregar experiencia
      </button>
      {fieldErrors.experience && (
        <p className="text-sm text-red-500 mt-1">{fieldErrors.experience}</p>
      )}
    </div>

    {/* Redes Sociales */}
    <div>
      <h4 className="font-semibold text-conexia-green">Redes Sociales</h4>
      {form.socialLinks.map((link, i) => (
        <div key={i} className="grid md:grid-cols-3 gap-2 items-center mt-2">
          <div className="flex flex-col">
            <label className="block font-semibold text-conexia-green mb-1 text-sm">Plataforma</label>
            <select
              value={link.platform}
              onChange={(e) => handleDynamicFieldChange(form, setForm, "socialLinks", i, "platform", e.target.value)}
              className="border p-2 rounded w-full h-[42px]"
              disabled={link.confirmed}
            >
              <option value="">Seleccionar plataforma</option>
              {plataformas.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block font-semibold text-conexia-green mb-1 text-sm">URL</label>
            <Input
              value={link.url}
              onChange={(e) => handleDynamicFieldChange(form, setForm, "socialLinks", i, "url", e.target.value)}
              className="w-full"
              disabled={link.confirmed}
            />
          </div>

          <div className="flex flex-row justify-end items-end pt-6 gap-2">
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
              onClick={() => removeItemFromFormArray(form, setForm, "socialLinks", i)}
              className="w-6 h-6 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
              title="Eliminar"
              style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => handleAddSocialLink(form, setForm, setFieldErrors)}
        className="mt-2 text-sm text-conexia-green hover:underline"
      >
        + Agregar red social
      </button>

      {fieldErrors.socialLinks && (
        <p className="text-red-600 text-sm mt-1">{fieldErrors.socialLinks}</p>
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

function TextArea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>}
      <textarea {...props} className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40" />
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

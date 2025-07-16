// app/create-profile/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createUserProfile, getDocumentTypes } from "@/service/profiles/profilesFetch";
import { validateImage } from "@/components/utils/validations/archivos";
import { calculateAge } from "@/components/utils/validations/fechas";
import { isValidPhoneNumber } from "@/components/utils/validations/phones";
import { handleDynamicFieldChange, validateDynamicField } from "@/components/utils/validations/addElement";

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
    experience: [{ title: "", project: "" }],
    socialLinks: [{ platform: "", url: "" }],
  });

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

  const handleFileChange = (e, campo) => {
    const file = e.target.files[0];
    if (validateImage(file)) {
      setForm({ ...form, [campo]: file });
    } else {
      setMsg({ ok: false, text: "Solo se permiten imágenes JPG/PNG de hasta 5MB." });
    }
  };

  const toggleHabilidad = (habilidad) => {
    const updated = form.skills.includes(habilidad)
      ? form.skills.filter((h) => h !== habilidad)
      : [...form.skills, habilidad];
    setForm({ ...form, skills: updated });
  };

  const handleAddExperience = () => {
    const last = form.experience.at(-1);
    if (!validateDynamicField(last, ["title", "project"])) {
      setFieldErrors((prev) => ({
        ...prev,
        experience: "Completá título y proyecto antes de agregar una nueva experiencia.",
      }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, experience: "" }));
    setForm({ ...form, experience: [...form.experience, { title: "", project: "" }] });
  };

  const handleAddSocialLink = () => {
    const last = form.socialLinks.at(-1);
    if (!validateDynamicField(last, ["platform", "url"])) {
      setFieldErrors((prev) => ({
        ...prev,
        socialLinks: "Completá plataforma y URL antes de agregar una nueva red social.",
      }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, socialLinks: "" }));
    setForm({ ...form, socialLinks: [...form.socialLinks, { platform: "", url: "" }] });
  };

  // Eliminar genérico
  const removeItemFromFormArray = (field, index) => {
    const updated = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["name", "lastName", "birthDate", "documentTypeId", "documentNumber"];
    const missing = requiredFields.some((f) => !form[f]);
    if (missing) return setMsg({ ok: false, text: "Completá todos los campos obligatorios." });

    if (calculateAge(form.birthDate) < 18) {
      return setMsg({ ok: false, text: "Debes tener al menos 18 años." });
    }

    if (form.phoneNumber && !isValidPhoneNumber(form.phoneNumber)) {
      return setMsg({ ok: false, text: "El teléfono debe ser numérico y válido (ej: 351xxxxxxxx)." });
    }

    // Validar experiencia
    for (let exp of form.experience) {
      if ((exp.title && !exp.project) || (!exp.title && exp.project)) {
        return setMsg({ ok: false, text: "Completá título y proyecto en cada experiencia." });
      }
    }

    // Validar redes Sociales
    for (let link of form.socialLinks) {
      if ((link.platform && !link.url) || (!link.platform && link.url)) {
        return setMsg({ ok: false, text: "Completá plataforma y URL en cada red social." });
      }
    }

    const formData = new FormData();
    for (const key in form) {
      const value = form[key];
      if (Array.isArray(value)) {
        value.forEach((item) =>
          formData.append(key, typeof item === "object" ? JSON.stringify(item) : item)
        );
      } else if (value) {
        formData.append(key, value);
      }
    }

    try {
      await createUserProfile(formData);
      setMsg({ ok: true, text: "Perfil creado con éxito." });
      setTimeout(() => router.push("/"), 1000); // Redirigir a inicio como logueado
    } catch (err) {
      setMsg({ ok: false, text: err.message || "Error al crear el perfil." });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} className="mx-auto mb-6" />
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input type="date" label="Fecha de nacimiento" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} required />
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
          <File label="Foto de perfil" onChange={(e) => handleFileChange(e, "profilePicture")} />
          <File label="Foto de portada" onChange={(e) => handleFileChange(e, "coverPicture")} />
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
                onClick={() => toggleHabilidad(h)}
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
          {form.experience.map((exp, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-2 mt-2 relative">
              <Input
                label="Título"
                value={exp.title}
                onChange={(e) => handleDynamicFieldChange(form, setForm, "experience", i, "title", e.target.value)}
              />
              <Input
                label="Proyecto"
                value={exp.project}
                onChange={(e) => handleDynamicFieldChange(form, setForm, "experience", i, "project", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItemFromFormArray("experience", i)}
                className="absolute right-0 top-0 text-sm text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddExperience}
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
            <div key={i} className="grid md:grid-cols-2 gap-2 mt-2 relative">
              <select
                value={link.platform}
                onChange={(e) => handleDynamicFieldChange(form, setForm, "socialLinks", i, "platform", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Seleccionar plataforma</option>
                {plataformas.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <Input
                label="URL"
                value={link.url}
                onChange={(e) => handleDynamicFieldChange(form, setForm, "socialLinks", i, "url", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItemFromFormArray("socialLinks", i)}
                className="absolute right-0 top-0 text-sm text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSocialLink}
            className="mt-2 text-sm text-conexia-green hover:underline"
          >
            + Agregar red social
          </button>
          {fieldErrors.socialLinks && (
            <p className="text-sm text-red-500 mt-1">{fieldErrors.socialLinks}</p>
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
      <select {...props} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40">
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

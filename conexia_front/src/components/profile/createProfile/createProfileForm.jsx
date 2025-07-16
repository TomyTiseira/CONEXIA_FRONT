// app/create-profile/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createUserProfile, getDocumentTypes } from "@/service/profiles/profilesFetch";
import { validateImage } from "@/components/utils/validations/archivos";
import { calculateAge } from "@/components/utils/validations/fechas";

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
    description: "",
    skills: [],
    experience: "",
    socialLinks: "",
    profilePicture: null,
    coverPicture: null,
  });

  const [msg, setMsg] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const habilidadesDisponibles = ["Frontend", "Backend", "UX/UI", "DevOps", "Marketing", "Otra"];

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const tipos = await getDocumentTypes();
        setDocumentTypes(tipos.data);
      } catch (error) {
        setMsg("Error al cargar los tipos de documento");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (calculateAge(form.birthDate) < 18) {
      return setMsg({ ok: false, text: "Debes tener al menos 18 años para registrarte." });
    }

    if (!form.name || !form.lastName || !form.birthDate || !form.documentTypeId || !form.documentNumber) {
      return setMsg({ ok: false, text: "Por favor completá todos los campos obligatorios." });
    }

    const formData = new FormData();

    // Campos simples
    for (const key of [
      "name",
      "lastName",
      "birthDate",
      "documentTypeId",
      "documentNumber",
      "phoneNumber",
      "country",
      "state",
      "description",
    ]) {
      if (form[key]) formData.append(key, form[key]);
    }

    // Archivos
    if (form.profilePicture) formData.append("profilePicture", form.profilePicture);
    if (form.coverPicture) formData.append("coverPicture", form.coverPicture);

    // Arrays
    form.skills.forEach((s) => formData.append("skills", s));

    // experiencia como array de objetos { title, project }
    if (form.experience) {
      try {
        const parsedExp = JSON.parse(form.experience);
        parsedExp.forEach((exp) => {
          formData.append("experience", JSON.stringify(exp));
        });
      } catch {
        setMsg("Formato inválido en experiencia");
      }
    }

    // socialLinks como array de objetos { platform, url }
    if (form.socialLinks) {
      try {
        const parsedLinks = JSON.parse(form.socialLinks);
        parsedLinks.forEach((link) => {
          formData.append("socialLinks", JSON.stringify(link));
        });
      } catch {
        setMsg("Formato inválido en redes sociales");
      }
    }

    try {
      await createUserProfile(formData);
      setMsg({ ok: true, text: "Perfil creado con éxito." });
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      setMsg({ ok: false, text: err.message || "Error al crear el perfil." });
    }
  };

  const toggleHabilidad = (h) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(h)
        ? prev.skills.filter((skill) => skill !== h)
        : [...prev.skills, h],
    }));
  };

  return (
    <div className="relative flex flex-col justify-center items-center w-full md:w-[60%] px-6 pt-10 pb-12 bg-conexia-soft">
      <div className="flex justify-end mb-4">
        <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} />
      </div>

      <div className="w-full bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 bg-white rounded shadow space-y-4">
          <div className="flex gap-4">
            <InputField label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <InputField label="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>

          <InputField label="Fecha de nacimiento" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} required />

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-conexia-green mb-1">Tipo de documento</label>
              <select
                value={form.documentTypeId}
                onChange={(e) => setForm({ ...form, documentTypeId: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Seleccionar</option>
                {documentTypes.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.name}
                  </option>
                ))}
              </select>
            </div>
            <InputField label="Número" value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} required />
          </div>

          <div className="flex gap-4">
            <InputField label="Teléfono" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            <InputField label="País" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <InputField label="Provincia" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>

          <div className="flex gap-4">
            <FileInput label="Foto perfil" onChange={(e) => handleFileChange(e, "profilePicture")} />
            <FileInput label="Foto portada" onChange={(e) => handleFileChange(e, "coverPicture")} />
          </div>

          <div>
            <label className="text-conexia-green text-sm font-medium">Habilidades</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {habilidadesDisponibles.map((h) => (
                <button
                  type="button"
                  key={h}
                  className={`px-3 py-1 rounded text-sm ${form.skills.includes(h) ? "bg-conexia-green text-white" : "bg-gray-200 text-gray-700"}`}
                  onClick={() => toggleHabilidad(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <TextArea label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <TextArea
            label='Experiencia'
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
          />

          <TextArea
            label='Redes sociales'
            value={form.socialLinks}
            onChange={(e) => setForm({ ...form, socialLinks: e.target.value })}
          />

          <button type="submit" className="w-full bg-conexia-green text-white py-2 rounded hover:bg-conexia-green/90">
            Crear perfil
          </button>

          {msg && <p className={`text-center mt-2 text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
        </form>
      </div>
    </div>
  );
}

function InputField({ label, type = "text", ...props }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>
      <input type={type} className="w-full border px-4 py-2 rounded" {...props} />
    </div>
  );
}

function FileInput({ label, ...props }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>
      <input type="file" accept="image/jpeg,image/png" className="w-full" {...props} />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>
      <textarea className="w-full border p-2 rounded" {...props} />
    </div>
  );
}

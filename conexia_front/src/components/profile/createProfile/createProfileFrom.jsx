// app/create-profile/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createUserProfile } from "@/service/profiles/profilesFetch";

export default function CreateProfileForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    descripcion: "",
    habilidades: [],
    experiencia: "",
    redes: "",
    fotoPerfil: null,
    fotoPortada: null,
  });

  const [msg, setMsg] = useState(null);
  const habilidadesDisponibles = ["Frontend", "Backend", "UX/UI", "DevOps", "Marketing", "Otra"];

  const handleFileChange = (e, campo) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024 && /image\/(jpeg|png)/.test(file.type)) {
      setForm({ ...form, [campo]: file });
    } else {
      setMsg({ ok: false, text: "Solo se permiten imágenes JPG/PNG de hasta 5MB." });
    }
  };

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.apellido || !form.fechaNacimiento) {
      return setMsg({ ok: false, text: "Nombre, apellido y fecha de nacimiento son obligatorios." });
    }

    if (calcularEdad(form.fechaNacimiento) < 18) {
      return setMsg({ ok: false, text: "Debes tener al menos 18 años para registrarte." });
    }

    const formData = new FormData();
    for (const key in form) {
      if (Array.isArray(form[key])) {
        form[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, form[key]);
      }
    }

    try {
      await createUserProfile(formData);
      setMsg({ ok: true, text: "Perfil creado con éxito." });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      setMsg({ ok: false, text: "Error al crear el perfil. Intentá nuevamente." });
    }
  };

  const toggleHabilidad = (habilidad) => {
    if (form.habilidades.includes(habilidad)) {
      setForm({ ...form, habilidades: form.habilidades.filter((h) => h !== habilidad) });
    } else {
      setForm({ ...form, habilidades: [...form.habilidades, habilidad] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-md mt-8">
      <h1 className="text-2xl font-bold text-conexia-green mb-4">Completa tu perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required />
        <input type="text" placeholder="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="input" required />
        <input type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} className="input" required />

        <label className="block text-sm font-medium">Foto de perfil</label>
        <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, "fotoPerfil")} className="input" />

        <label className="block text-sm font-medium">Foto de portada</label>
        <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, "fotoPortada")} className="input" />

        <label className="block text-sm font-medium">Habilidades</label>
        <div className="flex flex-wrap gap-2">
          {habilidadesDisponibles.map((h) => (
            <button
              key={h}
              type="button"
              className={`px-3 py-1 rounded border ${form.habilidades.includes(h) ? "bg-conexia-green text-white" : "bg-gray-100"}`}
              onClick={() => toggleHabilidad(h)}
            >
              {h}
            </button>
          ))}
        </div>

        <textarea
          maxLength={500}
          placeholder="Descripción personal (máx 500 caracteres)"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Experiencia (títulos, proyectos, etc.)"
          value={form.experiencia}
          onChange={(e) => setForm({ ...form, experiencia: e.target.value })}
          className="input"
        />

        <input
          type="text"
          placeholder="Redes sociales (opcional)"
          value={form.redes}
          onChange={(e) => setForm({ ...form, redes: e.target.value })}
          className="input"
        />

        <button type="submit" className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90">
          Crear perfil
        </button>

        {msg && <p className={`mt-2 text-sm text-center ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
      </form>
    </div>
  );
}

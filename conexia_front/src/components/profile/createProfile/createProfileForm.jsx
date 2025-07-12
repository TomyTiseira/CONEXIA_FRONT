// app/create-profile/page.js
"use client";

import { useState , useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createUserProfile , getDocumentTypes } from "@/service/profiles/profilesFetch";
import { validateImage } from "@/components/utils/validations/archivos";
import { calculateAge } from "@/components/utils/validations/fechas";

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
  const [documentTypes, setDocumentTypes] = useState([]);

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

// ...

if (calculateAge(form.fechaNacimiento) < 18) {
  return setMsg({ ok: false, text: "Debes tener al menos 18 años para registrarte." });
}

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (calcularEdad(form.fechaNacimiento) < 18) {
      return setMsg({ ok: false, text: "Debes tener al menos 18 años para registrarte." });
    }

    if (!form.nombre || !form.apellido || !form.fechaNacimiento || !form.tipoDocumento || !form.numeroDocumento) {
      return setMsg({ ok: false, text: "Por favor completá todos los campos obligatorios." });
    }

    const formData = new FormData();
    for (const key in form) {
      if (Array.isArray(form[key])) {
        form[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, form[key]);
      }
    }

    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
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
    <div className="relative flex flex-col justify-center items-center w-full md:w-[60%] px-6 pt-10 pb-12 bg-conexia-soft">
      <div className="flex justify-end mb-4">
        <Image src="/logo-conexia.png" alt="Logo" width={100} height={40} />
      </div>

      <div className="w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className=" text-center text-2xl font-bold text-conexia-green mb-4">Completa tu perfil</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <InputField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="w-1/2">
              <InputField label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
            </div>
          </div> 

           <InputField label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} required />

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-conexia-green mb-1">Tipo de documento</label>
              <select
                value={form.tipoDocumento}
                onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40"
              >
                {
                  documentTypes.length === 0 ? (
                    <option value="" disabled>Cargando tipos de documento...</option>
                  ) : (
                    <>
                      <option value="">Seleccionar</option>
                      {
                      documentTypes.map((tipo) => (
                        <option key={tipo.id} value={tipo.name}>{tipo.name}</option>
                      ))}
                    </>
                  )
                }
              </select>
            </div>

            <div className="w-full md:w-1/2">
              <InputField
                label="Número de documento"
                value={form.numeroDocumento}
                onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <FileInput label="Foto de perfil" onChange={(e) => handleFileChange(e, "fotoPerfil")} />
            </div>
            <div className="w-1/2">
              <FileInput label="Foto de portada" onChange={(e) => handleFileChange(e, "fotoPortada")} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-conexia-green mb-1">Habilidades</label>
            <div className="flex flex-wrap gap-2">
              {habilidadesDisponibles.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={`px-3 py-1 rounded border text-sm font-medium ${form.habilidades.includes(h) ? "bg-conexia-green text-white" : "bg-gray-100 text-gray-700"}`}
                  onClick={() => toggleHabilidad(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <TextArea label="Descripción personal" maxLength={500} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

          <InputField label="Experiencia" value={form.experiencia} onChange={(e) => setForm({ ...form, experiencia: e.target.value })} />
          <InputField label="Redes sociales (opcional)" value={form.redes} onChange={(e) => setForm({ ...form, redes: e.target.value })} />

          <button type="submit" className="w-full bg-conexia-green text-white py-2 rounded font-semibold hover:bg-conexia-green/90">
            Crear perfil
          </button>

          {msg && <p className={`mt-2 text-sm text-center ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
        </form>
      </div>
    </div>
  );
}

function InputField({ label, type = "text", ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>
      <input
        type={type}
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40"
        {...props}
      />
    </div>
  );
}

function FileInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>
      <input type="file" accept="image/png, image/jpeg" className="w-full" {...props} />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-conexia-green mb-1">{label}</label>
      <textarea
        className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40"
        {...props}
      />
    </div>
  );
}
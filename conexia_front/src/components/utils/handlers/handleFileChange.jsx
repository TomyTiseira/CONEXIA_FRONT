import { validateImage } from "../validations/archivos";

export const handleFileChange = (e, campo, form, setForm, setMsg) => {
  const file = e.target.files[0];
  if (validateImage(file)) {
    setForm({ ...form, [campo]: file });
  } else {
    setMsg({ ok: false, text: "Solo se permiten imágenes JPG/PNG de hasta 5MB." });
  }
};

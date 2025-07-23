export function removeItemFromFormArray(form, setForm, field, index) {
  const updatedArray = form[field].filter((_, i) => i !== index);
  setForm({ ...form, [field]: updatedArray });
}

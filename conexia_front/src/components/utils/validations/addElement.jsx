// utils/formUtils.js (opcional)
export const handleDynamicFieldChange = (form, setForm, fieldName, index, key, value) => {
  console.log(form)
  console.log(fieldName)
  const updatedArray = [...form[fieldName]];
  updatedArray[index][key] = value;
  setForm({ ...form, [fieldName]: updatedArray });
};

export const validateDynamicField = (array, requiredFields = []) => {
  if (!array || array.length === 0) return false;

  array = Array.isArray(array) ? array : [array]; // Asegurarse de que sea un array
  return array.every((item) =>
    requiredFields.every((field) => item[field] && item[field].trim() !== "")
  );
};

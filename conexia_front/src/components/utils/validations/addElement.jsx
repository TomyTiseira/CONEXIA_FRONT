// utils/formUtils.js (opcional)
export const handleDynamicFieldChange = (form, setForm, fieldName, index, key, value) => {
  const updatedArray = [...form[fieldName]];
  updatedArray[index][key] = value;
  setForm({ ...form, [fieldName]: updatedArray });
};

export const validateDynamicField = (array, requiredFields = []) => {
  if (!array || array.length === 0) return false;

  return array.every((item) =>
    requiredFields.every((field) => item[field] && item[field].trim() !== "")
  );
};

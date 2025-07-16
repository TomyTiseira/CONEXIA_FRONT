// utils/formUtils.js (opcional)
export const handleDynamicFieldChange = (form, setForm, fieldName, index, key, value) => {
  const updatedArray = [...form[fieldName]];
  updatedArray[index][key] = value;
  setForm({ ...form, [fieldName]: updatedArray });
};

export const validateDynamicField = (item, requiredFields) => {
  return requiredFields.every((field) => item[field]?.trim());
};
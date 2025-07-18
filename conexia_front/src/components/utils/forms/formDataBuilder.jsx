export const buildProfileFormData = (form, updatedExperience) => {
  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (key === "experience") {
        formData.set(key, JSON.stringify(updatedExperience));
      } else {
        formData.set(key, JSON.stringify(value));
      }
    } else if (value instanceof File) {
      formData.set(key, value);
    } else if (typeof value === "number") {
      formData.set(key, value.toString());
    } else if (value !== null && value !== undefined) {
      formData.set(key, value);
    }
  });

  return formData;
};

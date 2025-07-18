import { isValidURL } from "./urls";

export const validateSocialLink = ({ platform, url }) => {
  if ((platform && !url) || (!platform && url)) {
    return { valid: false, error: "Completá plataforma y URL." };
  }
  if (url && !isValidURL(url)) {
    return { valid: false, error: "Ingresá una URL válida." };
  }
  return { valid: true };
};

export const validateAllSocialLinks = (links) => {
  for (const link of links) {
    const result = validateSocialLink(link);
    if (!result.valid) return result;
  }
  return { valid: true };
};

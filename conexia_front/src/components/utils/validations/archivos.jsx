export function validateImage(file) {
  return (
    file &&
    file.size <= 5 * 1024 * 1024 &&
    /image\/(jpeg|png)/.test(file.type)
  );
}
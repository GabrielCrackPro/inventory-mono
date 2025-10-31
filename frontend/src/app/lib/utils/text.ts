export function capitalizeFirstLetter(string: string) {
  if (string.length <= 2) return string;

  return string.charAt(0).toUpperCase() + string.slice(1);
}

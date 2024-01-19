const DEFAULT_DESCRIPTION = "No Description provided";
export function truncateString(str, limit) {
  const words = str?.split(" ");
  if (words?.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }
  if (str == "" || str == null) {
    return DEFAULT_DESCRIPTION;
  }
  return str;
}

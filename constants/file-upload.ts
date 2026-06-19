export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * Reads a single file from an <input type="file"> change event, enforces the
 * 25 MB limit, and hands the validated file (or null) to `setter`.
 */
export function handleFileUpload(
  event: React.ChangeEvent<HTMLInputElement>,
  setter: (file: File | null) => void,
) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    alert("File size exceeds 25MB limit.");
    return;
  }

  setter(file);
}
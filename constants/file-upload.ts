export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/** Human readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Returns true when the file matches the `accept` string (same syntax as the
 * native input `accept` attribute: comma separated list of extensions like
 * ".pdf" and/or MIME types like "image/*"). An empty/undefined accept matches
 * everything.
 */
export function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || !accept.trim()) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .some((token) => {
      if (token.startsWith(".")) return name.endsWith(token);
      if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
}

/**
 * Detects ZIP archives by name/MIME. Deliberately matches only genuine `.zip`
 * files — OOXML docs (.docx/.xlsx/.pptx) are ZIP containers too, so this checks
 * the extension/MIME rather than the PK magic bytes to avoid flagging them.
 */
export function isZipFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    name.endsWith(".zip") ||
    type === "application/zip" ||
    type === "application/x-zip-compressed" ||
    type === "multipart/x-zip"
  );
}

/**
 * Best-effort, dependency-free detection of password protected / encrypted
 * files. Catches the common office & PDF cases users hit in practice:
 *   - Encrypted OOXML (.docx/.xlsx/.pptx wrapped in an MS-OFFCRYPTO OLE2 container)
 *   - ZIP based files with the encryption general-purpose flag set
 *   - PDFs carrying an /Encrypt entry in their trailer
 * Returns false when it cannot positively identify encryption.
 */
export async function isFileEncrypted(file: File): Promise<boolean> {
  try {
    const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const name = file.name.toLowerCase();

    // OLE2 / Compound File Binary magic: D0 CF 11 E0 A1 B1 1A E1
    const CFB = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
    const isCFB = CFB.every((b, i) => header[i] === b);
    // Modern office docs are ZIP archives; if one arrives as an OLE2 container
    // it is an encrypted (password protected) OOXML package.
    if (isCFB && /\.(docx|xlsx|pptx)$/.test(name)) return true;

    // ZIP (PK\x03\x04): inspect the general purpose bit flag of the first
    // local file header — bit 0 signals the entry is encrypted.
    if (header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04) {
      const flag = new Uint8Array(await file.slice(6, 8).arrayBuffer());
      const gpFlag = flag[0] | (flag[1] << 8);
      if (gpFlag & 0x0001) return true;
    }

    // PDF (%PDF): a /Encrypt reference in the trailer means it is encrypted.
    if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
      const tailSize = Math.min(file.size, 8192);
      const tail = await file.slice(Math.max(0, file.size - tailSize)).text();
      if (/\/Encrypt\b/.test(tail)) return true;
      if (file.size < 5 * 1024 * 1024) {
        const whole = await file.text();
        if (/\/Encrypt\s+\d+\s+\d+\s+R/.test(whole)) return true;
      }
    }
  } catch {
    // If we cannot read the bytes we err on the side of allowing the file;
    // the backend remains the source of truth for rejection.
  }
  return false;
}

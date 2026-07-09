import { toast as baseToast } from "react-hot-toast";

export const AUTH_ERROR_TOAST_ID = "api-auth-error";
export const AUTH_ERROR_MESSAGE =
  "You are not authorized to access this resource.";

// When an authenticated API call returns 401/403 we surface a single global
// "not authorized" message. Any page-specific "failed" toast fired while
// handling that same request should be swallowed so the auth message shows
// instead of it (not alongside it).
let suppressGenericErrors = false;

export function showAuthErrorToast() {
  baseToast.error(AUTH_ERROR_MESSAGE, { id: AUTH_ERROR_TOAST_ID });
  suppressGenericErrors = true;
  // Release on the next macrotask, after the failed request's error handlers
  // (which run as microtasks) have had a chance to fire.
  setTimeout(() => {
    suppressGenericErrors = false;
  }, 0);
}

const error: typeof baseToast.error = (message, options) => {
  if (suppressGenericErrors && options?.id !== AUTH_ERROR_TOAST_ID) {
    // If this error was meant to replace a loading toast, clear it so the
    // spinner doesn't hang — but withhold the page-specific failure message.
    if (options?.id) baseToast.dismiss(options.id);
    return AUTH_ERROR_TOAST_ID;
  }
  return baseToast.error(message, options);
};

// Drop-in replacement for react-hot-toast's default export: same callable and
// same methods, with only `error` wrapped for the suppression behaviour above.
const toast = Object.assign(
  (...args: Parameters<typeof baseToast>) => baseToast(...args),
  baseToast,
  { error },
) as typeof baseToast;

export default toast;

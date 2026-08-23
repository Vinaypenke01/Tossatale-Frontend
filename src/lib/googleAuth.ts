/**
 * src/lib/googleAuth.ts
 * Centralized Google Identity Services manager.
 * Prevents multiple google.accounts.id.initialize() calls and handles dynamic callbacks.
 */

type GoogleCredentialCallback = (response: { credential?: string }) => void;

let isInitialized = false;
let currentCallback: GoogleCredentialCallback | null = null;

export const GOOGLE_CLIENT_ID =
  (import.meta.env as Record<string, string>)["VITE_GOOGLE_CLIENT_ID"] ||
  "994213208335-fpqa9rm8h4pav9mcsaer73j2omr3quek.apps.googleusercontent.com";

/**
 * Register the active callback and initialize Google Identity once.
 */
export function setupGoogleAuth(onCredential: GoogleCredentialCallback): boolean {
  currentCallback = onCredential;

  if (typeof window === "undefined" || !(window as any).google?.accounts?.id) {
    return false;
  }

  if (!isInitialized) {
    try {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res: { credential?: string }) => {
          if (currentCallback) {
            currentCallback(res);
          }
        },
      });
      isInitialized = true;
    } catch (e) {
      console.warn("Google initialization deferred:", e);
      return false;
    }
  }

  return true;
}

/**
 * Render Google Sign-In button into a container element.
 */
export function renderGoogleButton(
  container: HTMLElement,
  options: {
    theme?: "outline" | "filled_blue" | "filled_black";
    size?: "large" | "medium" | "small";
    width?: number;
    text?: "signin_with" | "signup_with" | "continue_with" | "signin";
    shape?: "rectangular" | "pill" | "circle" | "square";
  } = {}
) {
  if (typeof window === "undefined" || !(window as any).google?.accounts?.id) {
    return;
  }

  try {
    container.innerHTML = "";
    (window as any).google.accounts.id.renderButton(container, {
      theme: options.theme || "outline",
      size: options.size || "large",
      width: options.width || 320,
      text: options.text || "signin_with",
      shape: options.shape || "pill",
    });
  } catch (e) {
    console.warn("Failed to render Google button:", e);
  }
}

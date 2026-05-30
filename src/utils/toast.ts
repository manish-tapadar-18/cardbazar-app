type AppToastType = "success" | "danger" | "warning" | "normal";

type ToastOptions = {
  duration?: number;
  placement?: "top" | "bottom" | "center";
};

interface ToastHandler {
  show: (message: string, options?: any) => void;
}

let toast: ToastHandler | null = null;

export const setToast = (toastInstance: ToastHandler) => {
  toast = toastInstance;
};

const showToast = (
  message: string,
  type: AppToastType,
  options?: ToastOptions
) => {

  if (!toast) return;

  toast.show(message, {
    type,
    placement: options?.placement ?? "top",
    duration: options?.duration ?? 3000,
  });
};

export const Toast = {
  success: (message: string, options?: ToastOptions) =>
    showToast(message, "success", options),

  error: (message: string, options?: ToastOptions) =>
    showToast(message, "danger", options),

  warning: (message: string, options?: ToastOptions) =>
    showToast(message, "warning", options),

  info: (message: string, options?: ToastOptions) =>
    showToast(message, "normal", options),
};

import toast from 'react-hot-toast';

/**
 * Toast notification utility with consistent styling
 */

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#fff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10b981',
    },
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#fff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '8px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#ef4444',
    },
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '8px',
    },
  });
};

export const showWarning = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#f59e0b',
      color: '#fff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '8px',
    },
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#6366f1',
      color: '#fff',
      fontWeight: '500',
      padding: '16px',
      borderRadius: '8px',
    },
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  loading: showLoading,
  dismiss: dismissToast,
};

import Swal from 'sweetalert2';

const customSwal = Swal.mixin({
  background: '#0d1322',
  color: '#f8fafc',
  confirmButtonColor: '#f59e0b',
  cancelButtonColor: '#334155',
  customClass: {
    popup: 'swal2-glass-popup',
    title: 'swal2-gold-title',
    confirmButton: 'swal2-gold-confirm',
    cancelButton: 'swal2-dark-cancel',
    input: 'swal2-custom-input'
  }
});

export const showSuccess = (title, text = '') => {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    timer: 2500,
    showConfirmButton: false,
    timerProgressBar: true
  });
};

export const showError = (title, text = '') => {
  return customSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Understood'
  });
};

export const showWarning = (title, text = '') => {
  return customSwal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'Ok'
  });
};

export const confirmAction = async (title, text, confirmButtonText = 'Yes, proceed!') => {
  const result = await customSwal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true
  });
  return result.isConfirmed;
};

export const promptReason = async (title, placeholder = 'Enter reason note...') => {
  const result = await customSwal.fire({
    title,
    input: 'text',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'You must enter a reason!';
      }
    }
  });
  return result.isConfirmed ? result.value : null;
};

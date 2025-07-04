import Swal from 'sweetalert2';

// Función para mostrar un mensaje de éxito
export const showSuccessAlert = (title: string, text: string) => {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
};

// Función para mostrar un mensaje de error
export const showErrorAlert = (title: string, text: string) => {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonText: 'Cerrar'
    });
};

// Función para mostrar una alerta de confirmación
export const showConfirmAlert = async (title: string, text: string, confirmButtonText: string = 'Sí, continuar', cancelButtonText: string = 'Cancelar') => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText
    });
    return result.isConfirmed;
};

// Puedes añadir más funciones (info, warning.)
export const showInfoAlert = (title: string, text: string) => {
    Swal.fire({
        title: title,
        text: text,
        icon: 'info',
        confirmButtonText: 'Aceptar'
    });
};
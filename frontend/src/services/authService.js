import api from './api';

function login(email, password) {
    return api.post('auth/login', { email, password })
        .then(response => {
            // El backend devuelve un objeto con el token y el nombre del usuario
            const { token, nombre, foto_perfil } = response.data;
            return { token, nombre, foto_perfil };
        })
        .catch(error => {
            console.error('Error en el login:', error);
            throw error; // Propaga el error para que pueda ser manejado por el componente
        });
}

export default { login };

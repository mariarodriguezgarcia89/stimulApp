// Servicio de autenticación: login, registro y comprobación de email duplicado
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

function registro(datos) {
    return api.post('auth/register', datos) 
    .catch(error => {
        console.error('Error en el registro:', error);
        throw error;
    });
}

function checkEmail(email) {
    return api.get('auth/check-email', { params: { email } })
        .then(response => response.data.exists)
        .catch(error => {
            console.error('Error al comprobar email:', error);
            throw error;
        });
}

export default { login, registro, checkEmail };

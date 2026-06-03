// Servicio de autenticación: login, registro y comprobación de email duplicado
import api from './api';

function login(email, password) {
    return api.post('auth/login', { email, password })
        .then(response => {
            const { token, nombre, foto_perfil } = response.data;
            return { token, nombre, foto_perfil };
        })
        .catch(error => {
            console.error('Error en el login:', error);
            throw error;
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

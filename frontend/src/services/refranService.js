// Servicio de refranes: obtiene una selección aleatoria de refranes para la partida
import api from './api';

function obtenerRefranes(){
    return api.get('/refranes/partida')
    .then(res => res.data)
    .catch(err => {
        console.error('Error al obtener los refranes:', err);
        throw err;
    });
}

export default { obtenerRefranes };
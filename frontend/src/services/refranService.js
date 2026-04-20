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
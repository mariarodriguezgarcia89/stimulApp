import api from './api';

function obtenerIntrusos(nivel){
    return api.get('/intrusos/partida', { params: { nivel } })
    .then(res => res.data)
    .catch(err => {
        console.error('Error al obtener los intrusos:', err);
        throw err;
    });
}

export default { obtenerIntrusos };
import api from './api';

function guardarPartida(datos){
    return api.post('/partidas/nueva-partida', datos)
    .then(res => res.data)
    .catch(err => {
        console.error('Error al guardar la partida:', err);
        throw err;
    });

}

export default { guardarPartida };
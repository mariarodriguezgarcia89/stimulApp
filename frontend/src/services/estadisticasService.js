import api from './api';

function getResumen() {
    return api.get('/estadisticas/resumen').then(res => res.data);
}

function getEvolucion(juegoId) {
    return api.get('/estadisticas/evolucion', {
        params: { juego_id: juegoId }
    }).then(res => res.data);
}

function getTendencia(juegoId) {
    return api.get('/estadisticas/tendencia', {
        params: { juego_id: juegoId }
    }).then(res => res.data);
}

function getDashboard() {
    return api.get('/estadisticas/dashboard').then(res => res.data);
}
export default { getResumen, getEvolucion, getTendencia, getDashboard };
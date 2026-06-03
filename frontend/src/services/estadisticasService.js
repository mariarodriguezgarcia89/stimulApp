// Servicio de estadísticas: resumen por juego, evolución histórica, tendencia y dashboard general
import api from './api';

function obtenerResumen() {
    return api.get('/estadisticas/resumen').then(res => res.data);
}

function obtenerEvolucion(juegoId) {
    return api.get('/estadisticas/evolucion', {
        params: { juego_id: juegoId }
    }).then(res => res.data);
}

function obtenerTendencia(juegoId) {
    return api.get('/estadisticas/tendencia', {
        params: { juego_id: juegoId }
    }).then(res => res.data);
}

function obtenerDashboard() {
    return api.get('/estadisticas/dashboard').then(res => res.data);
}

export default { obtenerResumen, obtenerEvolucion, obtenerTendencia, obtenerDashboard };

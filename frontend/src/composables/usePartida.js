import partidaService from '@/services/partidaService'

export function usePartida() {

    function finalizarPartida(juego_id, puntuacion, duracion_segundos, nivel, mostrarModalFin) {
        partidaService.guardarPartida({
            juego_id: juego_id,
            puntuacion: puntuacion,
            duracion_segundos: duracion_segundos,
            nivel: nivel,
            completada: true
        })

        mostrarModalFin.value = true
    }

        return {
            finalizarPartida
        }   
}




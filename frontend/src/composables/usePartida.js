import partidaService from '@/services/partidaService'

export function usePartida() {

    async function finalizarPartida(juego_id, puntuacion, duracion_segundos, nivel, mostrarModalFin) {
        try {
            await partidaService.guardarPartida({
                juego_id: juego_id,
                puntuacion: puntuacion,
                duracion_segundos: duracion_segundos,
                nivel: nivel,
                completada: true
            })
        } catch (error) {
            console.error('Error al guardar la partida:', error)
        } finally {
            mostrarModalFin.value = true
        }
    }

    return { finalizarPartida }
}
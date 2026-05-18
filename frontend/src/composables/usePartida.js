import { ref } from 'vue'
import partidaService from '@/services/partidaService'
import estadisticasService from '@/services/estadisticasService'

export function usePartida() {
    const puntuacionHistorica = ref(null)

    async function finalizarPartida(juego_id, puntuacion, duracion_segundos, nivel, mostrarModalFin) {
        try {
            await partidaService.guardarPartida({
                juego_id,
                puntuacion,
                duracion_segundos,
                nivel,
                completada: true
            })
        } catch (error) {
            console.error('Error al guardar la partida:', error)
        }

        // Fetch historical average after saving so the backend has the latest data
        try {
            const resumen = await estadisticasService.getResumen()
            const juego = resumen.find(r => r.juego_id === juego_id)
            puntuacionHistorica.value = juego?.puntuacion_media != null
                ? Math.round(juego.puntuacion_media)
                : null
        } catch {
            puntuacionHistorica.value = null
        }

        mostrarModalFin.value = true
    }

    return { finalizarPartida, puntuacionHistorica }
}

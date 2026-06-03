// Composable compartido por los tres juegos: guarda la partida y recupera la media histórica
import { ref } from 'vue'
import partidaService from '@/services/partidaService'
import estadisticasService from '@/services/estadisticasService'

export function usePartida() {
    const puntuacionHistorica = ref(null)

    // Guarda la partida en el backend y obtiene la puntuación media histórica para mostrarla en el modal de fin
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

        // Obtiene la media histórica tras guardar para mostrarla en el modal de fin de partida
        try {
            const resumen = await estadisticasService.obtenerResumen()
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

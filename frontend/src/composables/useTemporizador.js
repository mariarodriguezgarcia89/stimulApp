// Composable reutilizable para gestionar el temporizador de cuenta atrás en los juegos
import { ref } from 'vue'

export function useTemporizador(tiempoInicial = 30) {
    const tiempoRestante = ref(tiempoInicial)
    const tiempoGuardado = ref(tiempoInicial)
    let temporizador = null

    // Inicia (o reinicia) el contador; llama a onTiempoAgotado cuando llega a 0
    function iniciarTemporizador(onTiempoAgotado, desde = tiempoInicial) {
        tiempoRestante.value = desde
        clearInterval(temporizador)
        temporizador = setInterval(() => {
            tiempoRestante.value--
            if (tiempoRestante.value <= 0) {
                clearInterval(temporizador)
                onTiempoAgotado()
            }
        }, 1000)
    }

    // Pausa el contador guardando el tiempo restante para poder reanudarlo
    function pausarTemporizador() {
        tiempoGuardado.value = tiempoRestante.value
        clearInterval(temporizador)
    }

    // Detiene el contador sin guardar estado (fin de partida o salida)
    function detenerTemporizador() {
        clearInterval(temporizador)
    }

    return {
        tiempoRestante,
        tiempoGuardado,
        iniciarTemporizador,
        pausarTemporizador,
        detenerTemporizador
    }
}
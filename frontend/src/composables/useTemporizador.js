// useTemporizador.js
import { ref } from 'vue'

export function useTemporizador(tiempoInicial = 30) {
    const tiempoRestante = ref(tiempoInicial)
    const tiempoGuardado = ref(tiempoInicial)
    let temporizador = null

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

    function pausarTemporizador() {
        tiempoGuardado.value = tiempoRestante.value
        clearInterval(temporizador)
    }

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
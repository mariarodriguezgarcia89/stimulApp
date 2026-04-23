<script setup>
import ModalSalir from '@/components/shared/ModalSalir.vue'
import ModalFinPartida from '@/components/shared/ModalFinPartida.vue'
import { usePartida } from '@/composables/usePartida'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import cartaReverso from '@/assets/carta-reverso.png'

const { finalizarPartida } = usePartida()
const route = useRoute()
const router = useRouter()

let temporizador = null
const cartas = ref([])
const cartasVolteadas = ref([])
const puntos = ref(0)
const tiempoRestante = ref(30)
const mostrarModalSalir = ref(false)
const mostrarModalFin = ref(false)
const fechaInicio = ref(null)
const dificultad = route.query.dificultad
const bloqueado = ref(false)
const fallos = ref(0)
const acertados = ref(0)

const EMOJIS_FACIL = ['🍎', '🚗', '🐶', '🎵']
const EMOJIS_DIFICIL = ['🍎', '🚗', '🐶', '🎵', '⚽', '📚', '🌟', '🏆']

function generarCartas() {
    const emojis = dificultad === 'facil' ? EMOJIS_FACIL : EMOJIS_DIFICIL

    const pares = emojis.flatMap((emoji, index) => [
        { id: index * 2,     valor: emoji, visible: false, emparejada: false },
        { id: index * 2 + 1, valor: emoji, visible: false, emparejada: false }
    ])

    cartas.value = pares.sort(() => Math.random() - 0.5)
}

onMounted(() => {
    generarCartas()
    cartas.value.forEach(carta => carta.visible = true)
    setTimeout(() => {
        cartas.value.forEach(carta => carta.visible = false)
    }, 3000)

    fechaInicio.value = Date.now()
    if (dificultad === 'dificil') iniciarTemporizador()
})

function iniciarTemporizador() {
    tiempoRestante.value = 30
    clearInterval(temporizador)
    temporizador = setInterval(() => {
        tiempoRestante.value--
        if (tiempoRestante.value <= 0) {
            clearInterval(temporizador)
            const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
                finalizarPartida(3, puntos.value, duracion, dificultad, mostrarModalFin)
        }
    }, 1000)
}

function voltearCarta(carta){

    if (bloqueado.value === true){
        return 
    }
    if (carta.emparejada === true){
        return 
    }
    if (carta.visible === true){
        return 
    }

    carta.visible = true
    cartasVolteadas.value.push(carta)

    if (cartasVolteadas.value.length === 2) {
        const carta1 = cartasVolteadas.value[0]
        const carta2 = cartasVolteadas.value[1]
        
        if (carta1.valor === carta2.valor) {
            carta1.emparejada = true
            carta2.emparejada = true
            acertados.value++
            puntos.value += 10
            const totalParejas = dificultad === 'facil' ? 4 : 8
            if (acertados.value === totalParejas) {
                const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
                finalizarPartida(3, puntos.value, duracion, dificultad, mostrarModalFin)
            }
            cartasVolteadas.value = []
        } else {
            bloqueado.value = true
                setTimeout(() => {
                    carta1.visible = false
                    carta2.visible = false
                    fallos.value++
                    puntos.value -= 3
                    cartasVolteadas.value = []
                    bloqueado.value = false
                }, 1000)
        }
    }

    }

    function jugarOtraVez() {
    puntos.value = 0
    fallos.value = 0
    acertados.value = 0
    cartasVolteadas.value = []
    bloqueado.value = false
    mostrarModalFin.value = false
    clearInterval(temporizador)
    generarCartas()
    cartas.value.forEach(carta => carta.visible = true)
    setTimeout(() => {
        cartas.value.forEach(carta => carta.visible = false)
    }, 3000)
    fechaInicio.value = Date.now()
    if (dificultad === 'dificil') iniciarTemporizador()
}


</script>
<template>
    <div class="memory-container">

        <div class="caja cabecera-juego">
            <div class="juego-cabecera">
                <div class="cabecera-izquierda">
                    <h1>🧠 Juego de Memoria</h1>
                    <div class="info">
                        <span>Puntos: <strong>{{ puntos }}</strong></span>
                        <span v-if="dificultad === 'dificil'"
                              :class="['temporizador', { urgente: tiempoRestante <= 10 }]">
                            ⏱ {{ tiempoRestante }}s
                        </span>
                    </div>
                </div>
                <button class="btn-salir" @click="mostrarModalSalir = true">✕ Salir</button>
            </div>
        </div>

        <div class="tablero-container">
            <div class="tablero">
                <div 
                    v-for="carta in cartas" 
                    :key="carta.id" 
                    class="carta" 
                    :class="{ visible: carta.visible, emparejada: carta.emparejada }"
                    @click="voltearCarta(carta)"
                >
                    <img v-if="!carta.visible && !carta.emparejada" :src="cartaReverso" class="carta-img" />
                    <span v-else>{{ carta.valor }}</span>
                </div>
            </div>
        </div>

        <ModalSalir v-if="mostrarModalSalir" 
            @confirmar="router.push('/menu')" 
            @cancelar="mostrarModalSalir = false" 
        />
        <ModalFinPartida 
            v-if="mostrarModalFin" 
            :puntos="puntos" 
            :acertados="acertados" 
            :total="dificultad === 'facil' ? 4 : 8" 
            :saltados="null"
            :puntuacionHistorica="0"
            @cerrar="router.push('/menu')"
            @jugarOtraVez="jugarOtraVez"
        />

    </div>
</template>

<style scoped>
.memory-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 30px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cabecera-izquierda {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cabecera-juego {
  padding: 20px 28px;
  border-top: 6px solid var(--color-principal);
}

.tablero {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
}

.carta {
  background-color: var(--color-principal);
  border-radius: 12px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s;
}

.carta:hover:not(.emparejada) {
  transform: scale(1.04);
}

.carta.visible,
.carta.emparejada {
  background-color: #d4edda;
  border: 2px solid #28a745;
}

.carta.emparejada {
  cursor: default;
}

.carta-img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.info {
  display: flex;
  gap: 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--color-texto);
}

h1 {
  font-size: 1.6rem;
  color: var(--color-principal);
  font-weight: 700;
}
</style>
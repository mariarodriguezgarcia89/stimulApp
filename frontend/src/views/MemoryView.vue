<script setup>
import ModalSalir from '@/components/modals/ModalSalir.vue'
import ModalFinPartida from '@/components/modals/ModalFinPartida.vue'
import { usePartida } from '@/composables/usePartida'
import { useTemporizador } from '@/composables/useTemporizador'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import cartaReverso from '@/assets/carta-reverso.png'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ModalAyuda from '@/components/modals/ModalAyuda.vue'
import fondoMemory from '@/assets/fondo-memory.png'
import { PUNTOS_ACIERTO, UMBRAL_TIEMPO_URGENTE, PUNTOS_PENALIZACION } from '@/utils/constantes.js'
import { instruccionesMemoryFacil, instruccionesMemoryDificil, elementosTableroMemory } from '@/utils/mensajes.js'

const { finalizarPartida } = usePartida()
const route = useRoute()
const router = useRouter()
const { tiempoRestante, tiempoGuardado, iniciarTemporizador, pausarTemporizador, detenerTemporizador } = useTemporizador(60)
const cartas = ref([])
const cartasVolteadas = ref([])
const puntos = ref(0)
const mostrarModalSalir = ref(false)
const mostrarModalFin = ref(false)
const fechaInicio = ref(null)
const dificultad = route.query.dificultad
const bloqueado = ref(false)
const fallos = ref(0)
const acertados = ref(0)

const mostrarModalAyuda = ref(true)
const instruccionesMemory = dificultad === 'facil' ? instruccionesMemoryFacil : instruccionesMemoryDificil
const elementosTablero = elementosTableroMemory(dificultad)

const totalParejas = dificultad === 'facil' ? 4 : 8

const EMOJIS_FACIL = ['🍎', '🚗', '🐶', '🎵']
const EMOJIS_DIFICIL = ['🍎', '🚗', '🐶', '🎵', '⚽', '📚', '🌟', '🏆']

function onTiempoAgotado() {
    const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
    finalizarPartida(3, puntos.value, duracion, dificultad, mostrarModalFin)
}

function generarCartas() {
    const emojis = dificultad === 'facil' ? EMOJIS_FACIL : EMOJIS_DIFICIL
    const pares = emojis.flatMap((emoji, index) => [
        { id: index * 2,     valor: emoji, visible: false, emparejada: false, incorrecta: false },
        { id: index * 2 + 1, valor: emoji, visible: false, emparejada: false, incorrecta: false }
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
    if (dificultad === 'dificil') iniciarTemporizador(onTiempoAgotado)
})

onUnmounted(() => detenerTemporizador())

function abrirModalSalir() {
    pausarTemporizador()
    mostrarModalSalir.value = true
}

function abrirModalAyuda() {
    pausarTemporizador()
    mostrarModalAyuda.value = true
}

function reanudarTemporizador() {
    iniciarTemporizador(onTiempoAgotado, tiempoGuardado.value)
}

function voltearCarta(carta) {
    if (bloqueado.value) return
    if (carta.emparejada) return
    if (carta.visible) return

    carta.visible = true
    cartasVolteadas.value.push(carta)

    if (cartasVolteadas.value.length === 2) {
        const carta1 = cartasVolteadas.value[0]
        const carta2 = cartasVolteadas.value[1]

        if (carta1.valor === carta2.valor) {
            carta1.emparejada = true
            carta2.emparejada = true
            acertados.value++
            puntos.value += PUNTOS_ACIERTO
            if (acertados.value === totalParejas) {
                detenerTemporizador()
                const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
                finalizarPartida(3, puntos.value, duracion, dificultad, mostrarModalFin)
            }
            cartasVolteadas.value = []
        } else {
            bloqueado.value = true
            carta1.incorrecta = true
            carta2.incorrecta = true
            setTimeout(() => {
                carta1.visible = false
                carta2.visible = false
                carta1.incorrecta = false
                carta2.incorrecta = false
                fallos.value++
                puntos.value = Math.max(0, puntos.value - PUNTOS_PENALIZACION)
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
    detenerTemporizador()
    generarCartas()
    cartas.value.forEach(carta => carta.visible = true)
    setTimeout(() => {
        cartas.value.forEach(carta => carta.visible = false)
    }, 3000)
    fechaInicio.value = Date.now()
    if (dificultad === 'dificil') iniciarTemporizador(onTiempoAgotado)
}
</script>

<template>
  <div class="memory-page">

    <AppTopbar :modoJuego="true" />

    <div class="ilustracion-wrapper">
      <img :src="fondoMemory" alt="" aria-hidden="true" class="ilustracion" />
    </div>

    <div class="memory-container">

      <!-- TABLERO DE DATOS -->
      <div class="tablero" :class="{ 'tablero--dificil': dificultad === 'dificil' }">
        <div class="tablero-dato">
          <span class="tablero-icono">✅</span>
          <span class="tablero-valor">{{ acertados }}/{{ totalParejas }}</span>
          <span class="tablero-etiqueta">Aciertos</span>
        </div>
        <div class="tablero-dato">
          <span class="tablero-icono">⭐</span>
          <span class="tablero-valor">{{ puntos }}</span>
          <span class="tablero-etiqueta">Puntos</span>
        </div>
        <div class="tablero-dato">
          <span class="tablero-icono">❌</span>
          <span class="tablero-valor">{{ fallos }}</span>
          <span class="tablero-etiqueta">Fallos</span>
        </div>
        <div class="tablero-dato" v-if="dificultad === 'dificil'">
          <span class="tablero-icono">⏱</span>
          <span class="tablero-valor" :class="{ 'tiempo-urgente': tiempoRestante <= UMBRAL_TIEMPO_URGENTE }">{{ tiempoRestante }}s</span>
          <span class="tablero-etiqueta">Tiempo</span>
        </div>
        <button class="tablero-salir" @click="abrirModalSalir">✕ <span>Salir</span></button>
        <button class="tablero-ayuda" @click="abrirModalAyuda">❓ <span>Ayuda</span></button>
      </div>

      <!-- BARRA DE PROGRESO -->
      <div class="barra-progreso-wrapper">
        <div class="barra-progreso-fill" :style="{ width: (acertados / totalParejas * 100) + '%' }"></div>
      </div>

      <!-- TABLERO DE CARTAS -->
      <div class="cartas-card" :class="{ 'cartas-card--dificil': dificultad === 'dificil' }">
        <div class="tablero-cartas">
          <div
            v-for="carta in cartas"
            :key="carta.id"
            class="carta"
            :class="{ visible: carta.visible, emparejada: carta.emparejada, incorrecta: carta.incorrecta }"
            @click="voltearCarta(carta)"
          >
            <img v-if="!carta.visible && !carta.emparejada" :src="cartaReverso" class="carta-img" />
            <span v-else>{{ carta.valor }}</span>
          </div>
        </div>
      </div>

    </div>
    <ModalSalir
    v-if="mostrarModalSalir"
    @confirmar="router.push('/menu')"
    @cancelar="mostrarModalSalir = false; if (dificultad === 'dificil') reanudarTemporizador()"
/>
<ModalFinPartida
    v-if="mostrarModalFin"
    :puntos="puntos"
    :acertados="acertados"
    :total="totalParejas"
    :saltados="null"
    :fallos="fallos"
    :tiempo="dificultad === 'dificil' ? (60 - tiempoRestante) : null"
    labelAcertados="parejas"
    :puntuacionHistorica="0"
    @cerrar="router.push('/menu')"
    @jugarOtraVez="jugarOtraVez"
/>
<ModalAyuda
    v-if="mostrarModalAyuda"
    :instrucciones="instruccionesMemory"
    :elementos="elementosTablero"
    @cerrar="mostrarModalAyuda = false; if (dificultad === 'dificil') reanudarTemporizador()"
/>
  </div>
</template>

<style scoped>
.memory-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.memory-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

/* ── CONTENEDOR DEL TABLERO DE CARTAS ── */
.cartas-card {
  background-color: var(--color-caja);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 6px solid var(--color-principal);
}

.tablero-cartas {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
}

/* ── CARTAS ── */
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

.carta.visible {
  background-color: #ffffff;
  border: 2px solid #adb5bd;
}

.carta.emparejada {
  background-color: #d4edda;
  border: 2px solid #28a745;
  cursor: default;
}

.carta.incorrecta.incorrecta {
  background-color: #f8d7da;
  border: 2px solid #dc3545;
}

.carta-img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

/* ── ILUSTRACIÓN LATERAL ── */
.ilustracion-wrapper {
  position: absolute;
  left: 0px;
  top: 70%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 600px;
  height: auto;
  display: block;
}

html[data-size="large"] .ilustracion-wrapper {
  margin: 0 15px -25px auto;
}

html[data-size="large"] .ilustracion {
  width: 400px;
}

@media (max-width: 768px) {
  .ilustracion-wrapper {
    display: none !important;
  }

  .memory-container {
    padding: 16px 12px 40px;
    gap: 16px;
  }

  .cartas-card {
    padding: 16px;
  }

  .tablero-cartas {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .carta {
    aspect-ratio: 3 / 4;
  }

  .cartas-card--dificil {
    padding: 10px;
  }

  .cartas-card--dificil .tablero-cartas {
    gap: 6px;
  }

  .cartas-card--dificil .carta {
    aspect-ratio: 1;
  }
}
</style>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import intrusoService from '@/services/intrusoService'
import { usePartida } from '@/composables/usePartida'
import ModalSalir from '@/components/shared/ModalSalir.vue'
import ModalFinPartida from '@/components/shared/ModalFinPartida.vue'

const { finalizarPartida } = usePartida()
const route = useRoute()
const router = useRouter()
const intrusos = ref([])
const puntos = ref(0)
const indiceActual = ref(0)
const opcionElegida = ref(null)
const respondido = ref(false)
const esCorrecta = ref(false)
const tiempoRestante = ref(30)
let temporizador = null
const mostrarModalSalir = ref(false)
const mostrarModalFin = ref(false)
const acertados = ref(0)
const fechaInicio = ref(null)
const dificultad = route.query.dificultad

onMounted(() => {
    intrusoService.obtenerIntrusos(dificultad).then(data => {
        intrusos.value = data
        fechaInicio.value = Date.now()
        if (dificultad === 'dificil') iniciarTemporizador()
    })
})

function iniciarTemporizador() {
    tiempoRestante.value = 30
    clearInterval(temporizador)
    temporizador = setInterval(() => {
        tiempoRestante.value--
        if (tiempoRestante.value <= 0) {
            clearInterval(temporizador)
            const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
                finalizarPartida(2, puntos.value, duracion, dificultad, mostrarModalFin)
        }
    }, 1000)
}

function seleccionarOpcion(imagen) {
    if (respondido.value) return
    opcionElegida.value = imagen
    respondido.value = true
    esCorrecta.value = imagen === intrusos.value[indiceActual.value].imagen_intrusa
    if (esCorrecta.value) {
        puntos.value++
        acertados.value++
    }
}

function jugarOtraVez() {
    indiceActual.value = 0
    puntos.value = 0
    acertados.value = 0
    respondido.value = false
    opcionElegida.value = null
    esCorrecta.value = false
    mostrarModalFin.value = false
    if (dificultad === 'dificil') iniciarTemporizador()
}

function siguiente() {
    if (indiceActual.value + 1 >= intrusos.value.length) {
        const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
        finalizarPartida(2, puntos.value, duracion, dificultad, mostrarModalFin)
        return
    }
    indiceActual.value++
    respondido.value = false
    opcionElegida.value = null
    esCorrecta.value = false
    if (dificultad === 'dificil') iniciarTemporizador()
}

</script>

<template>
  <div class="juego-container">

    <!-- Cabecera -->
    <div class="juego-header">
      <button class="btn-salir" @click="mostrarModalSalir = true">✕ Salir</button>
      <div class="juego-info">
        <span>Pregunta {{ indiceActual + 1 }} / {{ intrusos.length }}</span>
        <span>⭐ {{ puntos }} puntos</span>
      </div>
      <div v-if="dificultad === 'dificil'" class="temporizador" :class="{ urgente: tiempoRestante <= 10 }">
        ⏱ {{ tiempoRestante }}s
      </div>
    </div>

    <!-- Pregunta actual -->
    <div v-if="intrusos.length > 0 && indiceActual < intrusos.length" class="pregunta-container">
      <p class="instruccion">¿Cuál es el intruso?</p>

      <div class="imagenes-grid">
        <div
          v-for="imagen in [
            intrusos[indiceActual].imagen_uno,
            intrusos[indiceActual].imagen_dos,
            intrusos[indiceActual].imagen_tres,
            intrusos[indiceActual].imagen_cuatro
          ]"
          :key="imagen"
          class="imagen-card"
          :class="{
            correcta: respondido && imagen === intrusos[indiceActual].imagen_intrusa,
            incorrecta: respondido && opcionElegida === imagen && imagen !== intrusos[indiceActual].imagen_intrusa,
            deshabilitada: respondido
          }"
          @click="seleccionarOpcion(imagen)"
        >
          <img :src="imagen" :alt="imagen" />
        </div>
      </div>

      <!-- Feedback y explicación -->
      <div v-if="respondido" class="feedback">
        <p v-if="esCorrecta" class="feedback-correcto">✅ ¡Correcto!</p>
        <p v-else class="feedback-incorrecto">❌ No era ese...</p>
        <p class="explicacion">{{ intrusos[indiceActual].explicacion }}</p>
      </div>
    </div>
    <div class="acciones" v-if="respondido">
    <button class="btn-siguiente" @click="siguiente">
        {{ indiceActual + 1 < intrusos.length ? 'Siguiente ➡' : 'Ver resultados 🏁' }}
    </button>
    </div>

    <!-- Modales -->
    <ModalSalir v-if="mostrarModalSalir" 
    @confirmar="router.push('/menu')" 
    @cancelar="mostrarModalSalir = false" 
    />
    <ModalFinPartida 
        v-if="mostrarModalFin"
        :puntos="puntos"
        :acertados="acertados"
        :total="intrusos.length"
        :puntuacionHistorica="0"
        labelAcertados="intrusos encontrados"
        @cerrar="router.push('/menu')"
        @jugarOtraVez="jugarOtraVez"
    />

  </div>
</template>

<style scoped>
.juego-container {
  min-height: 100vh;
  background-color: var(--color-fondo);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.juego-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-salir {
  background: none;
  border: 2px solid var(--color-principal);
  color: var(--color-principal);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.juego-info {
  display: flex;
  gap: 20px;
  font-size: 18px;
  font-weight: bold;
  color: var(--color-texto);
}

.temporizador {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-principal);
}

.temporizador.urgente {
  color: red;
  animation: pulso 0.5s infinite alternate;
}

@keyframes pulso {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.instruccion {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: var(--color-texto);
  margin-bottom: 20px;
}

.imagenes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
}

.imagen-card {
  background: white;
  border: 3px solid var(--color-borde);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.imagen-card:hover:not(.deshabilitada) {
  transform: scale(1.05);
  border-color: var(--color-principal);
}

.imagen-card img {
  width: 100%;
  max-width: 150px;
  height: 150px;
  object-fit: contain;
}

.imagen-card.correcta {
  border-color: green;
  background-color: #e8f5e9;
}

.imagen-card.incorrecta {
  border-color: red;
  background-color: #ffebee;
}

.imagen-card.deshabilitada {
  cursor: default;
}

.feedback {
  text-align: center;
  margin-top: 20px;
}

.feedback-correcto {
  font-size: 22px;
  color: green;
  font-weight: bold;
}

.feedback-incorrecto {
  font-size: 22px;
  color: red;
  font-weight: bold;
}

.explicacion {
  font-size: 18px;
  color: var(--color-texto);
  margin-top: 10px;
  font-style: italic;
}
</style>
<script setup>
import refranService from '@/services/refranService'
import partidaService from '@/services/partidaService'
import ModalSalir from '@/components/refran/ModalSalir.vue'
import ModalFinPartida from '@/components/refran/ModalFinPartida.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const refranes = ref([])
const indiceActual = ref(0)
const puntos = ref(0)
const respondido = ref(false)
const opcionElegida = ref(null)
const ultimaRespuestaCorrecta = ref(false)
const respuestaTexto = ref('')
const tiempoRestante = ref(30)
let temporizador = null
const mostrarModalSalir = ref(false)
const mostrarModalFin = ref(false)
const acertados = ref(0)
const saltados = ref(0)
const fechaInicio = ref(null)

const dificultad = route.query.dificultad

const refranActual = computed(() => refranes.value[indiceActual.value])

const opcionesAleatorias = computed(() => {
    if (!refranActual.value) return []
    const opciones = [
        refranActual.value.opcion_uno,
        refranActual.value.opcion_dos,
        refranActual.value.opcion_correcta
    ]
    return opciones.sort(() => Math.random() - 0.5)
})

onMounted(() => {
    refranService.obtenerRefranes().then(data => {
        refranes.value = data
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
            respondido.value = true
            ultimaRespuestaCorrecta.value = false
        }
    }, 1000)
}

function responder(opcion) {
    respondido.value = true
    opcionElegida.value = opcion
    ultimaRespuestaCorrecta.value = opcion === refranActual.value.opcion_correcta
    if (ultimaRespuestaCorrecta.value) {
        puntos.value += 10
        acertados.value++
    }
}

function responderTexto() {
    if (!respuestaTexto.value.trim()) return
    clearInterval(temporizador)
    respondido.value = true
    const respuestaLimpia = respuestaTexto.value.trim().toLowerCase()
    const correctaLimpia = refranActual.value.opcion_correcta.trim().toLowerCase()
    ultimaRespuestaCorrecta.value = respuestaLimpia === correctaLimpia
    if (ultimaRespuestaCorrecta.value) {
        puntos.value += 10
        acertados.value++
    }
}

function siguiente() {
    if (indiceActual.value + 1 >= refranes.value.length) {
        finalizarPartida()
    return
    }   
    indiceActual.value++
    respondido.value = false
    opcionElegida.value = null
    ultimaRespuestaCorrecta.value = false
    respuestaTexto.value = ''
    if (dificultad === 'dificil') iniciarTemporizador()
}

function saltar() {
    saltados.value++
    siguiente()
}

function confirmarSalida() {
    mostrarModalSalir.value = true
}

function salirAlMenu() {
    router.push('/menu')
}   

function jugarOtraVez() {
    indiceActual.value = 0
    puntos.value = 0
    respondido.value = false
    opcionElegida.value = null
    ultimaRespuestaCorrecta.value = false
    respuestaTexto.value = ''
    mostrarModalFin.value = false
    if (dificultad === 'dificil') iniciarTemporizador()
}       

function finalizarPartida() {
    const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
    partidaService.guardarPartida({
        juego_id: 1,
        puntuacion: puntos.value,
        duracion_segundos: duracion,
        nivel: dificultad,
        completada: true
    })

    mostrarModalFin.value = true
}

</script>

<template>
  <div class="refran-container" v-if="refranActual">

    <div class="cabecera">
      <button class="btn-salir" @click="confirmarSalida">✕ Salir</button>
      <span class="progreso">{{ indiceActual + 1 }} / {{ refranes.length }}</span>
      <span class="puntos">⭐ {{ puntos }}</span>
    </div>

    <div class="refran-card">
      <p class="etiqueta">Completa el refrán:</p>
      <h2 class="primera-parte">{{ refranActual.primera_parte }}</h2>
    </div>

    <div class="opciones" v-if="dificultad === 'facil'">
      <button
        v-for="opcion in opcionesAleatorias"
        :key="opcion"
        class="btn-opcion"
        :class="{
          'correcta': respondido && opcion === refranActual.opcion_correcta,
          'incorrecta': respondido && opcion !== refranActual.opcion_correcta && opcion === opcionElegida
        }"
        :disabled="respondido"
        @click="responder(opcion)"
      >
        {{ opcion }}
      </button>
    </div>

    <div class="opciones" v-if="dificultad === 'dificil'">
      <input
        v-model="respuestaTexto"
        class="input-respuesta"
        type="text"
        placeholder="Escribe cómo termina el refrán..."
        :disabled="respondido"
        @keyup.enter="responderTexto"
      />
      <div class="temporizador">⏱ {{ tiempoRestante }}s</div>
      <button class="btn-confirmar" :disabled="respondido" @click="responderTexto">Confirmar</button>
    </div>

    <div class="feedback correcto" v-if="respondido && ultimaRespuestaCorrecta">
      ✅ ¡Correcto!
    </div>
    <div class="feedback incorrecto" v-if="respondido && !ultimaRespuestaCorrecta">
      ❌ La respuesta correcta era: <strong>{{ refranActual.opcion_correcta }}</strong>
    </div>

    <div class="acciones" v-if="respondido">
      <button class="btn-siguiente" @click="siguiente">
        {{ indiceActual + 1 < refranes.length ? 'Siguiente ➡' : 'Ver resultados 🏁' }}
      </button>
    </div>
    <div class="acciones" v-if="!respondido">
      <button class="btn-saltar" @click="saltar">Saltar ⏭</button>
    </div>

  </div>

  <div class="cargando" v-else>
    <p>Cargando refranes...</p>
  </div>
    <ModalSalir 
        v-if="mostrarModalSalir"
        @confirmar="salirAlMenu"
        @cancelar="mostrarModalSalir = false"
    />
    <ModalFinPartida 
        v-if="mostrarModalFin"
        :puntos="puntos"
        :acertados="acertados"
        :total="refranes.length"
        :saltados="saltados"
        @jugarOtraVez="jugarOtraVez"
        @cerrar="salirAlMenu"
/>
</template>

<style scoped>
.refran-container {
  max-width: 520px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-salir {
  background: transparent;
  border: 1px solid var(--color-borde);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 15px;
  cursor: pointer;
  color: var(--color-texto-suave);
}

.btn-salir:hover {
  background-color: var(--color-borde);
}

.progreso {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-texto-suave);
}

.puntos {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-principal);
}

.refran-card {
  background-color: white;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border-left: 6px solid var(--color-principal);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.etiqueta {
  font-size: 14px;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.primera-parte {
  font-size: 1.5rem;
  color: var(--color-principal);
  font-weight: bold;
  line-height: 1.4;
}

.opciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-opcion {
  background-color: white;
  border: 2px solid var(--color-borde);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 1.1rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  color: var(--color-texto);
}

.btn-opcion:hover:not(:disabled) {
  border-color: var(--color-principal);
  background-color: #fdecea;
}

.btn-opcion.correcta {
  background-color: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.btn-opcion.incorrecta {
  background-color: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.input-respuesta {
  border: 2px solid var(--color-borde);
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 1.1rem;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  color: var(--color-texto);
  background-color: white;
}

.input-respuesta:focus {
  outline: none;
  border-color: var(--color-principal);
}

.temporizador {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-principal);
}

.btn-confirmar {
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirmar:hover:not(:disabled) {
  background-color: var(--color-principal-hover);
}

.feedback {
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
}

.feedback.correcto {
  background-color: #d4edda;
  color: #155724;
}

.feedback.incorrecto {
  background-color: #f8d7da;
  color: #721c24;
}

.acciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-siguiente {
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-siguiente:hover {
  background-color: var(--color-principal-hover);
}

.btn-saltar {
  background-color: transparent;
  color: var(--color-texto-suave);
  border: 1px solid var(--color-borde);
  border-radius: 12px;
  padding: 14px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-saltar:hover {
  background-color: var(--color-borde);
}

.cargando {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: var(--color-texto-suave);
}
</style>
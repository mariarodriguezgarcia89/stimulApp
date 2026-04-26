<script setup>
import refranService from '@/services/refranService'
import ModalSalir from '@/components/modals/ModalSalir.vue'
import ModalFinPartida from '@/components/modals/ModalFinPartida.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePartida } from '@/composables/usePartida'
import ModalAyuda from '@/components/modals/ModalAyuda.vue'
import { instruccionesRefranFacil, instruccionesRefranDificil } from '@/utils/mensajes.js'

const router = useRouter()
const route = useRoute()
const dificultad = route.query.dificultad
const instruccionesRefran = dificultad === 'facil' ? instruccionesRefranFacil : instruccionesRefranDificil
const mostrarModalAyuda = ref(true) 

const elementosTablero = [
  { icono: '📖', nombre: 'Refrán', descripcion: 'Indica en qué refrán vas de los 10 en total.' },
  { icono: '⭐', nombre: 'Puntos', descripcion: 'Los puntos que llevas acumulados. Ganas 10 por cada acierto.' },
  { icono: '✅', nombre: 'Acertados', descripcion: 'Cuántos refranes has completado correctamente.' },
  ...(dificultad === 'dificil' ? [{ icono: '⏱', nombre: 'Tiempo', descripcion: 'Los segundos que te quedan para escribir tu respuesta.' }] : []),
  { icono: '✕', nombre: 'Salir', descripcion: 'Abandona la partida y vuelve al menú principal.' },
  { icono: '❓', nombre: 'Ayuda', descripcion: 'Vuelve a ver estas instrucciones en cualquier momento.' }
]

const { finalizarPartida } = usePartida()

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
        // if (dificultad === 'dificil') iniciarTemporizador()
    })
})

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
      const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
      finalizarPartida(1, puntos.value, duracion, dificultad, mostrarModalFin)
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

function jugarOtraVez() {
    indiceActual.value = 0
    puntos.value = 0
    respondido.value = false
    opcionElegida.value = null
    ultimaRespuestaCorrecta.value = false
    respuestaTexto.value = ''
    mostrarModalFin.value = false
    acertados.value = 0
    saltados.value = 0
    fechaInicio.value = Date.now()
    if (dificultad === 'dificil') iniciarTemporizador()
}

function iniciarTemporizador(desde = 30) {
  tiempoRestante.value = desde
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

let tiempoGuardado = 30

function abrirModalSalir() {
  tiempoGuardado = tiempoRestante.value
  clearInterval(temporizador)
  mostrarModalSalir.value = true
}

function abrirModalAyuda() {
  tiempoGuardado = tiempoRestante.value
  clearInterval(temporizador)
  mostrarModalAyuda.value = true
}
</script>

<template>
  <div class="refran-page">

    <AppTopbar :modoJuego="true" />

    <div class="refran-container" v-if="refranActual">

      <!-- TABLERO DE DATOS -->
      <div class="tablero">
        <div class="tablero-dato">
          <span class="tablero-icono">📖</span>
          <span class="tablero-valor">{{ indiceActual + 1 }}/{{ refranes.length }}</span>
          <span class="tablero-etiqueta">Refrán</span>
        </div>
        <div class="tablero-dato">
          <span class="tablero-icono">⭐</span>
          <span class="tablero-valor">{{ puntos }}</span>
          <span class="tablero-etiqueta">Puntos</span>
        </div>
        <div class="tablero-dato" v-if="dificultad === 'dificil'">
          <span class="tablero-icono">⏱</span>
          <span class="tablero-valor" :class="{ 'tiempo-urgente': tiempoRestante <= 10 }">{{ tiempoRestante }}s</span>
          <span class="tablero-etiqueta">Tiempo</span>
        </div>
        <div class="tablero-dato">
          <span class="tablero-icono">✅</span>
          <span class="tablero-valor">{{ acertados }}</span>
          <span class="tablero-etiqueta">Acertados</span>
        </div>
        <button class="tablero-salir" @click="abrirModalSalir">✕ <span>Salir</span></button>
        <button class="tablero-ayuda" @click="abrirModalAyuda">❓ <span>Ayuda</span></button>
      </div>

      <!-- BARRA DE PROGRESO -->
      <div class="barra-progreso-wrapper">
        <div class="barra-progreso-fill" :style="{ width: ((indiceActual + 1) / refranes.length * 100) + '%' }"></div>
      </div>

      <!-- CARTA DEL REFRÁN -->
      <div class="refran-card">
        <p class="etiqueta">Completa el refrán:</p>
        <h2 class="primera-parte">{{ refranActual.primera_parte }}</h2>
      </div>

      <!-- OPCIONES NIVEL NORMAL -->
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

      <!-- OPCIONES NIVEL AVANZADO -->
      <div class="opciones" v-if="dificultad === 'dificil'">
        <input
          v-model="respuestaTexto"
          class="input-respuesta"
          type="text"
          placeholder="Escribe cómo termina el refrán..."
          :disabled="respondido"
          @keyup.enter="responderTexto"
        />
        <button class="btn-principal" :disabled="respondido" @click="responderTexto">
          Confirmar respuesta
        </button>
      </div>

      <!-- FEEDBACK -->
      <div class="feedback correcto" v-if="respondido && ultimaRespuestaCorrecta">
        ✅ ¡Correcto!
      </div>
      <div class="feedback incorrecto" v-if="respondido && !ultimaRespuestaCorrecta">
        ❌ La respuesta correcta era: <strong>{{ refranActual.opcion_correcta }}</strong>
      </div>

      <!-- ACCIONES -->
      <div class="acciones">
        <button v-if="respondido" class="btn-siguiente" @click="siguiente">
          {{ indiceActual + 1 < refranes.length ? 'Siguiente refrán ➡' : 'Ver resultados 🏁' }}
        </button>
        <button v-if="!respondido" class="btn-saltar" @click="saltar">
          Saltar este refrán ⏭
        </button>
      </div>

    </div>

    <!-- CARGANDO -->
    <div class="cargando" v-else>
      <p>Cargando refranes...</p>
    </div>

    <ModalSalir
      v-if="mostrarModalSalir"
      @confirmar="router.push('/menu')"
      @cancelar="mostrarModalSalir = false; if (dificultad === 'dificil' && !respondido) iniciarTemporizador(tiempoGuardado)"
    />
    <ModalFinPartida
      v-if="mostrarModalFin"
      :puntos="puntos"
      puntuacionHistorica=""
      labelAcertados="refranes"
      :acertados="acertados"
      :total="refranes.length"
      :saltados="saltados"
      @jugarOtraVez="jugarOtraVez"
      @cerrar="router.push('/menu')"
    />
   <ModalAyuda
    v-if="mostrarModalAyuda"
    :instrucciones="instruccionesRefran"
    :elementos="elementosTablero"
    @cerrar="mostrarModalAyuda = false; if (dificultad === 'dificil') iniciarTemporizador(tiempoGuardado)"
  />

  </div>
</template>

<style scoped>
.tablero-ayuda {
  background-color: transparent;
  color: var(--color-principal);
  border: 2px solid var(--color-principal);
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 90px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tablero-ayuda:hover {
  background-color: var(--color-principal);
  border-color: var(--color-principal);
  color: white;
}

.refran-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.refran-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

/* ── TABLERO ── */
.tablero {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-caja);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border-top: 4px solid var(--color-principal);
}

.tablero-dato {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border-right: 1px solid var(--color-borde);
  padding: 0 8px;
}

.tablero-dato:last-of-type {
  border-right: none;
}

.tablero-icono {
  font-size: 1.4rem;
}

.tablero-valor {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--color-principal);
  line-height: 1;
}

.tablero-etiqueta {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tiempo-urgente {
  color: #dc3545 !important;
  animation: pulso 0.5s infinite alternate;
}

@keyframes pulso {
  from { opacity: 1; }
  to { opacity: 0.5; }
}
.tablero-salir {
  background-color: transparent;
  color: #d32f2f;
  border: 2px solid #f5c6cb;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tablero-salir:hover {
  background-color: #d32f2f;
  border-color: #d32f2f;
  color: white;
}

/* ── BARRA DE PROGRESO ── */
.barra-progreso-wrapper {
  height: 8px;
  background-color: var(--color-borde);
  border-radius: 99px;
  overflow: hidden;
}

.barra-progreso-fill {
  height: 100%;
  background-color: var(--color-principal);
  border-radius: 99px;
  transition: width 0.4s ease;
}

/* ── CARTA DEL REFRÁN ── */
.refran-card {
  background-color: var(--color-caja);
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border-left: 6px solid var(--color-principal);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.etiqueta {
  font-size: 13px;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.primera-parte {
  font-size: 1.8rem;
  color: var(--color-principal);
  font-weight: 800;
  line-height: 1.4;
}

/* ── OPCIONES ── */
.opciones {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.btn-opcion {
  background-color: var(--color-caja);
  border: 2px solid var(--color-borde);
  border-radius: 14px;
  padding: 20px 24px;
  font-size: 1.15rem;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  color: var(--color-texto);
  font-weight: 600;
}

.btn-opcion:hover:not(:disabled) {
  border-color: var(--color-principal);
  background-color: #fdecea;
  transform: translateX(4px);
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
  border-radius: 14px;
  padding: 20px 24px;
  font-size: 1.15rem;
  width: 100%;
  font-family: inherit;
  color: var(--color-texto);
  background-color: var(--color-caja);
  transition: border-color 0.2s;
}

.input-respuesta:focus {
  outline: none;
  border-color: var(--color-principal);
}

/* ── FEEDBACK ── */
.feedback {
  border-radius: 14px;
  padding: 20px 24px;
  font-size: 1.15rem;
  font-weight: bold;
  text-align: center;
}

.feedback.correcto {
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #28a745;
}

.feedback.incorrecto {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #dc3545;
}

/* ── ACCIONES ── */
.acciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-siguiente {
  width: 100%;
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 20px;
  font-size: 1.15rem;
  font-weight: bold;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-siguiente:hover {
  background-color: var(--color-principal-hover);
}

.btn-saltar {
  width: 100%;
  background-color: transparent;
  color: var(--color-texto-suave);
  border: 1px solid var(--color-borde);
  border-radius: 14px;
  padding: 18px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-saltar:hover {
  background-color: var(--color-borde);
}

/* ── CARGANDO ── */
.cargando {
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  color: var(--color-texto-suave);
}
</style>
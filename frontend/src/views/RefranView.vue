<script setup>
// Vista del juego Acaba el Refrán (modo fácil: elegir opción, modo difícil: escritura libre con temporizador)
import refranService from '@/services/refranService'
import ModalSalir from '@/components/modals/ModalSalir.vue'
import ModalFinPartida from '@/components/modals/ModalFinPartida.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePartida } from '@/composables/usePartida'
import { useTemporizador } from '@/composables/useTemporizador'
import ModalAyuda from '@/components/modals/ModalAyuda.vue'
import fondoRefran from '@/assets/fondo-refran.png'
import { PUNTOS_ACIERTO, UMBRAL_TIEMPO_URGENTE } from '@/utils/constantes.js'
import { instruccionesRefranFacil, instruccionesRefranDificil, elementosTableroRefran } from '@/utils/mensajes.js'

const router = useRouter()
const route = useRoute()
const dificultad = route.query.dificultad
const instruccionesRefran = dificultad === 'facil' ? instruccionesRefranFacil : instruccionesRefranDificil
const mostrarModalAyuda = ref(true)
const avisoRespuestaVacia = ref(false)
const elementosTablero = elementosTableroRefran(dificultad)
const { finalizarPartida, puntuacionHistorica } = usePartida()
const { tiempoRestante, tiempoGuardado, iniciarTemporizador, pausarTemporizador, detenerTemporizador } = useTemporizador(30)
const refranes = ref([])
const indiceActual = ref(0)
const puntos = ref(0)
const respondido = ref(false)
const opcionElegida = ref(null)
const ultimaRespuestaCorrecta = ref(false)
const respuestaTexto = ref('')
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
    })
})

onUnmounted(() => detenerTemporizador())

function responder(opcion) {
    respondido.value = true
    opcionElegida.value = opcion
    ultimaRespuestaCorrecta.value = opcion === refranActual.value.opcion_correcta
    if (ultimaRespuestaCorrecta.value) {
        puntos.value += PUNTOS_ACIERTO
        acertados.value++
    }
}

function normalizarTexto(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
}
function responderTexto() {
    if (!respuestaTexto.value.trim()) {
        avisoRespuestaVacia.value = true
        return
    }
    avisoRespuestaVacia.value = false
    detenerTemporizador()
    respondido.value = true
    const respuestaLimpia = normalizarTexto(respuestaTexto.value)
    const correctaLimpia = normalizarTexto(refranActual.value.opcion_correcta)
    ultimaRespuestaCorrecta.value = respuestaLimpia === correctaLimpia
    if (ultimaRespuestaCorrecta.value) {
        puntos.value += PUNTOS_ACIERTO
        acertados.value++
    }
}

function siguiente() {
    if (indiceActual.value + 1 >= refranes.value.length) {
      detenerTemporizador()
      const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
      finalizarPartida(1, puntos.value, duracion, dificultad, mostrarModalFin)
      return
    }
    indiceActual.value++
    respondido.value = false
    opcionElegida.value = null
    ultimaRespuestaCorrecta.value = false
    respuestaTexto.value = ''
    if (dificultad === 'dificil') iniciarTemporizador(() => {
        respondido.value = true
        ultimaRespuestaCorrecta.value = false
    })
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
    if (dificultad === 'dificil') iniciarTemporizador(() => {
        respondido.value = true
        ultimaRespuestaCorrecta.value = false
    })
}

function abrirModalSalir() {
    pausarTemporizador()
    mostrarModalSalir.value = true
}

function abrirModalAyuda() {
    pausarTemporizador()
    mostrarModalAyuda.value = true
}

function reanudarTemporizador() {
    iniciarTemporizador(() => {
        respondido.value = true
        ultimaRespuestaCorrecta.value = false
    }, tiempoGuardado.value)
}

</script>

<template>
  <div class="refran-page">

    <AppTopbar :modoJuego="true" />

    <div class="refran-container">
      <div class="ilustracion-wrapper">
        <img 
          :src="fondoRefran" 
          alt="" 
          aria-hidden="true"
          class="ilustracion" />
      </div>

      <div class="zona-juego" v-if="refranes && refranes.length > 0 && indiceActual < refranes.length">
        
        <div class="tablero" :class="{ 'tablero--dificil': dificultad === 'dificil' }">
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
            <span class="tablero-valor" :class="{ 'tiempo-urgente': tiempoRestante <= UMBRAL_TIEMPO_URGENTE }">{{ tiempoRestante }}s</span>
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

        <div class="barra-progreso-wrapper">
          <div class="barra-progreso-fill" :style="{ width: ((indiceActual + 1) / refranes.length * 100) + '%' }"></div>
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
          <p class="aviso-vacio" v-if="avisoRespuestaVacia">
        ⚠️ Debes escribir la segunda parte del refrán antes de confirmar.
          </p>
          <button class="btn-principal" :disabled="respondido" @click="responderTexto">
            Confirmar respuesta
          </button>
        </div>

        <div class="feedback correcto" v-if="respondido && ultimaRespuestaCorrecta">
          ✅ ¡Correcto!
        </div>
        <div class="feedback incorrecto" v-if="respondido && !ultimaRespuestaCorrecta">
          ❌ La respuesta correcta era: <strong>{{ refranActual.opcion_correcta }}</strong>
        </div>

        <div class="acciones">
          <button v-if="respondido" class="btn-siguiente" @click="siguiente">
            {{ indiceActual + 1 < refranes.length ? 'Siguiente refrán ➡' : 'Ver resultados 🏁' }}
          </button>
          <button v-if="!respondido" class="btn-saltar" @click="saltar">
            Saltar este refrán ⏭
          </button>
        </div>

      </div> <div class="cargando" v-else>
        <p>Cargando refranes...</p>
      </div>

    </div> <ModalSalir
      v-if="mostrarModalSalir"
      @confirmar="router.push('/menu')"
      @cancelar="mostrarModalSalir = false; if (dificultad === 'dificil' && !respondido) reanudarTemporizador()"
    />
    <ModalFinPartida
      v-if="mostrarModalFin"
      :puntos="puntos"
      :puntuacionHistorica="puntuacionHistorica"
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
      @cerrar="mostrarModalAyuda = false; if (dificultad === 'dificil') reanudarTemporizador()"
    />

  </div>
</template>

<style scoped>
.refran-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.refran-container {
  flex: 1;
  min-height: 0;
  max-width: 720px;
  margin: 0 auto;
  padding: 14px 24px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

/* ── ILUSTRACIÓN ── */
.ilustracion-wrapper {
  position: absolute;
  bottom: 0;
  right: -35px;
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 450px;
  height: auto;
  display: block;
}

html[data-size="large"] .ilustracion {
  width: 220px;
}

/* ── CARTA DEL REFRÁN ── */
.refran-card {
  background-color: var(--color-caja);
  border-radius: 16px;
  padding: 18px 22px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7);
  border-left: 6px solid var(--color-principal);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.etiqueta {
  font-size: 11px;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.primera-parte {
  font-size: 1.5rem;
  color: var(--color-principal);
  font-weight: 800;
  line-height: 1.35;
}

/* ── OPCIONES ── */
.opciones {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.btn-opcion {
  background: linear-gradient(180deg, var(--color-caja) 0%, #faf8f8 100%);
  border: 1.5px solid var(--color-borde);
  border-radius: 13px;
  padding: 13px 20px;
  font-size: 1.05rem;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s;
  color: var(--color-texto);
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
}

.btn-opcion:hover:not(:disabled) {
  border-color: var(--color-principal);
  background: linear-gradient(180deg, #fef5f5 0%, #fdecea 100%);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9);
}

.btn-opcion.correcta {
  background: linear-gradient(180deg, #e8f8ee 0%, #d4edda 100%);
  border-color: #28a745;
  color: #155724;
  box-shadow: 0 2px 8px rgba(40,167,69,0.2);
}

.btn-opcion.incorrecta {
  background: linear-gradient(180deg, #fde8ea 0%, #f8d7da 100%);
  border-color: #dc3545;
  color: #721c24;
  box-shadow: 0 2px 8px rgba(220,53,69,0.2);
}

.input-respuesta {
  border: 2px solid var(--color-borde);
  border-radius: 13px;
  padding: 14px 20px;
  font-size: 1.05rem;
  width: 100%;
  font-family: inherit;
  color: var(--color-texto);
  background-color: var(--color-caja);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
  box-sizing: border-box;
}

.input-respuesta:focus {
  outline: none;
  border-color: var(--color-principal);
  box-shadow: 0 0 0 3px rgba(139,26,42,0.12), inset 0 2px 4px rgba(0,0,0,0.04);
}

/* ── FEEDBACK ── */
.feedback {
  border-radius: 13px;
  padding: 12px 20px;
  font-size: 1.05rem;
  font-weight: bold;
  text-align: center;
}

.feedback.correcto {
  background: linear-gradient(180deg, #e8f8ee 0%, #d4edda 100%);
  color: #155724;
  border: 1.5px solid #28a745;
  box-shadow: 0 2px 8px rgba(40,167,69,0.15);
}

.feedback.incorrecto {
  background: linear-gradient(180deg, #fde8ea 0%, #f8d7da 100%);
  color: #721c24;
  border: 1.5px solid #dc3545;
  box-shadow: 0 2px 8px rgba(220,53,69,0.15);
}

.aviso-vacio {
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
}

/* ── ACCIONES ── */
.acciones {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-siguiente {
  width: 100%;
  background: linear-gradient(180deg, var(--color-principal) 0%, var(--color-principal-hover, #7a1525) 100%);
  color: white;
  border: none;
  border-radius: 13px;
  padding: 14px;
  font-size: 1.05rem;
  font-weight: bold;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s;
  box-shadow: 0 4px 14px rgba(139,26,42,0.3), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15);
}

.btn-siguiente:hover {
  box-shadow: 0 6px 20px rgba(139,26,42,0.4), 0 2px 6px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

.btn-saltar {
  width: 100%;
  background: linear-gradient(180deg, var(--color-caja) 0%, #f5f3f3 100%);
  color: var(--color-texto-suave);
  border: 1.5px solid var(--color-borde);
  border-radius: 13px;
  padding: 11px;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8);
}

.btn-saltar:hover {
  background: linear-gradient(180deg, #f0eded 0%, #e8e4e4 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* ── CARGANDO ── */
.cargando {
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  color: var(--color-texto-suave);
}

@media (max-width: 768px) {
  .refran-page {
    height: auto;
    overflow: visible;
  }

  .ilustracion-wrapper {
    display: none !important;
  }

  :deep(.navbar-solida .logo-nav) {
    transform: none !important;
    top: -10px !important;
  }

  .refran-container {
    padding: 12px 12px 30px;
    gap: 10px;
  }

  .refran-card {
    padding: 14px 14px;
  }

  .primera-parte {
    font-size: 1.25rem;
  }

  .btn-opcion {
    padding: 12px 14px;
    font-size: 1rem;
  }

  .feedback {
    padding: 12px 14px;
    font-size: 1rem;
  }

  .input-respuesta {
    padding: 12px 14px;
    font-size: 1rem;
  }

  .btn-siguiente {
    padding: 13px;
    font-size: 1rem;
  }

  .btn-saltar {
    padding: 10px;
    font-size: 0.9rem;
  }
}

</style>
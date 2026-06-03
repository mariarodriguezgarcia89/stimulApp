<script setup>
// Vista del juego Encuentra el Intruso: identificar la imagen que no pertenece al grupo
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import intrusoService from '@/services/intrusoService'
import { usePartida } from '@/composables/usePartida'
import { useTemporizador } from '@/composables/useTemporizador'
import ModalSalir from '@/components/modals/ModalSalir.vue'
import ModalFinPartida from '@/components/modals/ModalFinPartida.vue'
import ModalAyuda from '@/components/modals/ModalAyuda.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import fondoIntruso from '@/assets/fondo-intruso.png'
import { PUNTOS_ACIERTO, UMBRAL_TIEMPO_URGENTE } from '@/utils/constantes.js'
import { instruccionesIntrusoFacil, instruccionesIntrusoDificil, elementosTableroIntruso } from '@/utils/mensajes.js'

const { finalizarPartida, puntuacionHistorica } = usePartida()
const route = useRoute()
const router = useRouter()
const { tiempoRestante, tiempoGuardado, iniciarTemporizador, pausarTemporizador, detenerTemporizador } = useTemporizador(30)
const intrusos = ref([])
const puntos = ref(0)
const indiceActual = ref(0)
const opcionElegida = ref(null)
const respondido = ref(false)
const esCorrecta = ref(false)
const mostrarModalSalir = ref(false)
const mostrarModalFin = ref(false)
const mostrarModalAyuda = ref(true)
const acertados = ref(0)
const fechaInicio = ref(null)
const dificultad = route.query.dificultad

const instruccionesIntruso = dificultad === 'facil' ? instruccionesIntrusoFacil : instruccionesIntrusoDificil
const elementosTablero = elementosTableroIntruso(dificultad)

onMounted(() => {
    intrusoService.obtenerIntrusos(dificultad).then(data => {
        intrusos.value = data
        fechaInicio.value = Date.now()
    })
})

onUnmounted(() => detenerTemporizador())

function onTiempoAgotado() {
    respondido.value = true
    esCorrecta.value = false
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
    iniciarTemporizador(onTiempoAgotado, tiempoGuardado.value)
}

function seleccionarOpcion(imagen) {
    if (respondido.value) return
    opcionElegida.value = imagen
    respondido.value = true
    esCorrecta.value = imagen === intrusos.value[indiceActual.value].imagen_intrusa
    if (esCorrecta.value) {
        puntos.value += PUNTOS_ACIERTO
        acertados.value++
    }
    if (dificultad === 'dificil') detenerTemporizador()
}

function siguiente() {
    if (indiceActual.value + 1 >= intrusos.value.length) {
        detenerTemporizador()
        const duracion = Math.floor((Date.now() - fechaInicio.value) / 1000)
        finalizarPartida(2, puntos.value, duracion, dificultad, mostrarModalFin)
        return
    }
    indiceActual.value++
    respondido.value = false
    opcionElegida.value = null
    esCorrecta.value = false
    if (dificultad === 'dificil') iniciarTemporizador(onTiempoAgotado)
}

function jugarOtraVez() {
    indiceActual.value = 0
    puntos.value = 0
    acertados.value = 0
    respondido.value = false
    opcionElegida.value = null
    esCorrecta.value = false
    mostrarModalFin.value = false
    fechaInicio.value = Date.now()
    if (dificultad === 'dificil') iniciarTemporizador(onTiempoAgotado)
}
</script>

<template>
  <div class="intruso-page">

    <AppTopbar :modoJuego="true" />

    <div class="intruso-container" v-if="intrusos.length > 0 && indiceActual < intrusos.length">

      <div class="zona-juego">

        <div class="barra-progreso-wrapper">
          <div class="barra-progreso-fill" :style="{ width: ((indiceActual + 1) / intrusos.length * 100) + '%' }"></div>
        </div>

        <div class="intruso-card">
          <p class="etiqueta">¿Cuál es el intruso?</p>

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

          <div class="area-resolucion">
            <div class="feedback correcto" v-if="respondido && esCorrecta">
              ✅ ¡Correcto! {{ intrusos[indiceActual].explicacion }}
            </div>
            <div class="feedback incorrecto" v-if="respondido && !esCorrecta">
              ❌ No era ese... {{ intrusos[indiceActual].explicacion }}
            </div>

            <div class="acciones" v-if="respondido">
              <button class="btn-siguiente" @click="siguiente">
                {{ indiceActual + 1 < intrusos.length ? 'Siguiente ➡' : 'Ver resultados 🏁' }}
              </button>
            </div>
          </div>

        </div> </div>

      <aside class="tablero" :class="{ 'tablero--dificil': dificultad === 'dificil' }">
        <div class="tablero-dato">
          <span class="tablero-icono">🖼️</span>
          <span class="tablero-valor">{{ indiceActual + 1 }}/{{ intrusos.length }}</span>
          <span class="tablero-etiqueta">Ronda</span>
        </div>
        <div class="tablero-dato">
          <span class="tablero-icono">⭐</span>
          <span class="tablero-valor">{{ puntos }}</span>
          <span class="tablero-etiqueta">Puntos</span>
        </div>
        <div class="tablero-dato">
          <span class="tablero-icono">✅</span>
          <span class="tablero-valor">{{ acertados }}</span>
          <span class="tablero-etiqueta">Aciertos</span>
        </div>
        <div class="tablero-dato" v-if="dificultad === 'dificil'">
          <span class="tablero-icono">⏱</span>
          <span class="tablero-valor" :class="{ 'tiempo-urgente': tiempoRestante <= UMBRAL_TIEMPO_URGENTE }">{{ tiempoRestante }}s</span>
          <span class="tablero-etiqueta">Tiempo</span>
        </div>
        <button class="tablero-salir" @click="abrirModalSalir">✕ <span>Salir</span></button>
        <button class="tablero-ayuda" @click="abrirModalAyuda">❓ <span>Ayuda</span></button>
      </aside>

      <div class="ilustracion-wrapper">
        <img :src="fondoIntruso" alt="" aria-hidden="true" class="ilustracion" />
      </div>

    </div>

    <div class="cargando" v-else-if="intrusos.length === 0">
      <p>Cargando imágenes...</p>
    </div>

    <ModalSalir
      v-if="mostrarModalSalir"
      @confirmar="router.push('/menu')"
      @cancelar="mostrarModalSalir = false; if (dificultad === 'dificil' && !respondido) reanudarTemporizador()"
    />
    <ModalFinPartida
      v-if="mostrarModalFin"
      :puntos="puntos"
      :acertados="acertados"
      :total="intrusos.length"
      :tiempo="dificultad === 'dificil' ? (30 - tiempoRestante) : null"
        :puntuacionHistorica="puntuacionHistorica"
      labelAcertados="intrusos"
      @cerrar="router.push('/menu')"
      @jugarOtraVez="jugarOtraVez"
    />
    <ModalAyuda
      v-if="mostrarModalAyuda"
      :instrucciones="instruccionesIntruso"
      :elementos="elementosTablero"
      @cerrar="mostrarModalAyuda = false; if (dificultad === 'dificil' && !respondido) reanudarTemporizador()"
    />

  </div>
</template>

<style scoped>
.intruso-page {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.intruso-container {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 12px 20px;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 20px;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  position: relative;
}

/* ── ILUSTRACIÓN ── */
.ilustracion-wrapper {
  position: absolute;
  left: -220px;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 290px;
  height: auto;
  display: block;
}

html[data-size="large"] .ilustracion {
  width: 180px;
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

/* ── ZONA DE JUEGO ── */
.zona-juego {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
}

.intruso-card {
  background-color: var(--color-caja);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 6px solid var(--color-principal);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.etiqueta {
  text-align: center;
  font-size: 16px;
  color: var(--color-principal);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 800;
  margin-bottom: 6px;
}

/* ── GRID DE IMÁGENES ── */
.imagenes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(100px, 220px));
  grid-template-rows: repeat(2, 1fr);
  justify-content: center;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.imagen-card {
  background: var(--color-caja);
  border: 3px solid var(--color-borde);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.imagen-card:hover:not(.deshabilitada) {
  border-color: var(--color-principal);
}

.imagen-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.imagen-card.correcta {
  border-color: #28a745;
  background-color: #d4edda;
}

.imagen-card.incorrecta {
  border-color: #dc3545;
  background-color: #f8d7da;
}

.imagen-card.deshabilitada {
  cursor: default;
}

/* ── ÁREA DE RESOLUCIÓN ── */
.area-resolucion {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  min-height: 140px;
  flex-shrink: 0;
}

/* ── FEEDBACK ── */
.feedback {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
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
  gap: 8px;
}

.btn-siguiente {
  width: 100%;
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 1rem;
  font-weight: bold;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-siguiente:hover {
  background-color: var(--color-principal-hover);
}

/* ── TABLERO LATERAL ── */
.tablero {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: stretch;
  padding: 14px;
}

.tablero-dato {
  flex: none;
  border-right: none;
  border-bottom: 1px solid var(--color-borde);
  padding: 10px 8px;
}

.tablero-dato:last-of-type {
  border-bottom: none;
}

.tablero-salir,
.tablero-ayuda {
  width: 100%;
  justify-content: center;
  margin-top: 8px;
}

.tablero-salir {
  margin-top: auto;
}

.tablero-ayuda {
  margin-top: 8px;
}

.tablero-icono {
  font-size: 1.6rem;
}

.tablero-valor {
  font-size: 1.3rem;
  font-weight: 800;
}

.tablero-etiqueta {
  font-size: 0.9rem;
  font-weight: bold;
}

.tablero-salir,
.tablero-ayuda {
  font-size: 1rem;
}

/* ── CARGANDO ── */
.cargando {
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  color: var(--color-texto-suave);
}

/* ── MODO OSCURO ── */
[data-theme="dark"] .imagen-card img {
  filter: invert(1);
  mix-blend-mode: color-dodge;
}

[data-theme="dark"] .imagen-card {
  border-color: rgba(255, 255, 255, 0.15);
  background-color: #1a1a1a;
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .ilustracion-wrapper {
    display: none !important;
  }

  .area-resolucion {
    height: auto;
    min-height: 0;
    justify-content: flex-start;
    margin-top: 16px;
  }

  .feedback {
    padding: 14px 16px;
    font-size: 0.95rem;
  }

  .intruso-page {
    height: auto;
    overflow: visible;
  }

  .intruso-container {
    display: flex;
    flex-direction: column;
    padding: 16px 12px 30px;
    gap: 16px;
  }

  .tablero {
    order: -1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px;
    gap: 12px 0;
  }

  .tablero-dato {
    flex: 1 1 20%;
    padding: 0 8px;
    border-bottom: none;
    border-right: 1px solid var(--color-borde);
  }

  div.tablero-dato:last-of-type {
    border-right: none;
  }

  .tablero-salir,
  .tablero-ayuda {
    flex: 1 1 45%;
    margin-top: 8px;
    padding: 12px;
    font-size: 1rem;
  }

  .tablero-icono {
    font-size: 1.5rem;
  }

  .tablero-valor {
    font-size: 1.2rem;
  }

  .tablero-etiqueta {
    font-size: 0.8rem;
  }

  .intruso-card {
    padding: 16px;
  }

  .imagenes-grid {
    gap: 12px;
  }
}

</style>
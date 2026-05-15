<script setup>
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

const { finalizarPartida } = usePartida()
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

    <div class="ilustracion-wrapper">
      <img :src="fondoIntruso" alt="" aria-hidden="true" class="ilustracion" />
    </div>

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
      :puntuacionHistorica="0"
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
  height: 100vh; /* Fija la altura exacta de la ventana */
  overflow: hidden; /* Elimina cualquier posibilidad de scroll general */
}

.intruso-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 24px; /* Reducimos el padding inferior que antes era de 60px */
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: stretch;
  flex: 1; /* El contenedor ahora rellena el espacio que deja el Topbar */
  min-height: 0; /* Crucial para que el contenido interno no desborde */
}

.area-resolucion {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  height: 135px; /* Reducido para no desperdiciar tanto espacio en blanco */
  flex-shrink: 0; /* Evita que el contenedor aplaste esta zona */
  margin-top: 0; /* Ya no hace falta el auto, la cuadrícula lo empuja hacia abajo */
}

.zona-juego {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

/* ── ILUSTRACIÓN LATERAL ── */
.ilustracion-wrapper {
  position: absolute;
  left: 0;
  bottom: 80px;
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 500px;
  height: auto;
  display: block;
}

html[data-size="large"] .ilustracion {
  width: 280px;
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

.intruso-card {
  background-color: var(--color-caja);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 6px solid var(--color-principal);
  display: flex;
  flex-direction: column;
  flex: 1; /* Obliga a la tarjeta a estirarse hasta abajo */
  min-height: 0;
}
.etiqueta {
  text-align: center; /* Centra el texto en la tarjeta */
  font-size: 18px; /* Aumentamos el tamaño (antes 13px) */
  color: var(--color-principal); /* Usamos el color granate del tema */
  text-transform: uppercase;
  letter-spacing: 0.1em; /* Un poco más de aire entre letras para darle elegancia */
  font-weight: 800; /* Lo hacemos un poco más grueso */
  margin-bottom: 8px; /* Un pequeño respiro extra hacia abajo */
}

.imagenes-grid {
  display: grid;
  /* Ampliamos el límite de tamaño a 260px para que las imágenes sean más grandes */
  grid-template-columns: repeat(2, minmax(150px, 260px)); 
  justify-content: center;
  align-content: center; /* Centra la cuadrícula verticalmente en la tarjeta */
  gap: 24px; /* Un poco más de aire entre imágenes */
  flex: 1; /* Permite que este bloque absorba todo el espacio central libre */
  min-height: 0;
}

.imagen-card {
  background: var(--color-caja);
  border: 3px solid var(--color-borde);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
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

/* ── FEEDBACK ── */
.feedback {
  border-radius: 14px;
  padding: 18px 22px;
  font-size: 1rem;
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
  gap: 12px;
}

.btn-siguiente {
  width: 100%;
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 18px;
  font-size: 1.1rem;
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
  padding: 20px;
}

.tablero-dato {
  flex: none;
  border-right: none;
  border-bottom: 1px solid var(--color-borde);
  padding: 14px 8px;
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
  /* Esto empuja los botones hacia el fondo del tablero */
  margin-top: auto; 
}

.tablero-ayuda {
  /* Espacio pequeño entre el botón de Salir y el de Ayuda */
  margin-top: 8px; 
}

/* ── TAMAÑO DE TEXTOS Y EMOJIS DEL TABLERO ── */
.tablero-icono {
  font-size: 2rem; /* Aumenta el tamaño del emoji */
}

.tablero-valor {
  font-size: 1.5rem; /* Aumenta el tamaño de los números (ej. 3/3, 10, etc.) */
  font-weight: 800;  /* Lo hace un poco más gordito para que destaque */
}

.tablero-etiqueta {
  font-size: 1rem; /* Aumenta la palabra "RONDA", "PUNTOS", etc. */
  font-weight: bold;
}

/* ── TAMAÑO DE TEXTO DE LOS BOTONES ── */
.tablero-salir,
.tablero-ayuda {
  font-size: 1.1rem; /* Hace que el texto y el icono del botón sean más grandes */
}

/* ── CARGANDO ── */
.cargando {
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  color: var(--color-texto-suave);
}

/* ── ARREGLO PARA IMÁGENES EN MODO OSCURO ── */

/* Reemplaza '[data-theme="dark"]' por la clase exacta que usa tu sitio para el modo oscuro */
/* Ejemplo: html.dark o .is-dark */
[data-theme="dark"] .imagen-card img {
  /* Invierte completamente los colores de la imagen */
  filter: invert(1);
  /* Asegura que los bordes semi-transparentes que se vuelven negros no hagan cosas raras */
  mix-blend-mode: color-dodge; /* Ayuda a que el 'negro invertido' no se vea en absoluto */
}

/* Además, vamos a limpiar el borde de la tarjeta que también se ve raro en tu captura */
[data-theme="dark"] .imagen-card {
  border-color: rgba(255, 255, 255, 0.15); /* Un borde sutil y limpio */
  background-color: #1a1a1a; /* Un gris muy oscuro para la tarjeta */
}

/* ── RESPONSIVE (MÓVILES Y TABLETS PEQUEÑAS) ── */
@media (max-width: 768px) {

    .ilustracion-wrapper {
    display: none !important;
  }

  /* Arreglo para el desbordamiento del feedback en móvil */
  .area-resolucion {
    height: auto; /* Quitamos la altura fija estricta para que pueda crecer */
    min-height: 180px; /* Reservamos un poco más de espacio inicial */
    justify-content: flex-start; /* Hacemos que el contenido empuje hacia abajo, no hacia arriba */
    margin-top: 16px; /* Separación extra respecto a las imágenes */
  }
  
  /* Hacemos el texto un pelín más compacto en móvil para que encaje mejor */
  .feedback {
    padding: 14px 16px;
    font-size: 0.95rem;
  }
  
  .intruso-page {
    height: auto; /* Permite scroll natural en móvil */
    overflow: visible;
  }

  .intruso-container {
    display: flex; /* Cambiamos de Grid a Flex para apilar fácilmente */
    flex-direction: column;
    padding: 16px 12px 30px;
    gap: 16px;
  }

  /* 1. Subir el tablero arriba del todo */
  .tablero {
    order: -1; 
    display: flex;
    flex-direction: row; /* Elementos en horizontal */
    flex-wrap: wrap; /* Permite que los botones salten a la línea de abajo */
    padding: 16px;
    gap: 12px 0; /* Espacio vertical entre filas, 0 horizontal porque usamos bordes */
  }

  /* 2. Acomodar los datos (Ronda, Puntos, Aciertos) en la primera fila */
  .tablero-dato {
    flex: 1 1 20%; /* Se reparten el espacio equitativamente */
    padding: 0 8px;
    border-bottom: none; /* Quitamos la línea de abajo del escritorio */
    border-right: 1px solid var(--color-borde); /* Ponemos línea separadora vertical */
  }

  /* Le quitamos la línea derecha al último dato (Aciertos o Tiempo) */
  div.tablero-dato:last-of-type {
    border-right: none;
  }

  /* 3. Acomodar los botones (Salir, Ayuda) en la segunda fila */
  .tablero-salir,
  .tablero-ayuda {
    flex: 1 1 45%; /* Toman casi la mitad del ancho cada uno para emparejarse */
    margin-top: 8px; /* Separación de la fila de datos */
    padding: 12px;
    font-size: 1rem;
  }

  /* 4. Reducir un poco el tamaño de los textos para que quepa bien en horizontal */
  .tablero-icono {
    font-size: 1.5rem;
  }
  
  .tablero-valor {
    font-size: 1.2rem;
  }

  .tablero-etiqueta {
    font-size: 0.8rem;
  }

  /* 5. Ajustes de la tarjeta de juego para ganar espacio */
  .intruso-card {
    padding: 16px;
  }

  .imagenes-grid {
    gap: 12px;
  }
}

</style>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import estadisticasService from '@/services/estadisticasService'
import iconoRefran from '@/assets/icono-refran.png'
import iconoMemory from '@/assets/icono-memory.png'
import iconoIntruso from '@/assets/icono-intruso.png'
import { mensajesTendencia, mensajesStats, mensajesGrafico, mensajesComparar } from '@/utils/mensajes'
import fondoEstadisticas from '@/assets/fondo-estadisticas.png'

const juegos = [
  { id: 1, nombre: 'Acaba el refrán', icono: iconoRefran },
  { id: 2, nombre: 'Encuentra el intruso', icono: iconoIntruso },
  { id: 3, nombre: 'Memory', icono: iconoMemory }
]

const juegoSeleccionado = ref(null)
const resumen = ref([])
const tendencia = ref(null)
const cargando = ref(false)
const cargandoTendencia = ref(false)
const evolucion = ref([])
const cargandoEvolucion = ref(false)

// Datos del dashboard (para el comparativo entre juegos)
const dashboard = ref(null)
const cargandoDashboard = ref(false)
const comparativoAbierto = ref(false)

// Computed: stats agregadas del juego actual
const datosJuegoActual = computed(() => {
  if (!juegoSeleccionado.value) return null
  return resumen.value.find(item => item.juego_id === juegoSeleccionado.value) || null
})

// Determina el color del panel de tendencia
const claseTendencia = computed(() => {
  if (cargandoTendencia.value) return 'cargando'
  if (!tendencia.value || tendencia.value.tendencia === null) return 'sin-datos'
  const cambio = tendencia.value.tendencia.porcentaje_cambio
  if (cambio >= 5) return 'positiva'
  if (cambio <= -5) return 'negativa'
  return 'neutra'
})

const iconoTendencia = computed(() => {
  const clase = claseTendencia.value
  if (clase === 'positiva') return '📈'
  if (clase === 'negativa') return '📉'
  if (clase === 'neutra') return '➖'
  return '🎯'
})

const tituloTendencia = computed(() => {
  if (cargandoTendencia.value) return mensajesTendencia.titulos.cargando
  if (!tendencia.value) return ''
  const m = tendencia.value.mensaje
  if (m === 'sin_datos') return mensajesTendencia.titulos.sin_datos
  if (m === 'pocas_partidas') return mensajesTendencia.titulos.pocas_partidas
  const cambio = tendencia.value.tendencia.porcentaje_cambio
  if (cambio >= 5) return mensajesTendencia.titulos.mejora(cambio)
  if (cambio <= -5) return mensajesTendencia.titulos.bajada(cambio)
  return mensajesTendencia.titulos.estable
})

const subtituloTendencia = computed(() => {
  if (!tendencia.value) return ''
  const m = tendencia.value.mensaje
  if (m === 'sin_datos') return mensajesTendencia.subtitulos.sin_datos
  if (m === 'pocas_partidas') return mensajesTendencia.subtitulos.pocas_partidas(tendencia.value.total_partidas)
  return mensajesTendencia.subtitulos.ok
})

const consejoTendencia = computed(() => {
  if (!tendencia.value) return ''
  const m = tendencia.value.mensaje
  if (m === 'sin_datos') return mensajesTendencia.consejos.sin_datos
  if (m === 'pocas_partidas') return mensajesTendencia.consejos.pocas_partidas
  const cambio = tendencia.value.tendencia.porcentaje_cambio
  if (cambio >= 5) return mensajesTendencia.consejos.mejora
  if (cambio <= -5) return mensajesTendencia.consejos.bajada
  return mensajesTendencia.consejos.estable
})

// Series del gráfico
const seriesGrafico = computed(() => {
  if (!evolucion.value || evolucion.value.length === 0) return []
  const ordenadas = [...evolucion.value].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  )
  return [{
    name: 'Puntuación',
    data: ordenadas.map(partida => ({
      x: new Date(partida.fecha).getTime(),
      y: partida.puntuacion
    }))
  }]
})

const opcionesGrafico = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    animations: { enabled: true, speed: 600 },
    fontFamily: 'Nunito, sans-serif'
  },
  colors: ['#7b1f2e'],
  stroke: { curve: 'smooth', width: 4 },
  markers: { size: 7, strokeWidth: 2, hover: { size: 10 } },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeFormatter: { year: 'yyyy', month: "MMM 'yy", day: 'd MMM' },
      style: { fontSize: '13px' }
    }
  },
  yaxis: {
    title: { text: 'Puntuación', style: { fontSize: '14px' } },
    labels: { style: { fontSize: '13px' } }
  },
  tooltip: {
    x: { format: 'd MMM yyyy' },
    y: { formatter: (val) => `${val} puntos` }
  },
  grid: { borderColor: '#ccbbaa', strokeDashArray: 4 }
}))

// Computed: clasifica los 3 juegos en mejor/estable/peor según su tendencia
const comparativaJuegos = computed(() => {
  if (!dashboard.value || !dashboard.value.tendencias) return null

  const tendencias = dashboard.value.tendencias

  // Separamos los juegos con datos de los que no tienen suficientes
  const conDatos = tendencias.filter(t => t.tendencia !== null)
  const sinDatos = tendencias.filter(t => t.tendencia === null)

  // Si menos de 2 juegos tienen datos, no hay comparativa real
  if (conDatos.length < 2) {
    return {
      sinSuficientesDatos: true,
      sinDatos: sinDatos.map(t => ({
        juego_id: t.juego_id,
        nombre: nombreJuego(t.juego_id)
      }))
    }
  }

  // Ordenamos por porcentaje_cambio descendente: el primero es el mejor
  const ordenados = [...conDatos].sort(
    (a, b) => b.tendencia.porcentaje_cambio - a.tendencia.porcentaje_cambio
  )

  const mejor = ordenados[0]
  const peor = ordenados[ordenados.length - 1]
  const estable = ordenados.length === 3 ? ordenados[1] : null

  return {
    sinSuficientesDatos: false,
    mejor: {
      juego_id: mejor.juego_id,
      nombre: nombreJuego(mejor.juego_id),
      porcentaje: mejor.tendencia.porcentaje_cambio
    },
    estable: estable ? {
      juego_id: estable.juego_id,
      nombre: nombreJuego(estable.juego_id),
      porcentaje: estable.tendencia.porcentaje_cambio
    } : null,
    peor: {
      juego_id: peor.juego_id,
      nombre: nombreJuego(peor.juego_id),
      porcentaje: peor.tendencia.porcentaje_cambio
    },
    sinDatos: sinDatos.map(t => ({
      juego_id: t.juego_id,
      nombre: nombreJuego(t.juego_id)
    }))
  }
})

// Helper: nombre del juego dado un id
function nombreJuego(juegoId) {
  const j = juegos.find(j => j.id === juegoId)
  return j ? j.nombre : ''
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return '—'
  return new Date(fechaISO).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function formatearMedia(media) {
  if (media === null || media === undefined) return '—'
  return parseFloat(media).toFixed(1)
}

function seleccionarJuego(juegoId) {
  if (juegoSeleccionado.value === juegoId) {
    juegoSeleccionado.value = null
  } else {
    juegoSeleccionado.value = juegoId
  }
}

onMounted(async () => {
  cargando.value = true
  cargandoDashboard.value = true
  try {
    const [resumenData, dashboardData] = await Promise.all([
      estadisticasService.getResumen(),
      estadisticasService.getDashboard()
    ])
    resumen.value = resumenData
    dashboard.value = dashboardData
  } catch (error) {
    console.error('Error cargando datos de estadísticas:', error)
  } finally {
    cargando.value = false
    cargandoDashboard.value = false
  }
})

watch(juegoSeleccionado, async (nuevoJuegoId) => {
  if (!nuevoJuegoId) {
    tendencia.value = null
    evolucion.value = []
    return
  }
  cargandoTendencia.value = true
  cargandoEvolucion.value = true
  try {
    const [tendenciaData, evolucionData] = await Promise.all([
      estadisticasService.getTendencia(nuevoJuegoId),
      estadisticasService.getEvolucion(nuevoJuegoId)
    ])
    tendencia.value = tendenciaData
    evolucion.value = evolucionData
  } catch (error) {
    console.error('Error cargando datos del juego:', error)
    tendencia.value = null
    evolucion.value = []
  } finally {
    cargandoTendencia.value = false
    cargandoEvolucion.value = false
  }
})

function formatearPorcentaje(porcentaje) {
  const abs = Math.abs(porcentaje)
  if (abs >= 80) return porcentaje >= 0 ? '+80%↑' : '-80%↓'
  return `${porcentaje >= 0 ? '+' : ''}${porcentaje.toFixed(1)}%`
}
</script>

<template>
  <div class="estadisticas-page">
    <AppTopbar />

    <div class="ilustracion-wrapper">
      <img :src="fondoEstadisticas" alt="" aria-hidden="true" class="ilustracion" />
    </div>

    <main class="estadisticas-container">
    <h1 class="titulo-estadisticas">📊 Mis estadísticas</h1>

    <!-- Selector de juego -->
    <div class="selector-juegos">
      <button
        v-for="juego in juegos"
        :key="juego.id"
        class="tarjeta-juego"
        :class="{ activa: juegoSeleccionado === juego.id }"
        :data-juego="juego.id"
        @click="seleccionarJuego(juego.id)"
      >
        <img :src="juego.icono" :alt="juego.nombre" class="icono-juego" />
        <span class="nombre-juego">{{ juego.nombre }}</span>
      </button>
    </div>

    <!-- Estados antes de seleccionar -->
    <div v-if="cargando" class="area-detalles">
      <p class="mensaje-vacio">Cargando tus estadísticas...</p>
    </div>

    <div v-else-if="!juegoSeleccionado" class="area-detalles">
      <p class="mensaje-intro">📊 Aquí puede ver cómo va progresando en cada juego.</p>
      <p class="mensaje-intro">Pulse en uno de los juegos de arriba para ver sus estadísticas detalladas 😊</p>
    </div>

    <div v-else-if="!datosJuegoActual" class="area-detalles">
      <p class="mensaje-vacio">
        Aún no has jugado a este juego.
        <br />
        Cuando hagas tu primera partida, verás aquí tu progreso.
      </p>
    </div>

    <!-- Contenido cuando hay datos -->
    <template v-else>
      <!-- Panel de tendencia -->
      <div class="panel-tendencia" :class="claseTendencia">
        <div class="tendencia-icono">{{ iconoTendencia }}</div>
        <div class="tendencia-texto">
          <p class="tendencia-titulo">{{ tituloTendencia }}</p>
          <p class="tendencia-subtitulo">{{ subtituloTendencia }}</p>
          <p v-if="consejoTendencia" class="tendencia-consejo">
            <strong>💡 Consejo:</strong> {{ consejoTendencia }}
          </p>
        </div>
      </div>

      <!-- Stat-cards -->
      <div class="stats-grid">
        <div class="stat-card stat-color-azul">
          <div class="stat-icono">🎮</div>
          <div class="stat-numero">{{ datosJuegoActual.total_partidas }}</div>
          <div class="stat-label">Total de partidas</div>
          <p class="stat-descripcion">{{ mensajesStats.total_partidas }}</p>
        </div>
        <div class="stat-card stat-color-dorado">
          <div class="stat-icono">🏆</div>
          <div class="stat-numero">{{ datosJuegoActual.mejor_puntuacion }}</div>
          <div class="stat-label">Mejor puntuación</div>
          <p class="stat-descripcion">{{ mensajesStats.mejor_puntuacion }}</p>
        </div>
        <div class="stat-card stat-color-granate">
          <div class="stat-icono">📊</div>
          <div class="stat-numero">{{ formatearMedia(datosJuegoActual.puntuacion_media) }}</div>
          <div class="stat-label">Puntuación media</div>
          <p class="stat-descripcion">{{ mensajesStats.puntuacion_media }}</p>
        </div>
        <div class="stat-card stat-color-verde">
          <div class="stat-icono">📅</div>
          <div class="stat-numero stat-fecha">{{ formatearFecha(datosJuegoActual.ultima_partida) }}</div>
          <div class="stat-label">Última partida</div>
          <p class="stat-descripcion">{{ mensajesStats.ultima_partida }}</p>
        </div>
      </div>

      <!-- Gráfico de evolución -->
      <div class="grafico-container">
        <h2 class="grafico-titulo">📈 {{ mensajesGrafico.titulo }}</h2>
        <p class="grafico-descripcion">{{ mensajesGrafico.descripcion }}</p>
        <div v-if="evolucion.length < 2" class="grafico-vacio">
          <p>{{ mensajesGrafico.unaSolaPartida }}</p>
        </div>
        <apexchart
          v-else
          type="line"
          height="200"
          :options="opcionesGrafico"
          :series="seriesGrafico"
        />
      </div>
    </template>
    <!-- Acordeón de comparativa entre juegos -->
<section class="comparar-section" v-if="dashboard">
  <button
    class="btn-comparar"
    :class="{ abierto: comparativoAbierto }"
    @click="comparativoAbierto = !comparativoAbierto"
    :aria-expanded="comparativoAbierto"
  >
    <span class="btn-comparar-texto">
      🎯 {{ mensajesComparar.titulo }}
    </span>
    <span class="btn-comparar-flecha" aria-hidden="true">
      {{ comparativoAbierto ? '▲' : '▼' }}
    </span>
  </button>

  <div v-if="comparativoAbierto" class="comparar-contenido">
    <p class="comparar-subtitulo">{{ mensajesComparar.subtitulo }}</p>

    <div v-if="comparativaJuegos && comparativaJuegos.sinSuficientesDatos" class="comparar-vacio">
      <p>Necesitas jugar unas cuantas partidas más en al menos dos juegos para poder compararlos.</p>
    </div>

    <div v-else-if="comparativaJuegos" class="comparar-tarjetas">
      <!-- Mejor -->
      <div class="tarjeta-comparar tipo-mejor">
        <p class="tarjeta-comparar-etiqueta">🏆 {{ mensajesComparar.etiquetas.mejor }}</p>
        <p class="tarjeta-comparar-juego">{{ comparativaJuegos.mejor.nombre }}</p>
        <p class="tarjeta-comparar-porcentaje">
          {{ formatearPorcentaje(comparativaJuegos.mejor.porcentaje) }}
        </p>
        <p class="tarjeta-comparar-consejo">{{ mensajesComparar.consejos.mejor }}</p>
      </div>

      <!-- Estable -->
      <div v-if="comparativaJuegos.estable" class="tarjeta-comparar tipo-estable">
        <p class="tarjeta-comparar-etiqueta">➖ {{ mensajesComparar.etiquetas.estable }}</p>
        <p class="tarjeta-comparar-juego">{{ comparativaJuegos.estable.nombre }}</p>
        <p class="tarjeta-comparar-porcentaje">
          {{ formatearPorcentaje(comparativaJuegos.estable.porcentaje) }}
        </p>
        <p class="tarjeta-comparar-consejo">{{ mensajesComparar.consejos.estable }}</p>
      </div>

      <!-- Peor -->
      <div class="tarjeta-comparar tipo-peor">
        <p class="tarjeta-comparar-etiqueta">📉 {{ mensajesComparar.etiquetas.peor }}</p>
        <p class="tarjeta-comparar-juego">{{ comparativaJuegos.peor.nombre }}</p>
        <p class="tarjeta-comparar-porcentaje">
          {{ formatearPorcentaje(comparativaJuegos.peor.porcentaje) }}
        </p>
        <p class="tarjeta-comparar-consejo">{{ mensajesComparar.consejos.peor }}</p>
      </div>

      <!-- Juegos sin datos suficientes -->
      <div v-for="juego in comparativaJuegos.sinDatos" :key="juego.juego_id" class="tarjeta-comparar tipo-sin-datos">
        <p class="tarjeta-comparar-etiqueta">⏳ {{ mensajesComparar.etiquetas.sin_datos }}</p>
        <p class="tarjeta-comparar-juego">{{ juego.nombre }}</p>
        <p class="tarjeta-comparar-consejo">{{ mensajesComparar.consejos.sin_datos }}</p>
      </div>
    </div>
  </div>
</section>
    </main>
  </div>
</template>

<style scoped>
/* ── PÁGINA ── */
.estadisticas-page {
  position: relative;
}

/* ── ILUSTRACIÓN (esquina inferior derecha) ── */
.ilustracion-wrapper {
  position: fixed;
  right: -30px;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.ilustracion {
  width: 250px;
  height: auto;
  display: block;
}

/* ── CONTENEDOR DE CONTENIDO ── */
.estadisticas-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px 24px 32px;
  width: 100%;
}

.titulo-estadisticas {
  text-align: center;
  color: var(--color-principal);
  font-size: 24px;
  margin-bottom: 16px;
}

/* ── SELECTOR DE JUEGO ── */
.selector-juegos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.tarjeta-juego {
  background: var(--color-caja);
  border: 3px solid var(--color-borde);
  border-radius: 16px;
  padding: 16px 12px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.tarjeta-juego:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.icono-juego {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.tarjeta-juego.activa {
  border-color: var(--color-principal);
  border-width: 5px;
}

.nombre-juego {
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.area-detalles {
  background: var(--color-caja);
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  border: 1px solid var(--color-borde);
}

.mensaje-vacio {
  color: var(--color-texto-suave);
  font-size: 16px;
}

.mensaje-intro {
  color: var(--color-texto);
  font-size: 16px;
  line-height: 1.6;
  text-align: center;
  margin: 4px 0;
}

/* ── PANEL DE TENDENCIA ── */
.panel-tendencia {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-caja);
  border-left: 8px solid var(--color-borde);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.panel-tendencia.positiva {
  border-left-color: #2e7d32;
  background: linear-gradient(135deg, #e8f5e9 0%, var(--color-caja) 60%);
}

.panel-tendencia.negativa {
  border-left-color: #c62828;
  background: linear-gradient(135deg, #ffebee 0%, var(--color-caja) 60%);
}

.panel-tendencia.neutra {
  border-left-color: #6c757d;
  background: linear-gradient(135deg, #e8e8e8 0%, var(--color-caja) 60%);
}

.panel-tendencia.sin-datos,
.panel-tendencia.cargando {
  border-left-color: var(--color-borde);
  background: linear-gradient(135deg, #ede8e0 0%, var(--color-caja) 60%);
}

.tendencia-icono {
  font-size: 40px;
  line-height: 1;
  flex-shrink: 0;
}

.tendencia-texto {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tendencia-titulo {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-texto);
  margin: 0;
}

.tendencia-subtitulo {
  font-size: 14px;
  color: var(--color-texto-suave);
  margin: 0;
}

.tendencia-consejo {
  font-size: 13px;
  color: var(--color-texto);
  margin: 6px 0 0 0;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  line-height: 1.5;
}

.tendencia-consejo strong {
  color: var(--color-principal);
  font-weight: 800;
}

/* ── STAT-CARDS ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--color-caja);
  border: 2px solid var(--color-borde);
  border-top-width: 6px;
  border-radius: 12px;
  padding: 14px 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-color-azul       { border-top-color: #1976d2; }
.stat-color-dorado     { border-top-color: #f9a825; }
.stat-color-granate    { border-top-color: var(--color-principal); }
.stat-color-verde      { border-top-color: #2e7d32; }

.stat-icono {
  font-size: 22px;
  line-height: 1;
}

.stat-numero {
  font-size: 28px;
  font-weight: 900;
  color: var(--color-texto);
  line-height: 1.1;
}

.stat-color-azul .stat-numero    { color: #1976d2; }
.stat-color-dorado .stat-numero  { color: #f9a825; }
.stat-color-granate .stat-numero { color: var(--color-principal); }
.stat-color-verde .stat-numero   { color: #2e7d32; }

.stat-fecha {
  font-size: 14px;
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-descripcion {
  font-size: 12px;
  color: var(--color-texto-suave);
  margin: 4px 0 0 0;
  line-height: 1.4;
}

/* ── GRÁFICO DE EVOLUCIÓN ── */
.grafico-container {
  background: var(--color-caja);
  border: 2px solid var(--color-borde);
  border-radius: 16px;
  padding: 16px;
  margin-top: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.grafico-titulo {
  font-size: 18px;
  color: var(--color-principal);
  margin: 0 0 4px 0;
}

.grafico-descripcion {
  font-size: 13px;
  color: var(--color-texto-suave);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.grafico-vacio {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-texto-suave);
  font-size: 15px;
  font-style: italic;
}

/* ── ACORDEÓN COMPARATIVA ── */
.comparar-section {
  margin-top: 16px;
}

.btn-comparar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-principal);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.btn-comparar:hover {
  background: var(--color-principal-hover);
  transform: translateY(-2px);
}

.btn-comparar.abierto {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-comparar-flecha {
  font-size: 14px;
}

.comparar-contenido {
  background: var(--color-caja);
  border: 2px solid var(--color-principal);
  border-top: none;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 16px;
  animation: desplegar 0.3s ease;
}

@keyframes desplegar {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.comparar-subtitulo {
  font-size: 14px;
  color: var(--color-texto-suave);
  margin: 0 0 14px 0;
  text-align: center;
  line-height: 1.5;
}

.comparar-tarjetas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.tarjeta-comparar {
  background: var(--color-fondo);
  border-radius: 12px;
  padding: 14px;
  border-top: 5px solid;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tarjeta-comparar.tipo-mejor      { border-top-color: #2e7d32; }
.tarjeta-comparar.tipo-estable    { border-top-color: #6c757d; }
.tarjeta-comparar.tipo-peor       { border-top-color: #c62828; }
.tarjeta-comparar.tipo-sin-datos  { border-top-color: var(--color-borde); opacity: 0.85; }

.tarjeta-comparar-etiqueta {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.tarjeta-comparar-juego {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-texto);
  margin: 0;
}

.tarjeta-comparar-porcentaje {
  font-size: 22px;
  font-weight: 900;
  margin: 0;
}

.tipo-mejor .tarjeta-comparar-porcentaje      { color: #2e7d32; }
.tipo-estable .tarjeta-comparar-porcentaje    { color: #6c757d; }
.tipo-peor .tarjeta-comparar-porcentaje       { color: #c62828; }

.tarjeta-comparar-consejo {
  font-size: 13px;
  color: var(--color-texto);
  margin: 0;
  line-height: 1.5;
}

.comparar-vacio {
  text-align: center;
  padding: 20px;
  color: var(--color-texto-suave);
  font-size: 15px;
  font-style: italic;
}

/* ── RESPONSIVE ── */
@media (max-width: 1200px) {
  .ilustracion-wrapper {
    display: none !important;
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .estadisticas-container {
    padding: 16px 12px 30px;
  }

  .titulo-estadisticas {
    font-size: 22px;
    margin-bottom: 14px;
  }

  .selector-juegos {
    gap: 8px;
    margin-bottom: 14px;
  }

  .tarjeta-juego {
    padding: 12px 6px;
    gap: 6px;
  }

  .icono-juego {
    width: 40px;
    height: 40px;
  }

  .nombre-juego {
    font-size: 13px;
    line-height: 1.2;
  }

  .tarjeta-juego.activa {
    border-width: 4px;
  }

  .panel-tendencia {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
  }

  .tendencia-icono {
    font-size: 36px;
  }

  .tendencia-titulo {
    font-size: 18px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-card {
    padding: 12px 8px;
    gap: 3px;
  }

  .stat-numero {
    font-size: 22px;
  }

  .grafico-container {
    padding: 12px;
    margin-top: 12px;
  }

  .comparar-section {
    margin-top: 12px;
  }

  .btn-comparar {
    padding: 12px 16px;
    font-size: 15px;
  }

  .comparar-contenido {
    padding: 14px 12px;
  }

  .comparar-tarjetas {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

</style>
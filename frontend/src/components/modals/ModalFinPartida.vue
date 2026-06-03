<script setup>
// Modal de fin de partida: muestra puntuación, progreso, estadísticas y comparativa con la media histórica
import { computed } from 'vue'

const props = defineProps({
    puntos: Number,
    acertados: Number,
    total: Number,
    saltados: { type: Number, default: null },
    fallos: { type: Number, default: null },
    tiempo: { type: Number, default: null },
    puntuacionHistorica: Number,
    labelAcertados: { type: String, default: 'elementos' }
})

const emit = defineEmits(['jugarOtraVez', 'cerrar'])

const medalla = computed(() => {
    const ratio = props.total > 0 ? props.acertados / props.total : 0
    if (ratio >= 0.8) return { emoji: '🥇', titulo: '¡Excelente resultado!' }
    if (ratio >= 0.5) return { emoji: '🥈', titulo: '¡Buen trabajo!' }
    return { emoji: '🥉', titulo: '¡Sigue practicando!' }
})

const progreso = computed(() =>
    props.total > 0 ? Math.round(props.acertados / props.total * 100) : 0
)

const diferencia = computed(() =>
    props.puntuacionHistorica != null ? props.puntos - props.puntuacionHistorica : null
)
</script>

<template>
    <div class="modal">
        <div class="modal-content caja modal-fin">

            <!-- Header con gradiente y medalla -->
            <div class="fin-header">
                <span class="fin-medalla">{{ medalla.emoji }}</span>
                <div class="fin-header-texto">
                    <h2>¡Partida completada!</h2>
                    <p class="fin-nivel">{{ medalla.titulo }}</p>
                </div>
            </div>

            <div class="fin-cuerpo">

                <!-- Puntuación destacada -->
                <div class="puntos-hero">
                    <span class="puntos-valor">{{ puntos }}</span>
                    <span class="puntos-etiqueta">puntos</span>
                </div>

                <!-- Barra de progreso de aciertos -->
                <div class="progreso-wrapper">
                    <div class="progreso-fill" :style="{ width: progreso + '%' }"></div>
                    <span class="progreso-label">{{ acertados }} de {{ total }} {{ labelAcertados }}</span>
                </div>

                <!-- Stats secundarias (solo si existen) -->
                <div class="stats-row" v-if="saltados !== null || fallos !== null || tiempo !== null">
                    <div class="stat-pill" v-if="saltados !== null">
                        <span class="stat-pill-icono">⏭️</span>
                        <span class="stat-pill-valor">{{ saltados }}</span>
                        <span class="stat-pill-label">Saltados</span>
                    </div>
                    <div class="stat-pill" v-if="fallos !== null">
                        <span class="stat-pill-icono">❌</span>
                        <span class="stat-pill-valor">{{ fallos }}</span>
                        <span class="stat-pill-label">Fallos</span>
                    </div>
                    <div class="stat-pill" v-if="tiempo !== null">
                        <span class="stat-pill-icono">⏱️</span>
                        <span class="stat-pill-valor">{{ tiempo }}s</span>
                        <span class="stat-pill-label">Tiempo</span>
                    </div>
                </div>

                <!-- Comparativa con histórico -->
                <div class="historico" v-if="puntuacionHistorica !== null">
                    <span class="historico-label">📊 Media histórica: <strong>{{ puntuacionHistorica }} pts</strong></span>
                    <span v-if="diferencia !== null" class="historico-diff" :class="diferencia >= 0 ? 'positivo' : 'negativo'">
                        {{ diferencia >= 0 ? '+' : '' }}{{ diferencia }} pts
                    </span>
                </div>

                <!-- Acciones -->
                <div class="acciones">
                    <button class="btn-principal" @click="$emit('jugarOtraVez')">🔄 Jugar otra vez</button>
                    <button class="btn-menu" @click="$emit('cerrar')">← Volver al menú</button>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-fin {
    padding: 0 !important;
    gap: 0 !important;
    border-top: none !important;
    overflow: hidden !important;
}

/* ── Header ── */
.fin-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.4rem 1.75rem;
    background: linear-gradient(135deg, var(--color-principal) 0%, #9b2335 100%);
}

.fin-medalla {
    font-size: 2.8rem;
    line-height: 1;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
}

.fin-header h2 {
    color: white !important;
    font-size: 1.2rem;
    text-align: left !important;
    margin: 0;
}

.fin-nivel {
    margin: 3px 0 0 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.82);
    font-weight: 600;
}

/* ── Cuerpo ── */
.fin-cuerpo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem 1.75rem 1.75rem;
}

/* ── Puntuación ── */
.puntos-hero {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.4rem;
}

.puntos-valor {
    font-size: 3.5rem;
    font-weight: 900;
    color: var(--color-principal);
    line-height: 1;
}

.puntos-etiqueta {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-texto-suave);
}

/* ── Barra de progreso ── */
.progreso-wrapper {
    position: relative;
    height: 34px;
    background: var(--color-fondo);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-borde);
}

.progreso-fill {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: linear-gradient(90deg, #2e7d32, #4caf50);
    border-radius: 8px;
    transition: width 0.9s cubic-bezier(0.4, 0, 0.2, 1);
}

.progreso-label {
    position: relative;
    z-index: 1;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--color-texto);
}

/* ── Stats secundarias ── */
.stats-row {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.stat-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    background: var(--color-fondo);
    border: 1px solid var(--color-borde);
    border-radius: 12px;
    padding: 0.6rem 1.1rem;
    min-width: 72px;
}

.stat-pill-icono { font-size: 1rem; }

.stat-pill-valor {
    font-size: 1.3rem;
    font-weight: 900;
    color: var(--color-principal);
    line-height: 1;
}

.stat-pill-label {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--color-texto-suave);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

/* ── Histórico ── */
.historico {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--color-fondo);
    border: 1px solid var(--color-borde);
    border-radius: 10px;
    padding: 0.65rem 1rem;
    font-size: 0.88rem;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.historico-label {
    color: var(--color-texto);
    font-weight: 600;
}

.historico-label strong {
    color: var(--color-principal);
}

.historico-diff {
    font-weight: 800;
    font-size: 0.88rem;
    padding: 3px 10px;
    border-radius: 20px;
}

.historico-diff.positivo { color: #2e7d32; background: #e8f5e9; }
.historico-diff.negativo { color: #c62828; background: #ffebee; }

/* ── Acciones ── */
.acciones {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.btn-menu {
    width: 100%;
    background: transparent;
    color: var(--color-texto-suave);
    border: 1.5px solid var(--color-borde);
    border-radius: 12px;
    padding: 13px 20px;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-menu:hover {
    background: var(--color-fondo);
    color: var(--color-texto);
    border-color: var(--color-texto-suave);
}

@media (max-width: 768px) {
    .fin-header { padding: 1.1rem 1.25rem; gap: 0.75rem; }
    .fin-medalla { font-size: 2.2rem; }
    .fin-header h2 { font-size: 1rem; }
    .puntos-valor { font-size: 2.8rem; }
    .fin-cuerpo { padding: 1rem 1.25rem 1.25rem; gap: 0.75rem; }
}
</style>

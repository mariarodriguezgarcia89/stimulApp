<script setup>
const props = defineProps({
    puntos: Number,
    acertados: Number,
    total: Number,
    saltados: { type: Number, default: null },
    puntuacionHistorica: Number,
    labelAcertados: { type: String, default: 'elementos' }
})

const emit = defineEmits(['jugarOtraVez', 'cerrar'])
</script>

<template>
    <div class="modal">
        <div class="modal-content caja">

            <div class="modal-header">
                <span class="icono-principal">🎉</span>
                <h2>¡Partida terminada!</h2>
            </div>

            <div class="estadisticas">
                <div class="stat-card">
                    <span class="stat-numero">{{ puntos }}</span>
                    <span class="stat-label">Puntos</span>
                </div>
                <div class="stat-card">
                    <span class="stat-numero">{{ acertados }}/{{ total }}</span>
                    <span class="stat-label">{{ labelAcertados }} acertados</span>
                </div>
                <div class="stat-card" v-if="saltados !== null">
                    <span class="stat-numero">{{ saltados }}</span>
                    <span class="stat-label">Saltados</span>
                </div>
            </div>

            <div class="historico" v-if="puntuacionHistorica">
                <span class="historico-label">📊 Tu media histórica</span>
                <span class="historico-valor">{{ puntuacionHistorica }} pts</span>
            </div>

            <div class="acciones">
                <button class="btn-principal" @click="$emit('cerrar')">← Volver al menú</button>
                <button class="btn-jugar" @click="$emit('jugarOtraVez')">🔄 Jugar otra vez</button>
            </div>

        </div>
    </div>
</template>
<style scoped>
.estadisticas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  background-color: var(--color-fondo);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
}

.stat-numero {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--color-principal);
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-texto-suave);
}

.historico {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-fondo);
  border-radius: 12px;
  padding: 1rem 1.2rem;
}

.historico-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-texto);
}

.historico-valor {
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--color-principal);
}

.acciones {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-jugar {
  width: 100%;
  background-color: transparent;
  color: var(--color-principal);
  border: 2px solid var(--color-principal);
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: bold;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-jugar:hover {
  background-color: var(--color-principal);
  color: white;
}

@media (max-width: 768px) {
  .estadisticas {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

   .stat-card {
    padding: 1rem 0.5rem;
  }

  .stat-numero {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .historico {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>
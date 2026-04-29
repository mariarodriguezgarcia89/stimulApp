<script setup>
const props = defineProps({
    icono: { type: String, default: '🎮' },
    titulo: { type: String, default: '¿Cómo quieres jugar?' },
    descripcionFacil: { type: String, default: '' },
    descripcionDificil: { type: String, default: '' }
})

const emit = defineEmits(['seleccionar', 'cerrar'])
</script>

<template>
    <div class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="icono-principal">{{ icono }}</span>
                <h2>{{ titulo }}</h2>
            </div>
            <div class="dificultades">
                <button class="btn-dificultad" @click="$emit('seleccionar', 'facil')">
                    <span class="btn-icono">🌟</span>
                    <div class="btn-texto">
                        <span class="btn-titulo">Normal</span>
                        <span class="btn-descripcion">{{ descripcionFacil }}</span>
                    </div>
                </button>
                <button class="btn-dificultad" @click="$emit('seleccionar', 'dificil')">
                    <span class="btn-icono">🏆</span>
                    <div class="btn-texto">
                        <span class="btn-titulo">Avanzado</span>
                        <span class="btn-descripcion">{{ descripcionDificil }}</span>
                    </div>
                </button>
            </div>
            <button class="btn-cerrar" @click="$emit('cerrar')">Cerrar</button>
        </div>
    </div>
</template>
<style scoped>
.dificultades {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-dificultad {
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
  font-family: inherit;
}

.btn-dificultad:hover {
  background-color: var(--color-principal-hover);
  transform: scale(1.02);
}

.btn-icono {
  font-size: 2rem;
  flex-shrink: 0;
}

.btn-texto {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-titulo {
  font-size: 1.2rem;
  font-weight: bold;
}

.btn-descripcion {
  font-size: 1rem;
  opacity: 0.85;
}

.btn-cerrar {
  background-color: transparent;
  color: var(--color-texto-suave);
  border: 1px solid var(--color-borde);
  border-radius: 12px;
  padding: 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cerrar:hover {
  background-color: var(--color-borde);
}

@media (max-width: 768px) {
  .btn-dificultad {
    padding: 1rem 1.2rem;
  }
  .btn-titulo {
    font-size: 1rem;
  }
  .btn-descripcion {
    font-size: 0.9rem;
  }
}
</style>
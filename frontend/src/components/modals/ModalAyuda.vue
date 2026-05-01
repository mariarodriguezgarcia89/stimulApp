<script setup>
const props = defineProps({
    instrucciones: { type: Array, default: () => [] },
    elementos: { type: Array, default: () => [] }
})

const emit = defineEmits(['cerrar'])
</script>

<template>
    <div class="modal">
        <div class="modal-content caja modal-content--ancho">

            <div class="modal-header">
                <span class="icono-principal">❓</span>
                <h2>¿Cómo se juega?</h2>
            </div>

            <div class="secciones-grid">

                <!-- INSTRUCCIONES -->
                <div class="seccion">
                    <p class="seccion-titulo">Instrucciones</p>
                    <ol class="instrucciones-lista">
                        <li v-for="(instruccion, index) in instrucciones" :key="index">
                            {{ instruccion }}
                        </li>
                    </ol>
                </div>

                <!-- TABLERO EXPLICADO -->
                <div class="seccion">
                    <p class="seccion-titulo">¿Qué significan los iconos del tablero?</p>
                    <div class="elementos-lista">
                        <div class="elemento" v-for="(el, index) in elementos" :key="index">
                            <span class="elemento-icono">{{ el.icono }}</span>
                            <div class="elemento-texto">
                                <span class="elemento-nombre">{{ el.nombre }}</span>
                                <span class="elemento-descripcion">{{ el.descripcion }}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <button class="btn-principal" @click="$emit('cerrar')">
                ¡Entendido, a jugar! 🎮
            </button>

        </div>
    </div>
</template>

<style scoped>

.modal-content--ancho {
  max-width: 1000px;
}

.secciones-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.seccion {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seccion-titulo {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-principal);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.instrucciones-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 20px;
}

.instrucciones-lista li {
  font-size: 1.1rem;
  color: var(--color-texto);
  line-height: 1.5;
}

.elementos-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.elemento {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-fondo);
  border-radius: 12px;
  padding: 10px 14px;
}

.elemento-icono {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.elemento-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.elemento-nombre {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-texto);
}

.elemento-descripcion {
  font-size: 0.85rem;
  color: var(--color-texto-suave);
}

@media (max-width: 768px) {
  .secciones-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .instrucciones-lista li {
    font-size: 1rem;
  }

  .modal-content--ancho {
    width: 96%;
    padding: 1.5rem 1rem;
  }
}
</style>
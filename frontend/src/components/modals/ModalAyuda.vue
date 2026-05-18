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

            <div class="modal-cuerpo">
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
            </div>

            <button class="btn-principal" @click="$emit('cerrar')">
                ¡Entendido, a jugar! 🎮
            </button>

        </div>
    </div>
</template>

<style scoped>

.modal-content--ancho {
  max-width: 860px;
  gap: 0.5rem;
  overflow: hidden;
  padding: 1rem 1.5rem;
}

/* Header horizontal compacto */
.modal-header {
  flex-direction: row;
  justify-content: flex-start;
  gap: 8px;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-borde, #eee);
}

.modal-header h2 {
  font-size: 1rem;
}

.icono-principal {
  font-size: 1.3rem;
}

/* Zona scrollable solo si el contenido no cabe */
.modal-cuerpo {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.secciones-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.seccion {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.seccion-titulo {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-principal);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.instrucciones-lista {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 16px;
}

.instrucciones-lista li {
  font-size: 0.88rem;
  color: var(--color-texto);
  line-height: 1.35;
}

.elementos-lista {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.elemento {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-fondo);
  border-radius: 8px;
  padding: 5px 10px;
}

.elemento-icono {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.elemento-texto {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.elemento-nombre {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-texto);
}

.elemento-descripcion {
  font-size: 0.75rem;
  color: var(--color-texto-suave);
}

@media (max-width: 768px) {
  .secciones-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .instrucciones-lista li {
    font-size: 0.95rem;
  }

  .modal-content--ancho {
    width: 96%;
    padding: 1.25rem 1rem;
  }
}
</style>
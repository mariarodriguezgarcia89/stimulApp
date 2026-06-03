<script setup>
// Modal de selección de dificultad: Normal o Avanzado, con descripción de cada modo
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
                <button class="btn-dificultad btn-normal" @click="$emit('seleccionar', 'facil')">
                    <span class="btn-icono">🌟</span>
                    <div class="btn-texto">
                        <span class="btn-titulo">Normal</span>
                        <span class="btn-descripcion">{{ descripcionFacil }}</span>
                    </div>
                    <span class="btn-flecha">›</span>
                </button>

                <button class="btn-dificultad btn-avanzado" @click="$emit('seleccionar', 'dificil')">
                    <span class="btn-icono">🏆</span>
                    <div class="btn-texto">
                        <span class="btn-titulo">Avanzado</span>
                        <span class="btn-descripcion">{{ descripcionDificil }}</span>
                    </div>
                    <span class="btn-flecha">›</span>
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
    gap: 0.85rem;
}

.btn-dificultad {
    border-radius: 16px;
    padding: 1.1rem 1.25rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.18s ease;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-align: left;
    font-family: inherit;
    border: 2px solid transparent;
}

.btn-dificultad:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

/* Normal: fondo suave con borde verde */
.btn-normal {
    background: #f1f8f2;
    color: #1b5e20;
    border-color: #a5d6a7;
}

.btn-normal:hover {
    background: #e8f5e9;
    border-color: #43a047;
}

/* Avanzado: color principal de la app */
.btn-avanzado {
    background: var(--color-principal);
    color: white;
    border-color: var(--color-principal);
}

.btn-avanzado:hover {
    background: var(--color-principal-hover);
    border-color: var(--color-principal-hover);
}

.btn-icono {
    font-size: 1.8rem;
    flex-shrink: 0;
    line-height: 1;
}

.btn-texto {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.btn-titulo {
    font-size: 1.15rem;
    font-weight: 800;
}

.btn-descripcion {
    font-size: 0.9rem;
    opacity: 0.82;
    line-height: 1.35;
}

.btn-flecha {
    font-size: 1.6rem;
    font-weight: 300;
    opacity: 0.6;
    flex-shrink: 0;
}

.btn-cerrar {
    background: transparent;
    color: var(--color-texto-suave);
    border: 1.5px solid var(--color-borde);
    border-radius: 12px;
    padding: 0.75rem;
    font-size: 1rem;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
}

.btn-cerrar:hover {
    background: var(--color-fondo);
    color: var(--color-texto);
}

@media (max-width: 768px) {
    .btn-dificultad { padding: 1rem 1rem; }
    .btn-icono { font-size: 1.5rem; }
    .btn-titulo { font-size: 1rem; }
    .btn-descripcion { font-size: 0.85rem; }
}
</style>

<script setup>
    const emit = defineEmits(['seleccionar', 'cerrar'])
</script>

<template>
    <div class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="icono-principal">🧩</span>
                <h2>¿Cómo quieres jugar?</h2>
            </div>

            <div class="dificultades">
                <button class="btn-dificultad" @click="$emit('seleccionar', 'facil')">
                    <span class="btn-icono">🌟</span>
                    <div class="btn-texto">
                        <span class="btn-titulo">Normal</span>
                        <span class="btn-descripcion">Elige la respuesta correcta entre tres opciones</span>
                    </div>
                </button>

                <button class="btn-dificultad" @click="$emit('seleccionar', 'dificil')">
                    <span class="btn-icono">🏆</span>
                    <div class="btn-texto">
                        <span class="btn-titulo">Avanzado</span>
                        <span class="btn-descripcion">Escribe tú mismo cómo termina el refrán</span>
                    </div>
                </button>
            </div>

            <button class="btn-cerrar" @click="$emit('cerrar')">Cerrar</button>
        </div>
    </div>
</template>

<style scoped>
.modal {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background-color: var(--color-fondo);
    border-radius: 20px;
    padding: 2.5rem;
    width: 90%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.icono-principal {
    font-size: 3rem;
}

h2 {
    color: var(--color-principal);
    font-size: 1.5rem;
    text-align: center;
    margin: 0;
}

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
    font-size: 0.9rem;
    opacity: 0.85;
}

.btn-cerrar {
    background-color: transparent;
    color: var(--color-texto-suave);
    border: 1px solid var(--color-borde);
    border-radius: 12px;
    padding: 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-cerrar:hover {
    background-color: var(--color-borde);
}
</style>
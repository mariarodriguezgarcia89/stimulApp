<script setup>

const emit = defineEmits(['confirmar', 'cancelar'])

</script>

<template>
    <div class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="icono-principal">⚠️</span>
                <h2>¿Estás seguro de que quieres salir?</h2>
            </div>

            <p>Si sales ahora, perderás tu progreso actual.</p>

            <div class="acciones">
                <button class="btn-confirmar" @click="$emit('confirmar')">Sí, salir</button>
                <button class="btn-cancelar" @click="$emit('cancelar')">No, continuar jugando</button>
            </div>
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
    background-color: var(--color-caja);
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

.acciones {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.btn-confirmar {
    background-color: var(--color-principal);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}

.btn-cancelar {
    background-color: transparent;
    color: var(--color-texto-suave);
    border: 1px solid var(--color-borde);
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}

.btn-confirmar:hover {
    background-color: var(--color-principal-hover);
}

.btn-cancelar:hover {
    background-color: var(--color-borde);
}

p {
    font-size: 20px;
    color: var(--color-texto-suave);
    text-align: center;
    margin: 0;
}

</style>
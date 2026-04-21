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
        <div class="modal-content">
            <div class="modal-header">
                <span class="icono-principal">🎉</span>
                <h2>¡Partida terminada!</h2>
            </div>
            <p>Has conseguido {{ puntos }} puntos, acertando {{ acertados }} de {{ total }} {{ labelAcertados }}.</p>
            <p v-if="saltados !== null">Has saltado {{ saltados }} {{ labelAcertados }}.</p>
            <p>Tu puntuación histórica es de {{ puntuacionHistorica }} puntos.</p>
            <button class="btn-cerrar" @click="$emit('cerrar')">Volver al menú</button>
            <button class="btn-jugar" @click="$emit('jugarOtraVez')">Jugar otra vez</button>
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

.btn-cerrar {
    background-color: var(--color-principal);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}

.btn-cerrar:hover {
    background-color: var(--color-principal-hover);
}

.btn-jugar {
    background-color: transparent;
    color: var(--color-principal);
    border: 2px solid var(--color-principal);
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}

.btn-jugar:hover {
    background-color: var(--color-principal);
    color: white;
}



</style>
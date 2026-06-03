<script setup>
// Modal de confirmación para abandonar la partida en curso
const emit = defineEmits(['confirmar', 'cancelar'])
</script>

<template>
    <div class="modal">
        <div class="modal-content modal-salir">

            <div class="salir-header">
                <div class="icono-aviso">⚠️</div>
                <h2>¿Salir de la partida?</h2>
                <p class="aviso-texto">Si sales ahora, perderás el progreso de esta partida.</p>
            </div>

            <div class="acciones">
                <button class="btn-continuar" @click="$emit('cancelar')">Seguir jugando</button>
                <button class="btn-salir" @click="$emit('confirmar')">Sí, salir</button>
            </div>

        </div>
    </div>
</template>

<style scoped>
.modal-salir {
    max-width: 420px;
    text-align: center;
}

.salir-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.icono-aviso {
    width: 64px;
    height: 64px;
    background: #fff8e1;
    border: 2px solid #ffe082;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.9rem;
}

.aviso-texto {
    font-size: 1rem;
    color: var(--color-texto-suave);
    margin: 0;
    line-height: 1.5;
}

.acciones {
    display: flex;
    gap: 0.75rem;
}

.btn-continuar {
    flex: 1;
    background: var(--color-principal);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 1rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-continuar:hover {
    background: var(--color-principal-hover);
}

.btn-salir {
    flex: 1;
    background: transparent;
    color: #c0392b;
    border: 1.5px solid #e57373;
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 1rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-salir:hover {
    background: #ffebee;
    border-color: #c0392b;
}

@media (max-width: 768px) {
    .acciones {
        flex-direction: column-reverse;
    }
}
</style>

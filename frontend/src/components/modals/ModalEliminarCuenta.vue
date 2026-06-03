<script setup>
// Modal de confirmación para eliminar (desactivar) la cuenta del usuario
const emit = defineEmits(['confirmar', 'cancelar'])
</script>

<template>
    <div class="modal">
        <div class="modal-content modal-peligro">

            <div class="peligro-header">
                <div class="icono-peligro">🗑️</div>
                <h2>Eliminar cuenta</h2>
            </div>

            <div class="aviso-peligro">
                <p>Esta acción <strong>desactivará tu cuenta</strong>. Si quieres recuperarla, tendrás que contactar con tu cuidador.</p>
            </div>

            <div class="acciones">
                <button class="btn-cancelar" @click="$emit('cancelar')">No, volver</button>
                <button class="btn-eliminar" @click="$emit('confirmar')">Sí, eliminar</button>
            </div>

        </div>
    </div>
</template>

<style scoped>
.modal-peligro {
    max-width: 440px;
    text-align: center;
    border-top-color: #c0392b;
}

.peligro-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.icono-peligro {
    width: 64px;
    height: 64px;
    background: #ffebee;
    border: 2px solid #ef9a9a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.9rem;
}

.aviso-peligro {
    background: #fff5f5;
    border: 1.5px solid #ffcdd2;
    border-radius: 12px;
    padding: 1rem 1.25rem;
}

.aviso-peligro p {
    font-size: 1rem;
    color: #7f1d1d;
    margin: 0;
    line-height: 1.6;
}

.aviso-peligro strong {
    color: #c0392b;
}

.acciones {
    display: flex;
    gap: 0.75rem;
}

.btn-cancelar {
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

.btn-cancelar:hover {
    background: var(--color-principal-hover);
}

.btn-eliminar {
    flex: 1;
    background: #c0392b;
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

.btn-eliminar:hover {
    background: #a93226;
}

@media (max-width: 768px) {
    .acciones {
        flex-direction: column-reverse;
    }
}
</style>

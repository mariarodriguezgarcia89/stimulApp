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
.modal-content {
  max-width: 480px;
}

p {
  font-size: 1.15rem;
  color: var(--color-texto-suave);
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
  padding: 12px 22px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
}

.btn-confirmar:hover {
  background-color: var(--color-principal-hover);
}

.btn-cancelar {
  background-color: transparent;
  color: var(--color-texto-suave);
  border: 1px solid var(--color-borde);
  border-radius: 8px;
  padding: 12px 22px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
}

.btn-cancelar:hover {
  background-color: var(--color-borde);
}

@media (max-width: 768px) {
  .acciones {
    flex-direction: column;
  }
}
</style>
<script setup>

const emit = defineEmits(['confirmar', 'cancelar'])

</script>

<template>
    <div class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="icono-principal">⚠️</span>
                <h2>¿Estás seguro de que quieres eliminar tu cuenta?</h2>
            </div>

            <p>Esta acción desactivará tu cuenta. Si quieres recuperarla, contacta con tu cuidador.</p>

            <div class="acciones">
                <button class="btn-confirmar" @click="$emit('confirmar')">Sí, eliminar mi cuenta</button>
                <button class="btn-cancelar" @click="$emit('cancelar')">No, volver</button>
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
  background-color: #c0392b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 22px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
}

.btn-confirmar:hover {
  background-color: #a93226;
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
<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)
const isLarge = ref(false)

function toggleDarkMode() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
}

function toggleFontSize() {
  isLarge.value = !isLarge.value
  const size = isLarge.value ? 'large' : 'normal'
  document.documentElement.setAttribute('data-size', size)
}
</script>

<template>
  <div class="accesibilidad-float">
    <div class="control-group">
      <button @click="toggleDarkMode">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
      <span class="etiqueta">{{ isDark ? 'Ver claro' : 'Ver oscuro' }}</span>
    </div>

    <div class="control-group">
      <button @click="toggleFontSize">Aa</button>
      <span class="etiqueta">{{ isLarge ? 'Letra normal' : 'Letra grande' }}</span>
    </div>
  </div>
  <router-view></router-view>
</template>

<style scoped>
.accesibilidad-float {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 20px;
  z-index: 1000;
}

.control-group button {
  width: 65px !important;  /* Forzamos tamaño fijo */
  height: 65px !important; 
  border-radius: 50%;
  border: 3px solid var(--color-principal);
  background: var(--color-caja);
  font-size: 24px !important; /* El icono no debe crecer */
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  
  /* Centrado perfecto del icono */
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0; 
  padding: 0;
}

.etiqueta {
  font-size: 14px !important; /* La leyenda también fija para que no empuje todo */
  font-weight: bold;
  color: var(--color-texto);
  margin-top: 5px;
}

/* En modo oscuro, la etiqueta debe leerse bien */
[data-theme="dark"] .etiqueta {
  color: white;
  background: #333;
}
</style>
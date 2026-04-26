<script setup>
import { ref } from 'vue'

const isDark = ref(false)
const isLarge = ref(false)

function toggleDarkMode() {
  isDark.value = !isDark.value
  console.log('toggleDarkMode llamado, isDark ahora es:', isDark.value)
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
      <button 
        @click="toggleDarkMode"
        :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        :aria-pressed="isDark"
        :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
      <span class="etiqueta" aria-hidden="true">MODO</span>
    </div>

    <div class="control-group">
      <button 
        @click="toggleFontSize"
        :aria-label="isLarge ? 'Reducir tamaño de letra al normal' : 'Aumentar tamaño de letra'"
        :aria-pressed="isLarge"
        :title="isLarge ? 'Reducir tamaño de letra' : 'Aumentar tamaño de letra'">
        Aa
      </button>
      <span class="etiqueta" aria-hidden="true">ZOOM</span>
    </div>
  </div>
  <router-view></router-view>
</template>

<style scoped>
/* ─── SOLO POSICIONAMIENTO DE LOS BOTONES FLOTANTES ─── */
.accesibilidad-float {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 20px;
  z-index: 1000;
}

/* Usamos class en lugar de selectores puros para aislar este contenedor */
.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.control-group button {
  width: 65px; 
  height: 65px; 
  border-radius: 50%;
  border: 3px solid var(--color-principal);
  background: var(--color-caja); /* Usa la variable global */
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease; /* Transición suave al cambiar de tema */
}

.etiqueta {
  font-size: 14px; 
  font-weight: bold;
  /* El color se lo da el main.css dependiendo del tema */
  text-align: center;
}
</style>
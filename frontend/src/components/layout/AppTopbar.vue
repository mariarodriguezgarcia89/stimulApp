<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import avatarDefault from '@/assets/avatar-default.jpg'

const router = useRouter()
const authStore = useAuthStore()
const menuAbierto = ref(false)

// Accesibilidad
const isDark = ref(document.documentElement.getAttribute('data-theme') === 'dark')
const isLarge = ref(document.documentElement.getAttribute('data-size') === 'large')

function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

function toggleFontSize() {
  isLarge.value = !isLarge.value
  document.documentElement.setAttribute('data-size', isLarge.value ? 'large' : 'normal')
}

// Ocultar botones flotantes de App.vue cuando la topbar está visible
onMounted(() => {
  const float = document.querySelector('.accesibilidad-float')
  if (float) float.style.display = 'none'
})

onUnmounted(() => {
  const float = document.querySelector('.accesibilidad-float')
  if (float) float.style.display = ''
})

function cerrarSesion() {
  authStore.logout()
  router.push('/login')
}

const props = defineProps({
  modoJuego: { type: Boolean, default: false }
})
</script>

<template>
  <header class="navbar-solida" :class="{ 'modo-juego': modoJuego }">
    <div class="nav-col-izquierda">
        <button v-if="!modoJuego" class="btn-sidebar-trigger" @click="menuAbierto = !menuAbierto">
        <span>☰</span> <span class="texto-menu">MENÚ</span>
      </button>
    </div>

    <div class="nav-col-centro">
      <img src="@/assets/logo.png" alt="StimulApp" class="logo logo-nav" />
    </div>

    <div class="nav-col-derecha">
      <div class="accesibilidad-nav">
        <button 
          class="btn-nav-acc" 
          @click="toggleDarkMode"
          :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          :aria-pressed="isDark"
          :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
          <span class="circulo-acc" aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
          <span class="label-acc" aria-hidden="true">Modo</span>
        </button>
        <button 
          class="btn-nav-acc" 
          @click="toggleFontSize"
          :aria-label="isLarge ? 'Reducir tamaño de letra al normal' : 'Aumentar tamaño de letra'"
          :aria-pressed="isLarge"
          :title="isLarge ? 'Reducir tamaño de letra' : 'Aumentar tamaño de letra'">
          <span class="circulo-acc" aria-hidden="true">Aa</span>
          <span class="label-acc" aria-hidden="true">Zoom</span>
        </button>
      </div>
    </div>
  </header>

  <aside  v-if="!modoJuego" class="panel-lateral" :class="{ abierto: menuAbierto }">
    <div class="panel-header-user">
      <img
        :src="authStore.foto_perfil || avatarDefault"
        alt="Foto de perfil"
        class="avatar-circular-menu"
        @error="(e) => e.target.src = avatarDefault"
      />
      <h2 class="usuario-nombre">{{ authStore.nombre }}</h2>
    </div>

   <nav class="panel-navigation">
  <button 
    v-if="$route.name !== 'Menu'"
    class="btn-panel-link" 
    @click="router.push('/menu'); menuAbierto = false"
  >🏠 Menú principal</button>
  <button class="btn-panel-link" @click="router.push('/perfil'); menuAbierto = false">👤 Mi perfil</button>
  <button class="btn-panel-link" @click="router.push('/estadisticas'); menuAbierto = false">📊 Mis estadísticas</button>
  <button class="btn-panel-link cerrar-rojo" @click="cerrarSesion">🚪 Cerrar sesión</button>
</nav>

    <button class="btn-principal secundario-btn" @click="menuAbierto = false">✕ Cerrar</button>
  </aside>

  <div v-if="!modoJuego && menuAbierto" class="overlay-fixed" @click="menuAbierto = false"></div>
</template>

<style scoped>
/* =========================================
   1. ESCRITORIO: CÓDIGO ORIGINAL FUNCIONAL
   ========================================= */
.navbar-solida {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: var(--color-principal);
  width: 100%;
  height: 170px;
  position: sticky; /* <- ESTO ES CLAVE PARA QUE NO SE ROMPA EL ESCRITORIO */
  top: 0;
  z-index: 50;
  padding: 0;
  border: none;
  overflow: hidden;
}

.nav-col-izquierda { display: flex; }

.btn-sidebar-trigger {
  background: transparent;
  border: none;
  color: white;
  padding: 0 40px;
  font-weight: 900;
  font-size: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  box-shadow: none !important;
  outline: none;
  transition: background 0.3s;
  font-family: inherit;
}

.logo-nav {
  height: 200px;
  width: auto;
  display: block;
  filter: brightness(0) invert(1) !important;
}

.nav-col-centro {
  display: flex;
  justify-content: center;
}

.nav-col-derecha {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
}

.accesibilidad-nav {
  display: flex;
  gap: 15px;
}

.btn-nav-acc {
  background: none;
  border: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.circulo-acc {
  background: white;
  color: var(--color-principal);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
}

.label-acc {
  font-size: 20px;
  font-weight: 800;
  text-transform: uppercase;
  margin-top: 2px;
  color: white;
}

/* Panel lateral */
.panel-lateral {
  position: fixed;
  top: 0;
  left: -320px;
  width: 300px;
  height: 100%;
  background-color: var(--color-caja);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 50px 25px;
  transition: left 0.4s ease;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.1);
}

.panel-lateral.abierto { left: 0; }

.panel-header-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-circular-menu {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 4px solid var(--color-principal);
  object-fit: cover;
  display: block;
  margin-bottom: 15px;
}

.usuario-nombre {
  color: var(--color-texto);
  font-size: 22px;
  font-weight: 800;
}

.btn-panel-link {
  width: 100%;
  padding: 16px;
  margin-bottom: 10px;
  background: var(--color-fondo);
  border: 1px solid var(--color-borde);
  border-radius: 12px;
  color: var(--color-texto);
  font-weight: bold;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-panel-link:hover:not(.deshabilitado) {
  background-color: var(--color-principal);
  color: white;
  border-color: var(--color-principal-hover);
  transform: translateX(5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.deshabilitado {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

.cerrar-rojo { color: #d32f2f; border-color: #f5c6cb; }

.cerrar-rojo:hover {
  background-color: #c0392b !important;
  color: white !important;
  transform: translateX(5px);
}

.secundario-btn {
  background-color: var(--color-borde);
  color: var(--color-texto);
  margin-top: auto;
  text-align: center;
  justify-content: center;
}

.overlay-fixed {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 90;
}

.modo-juego {
  grid-template-columns: auto 1fr auto;
}

.modo-juego .nav-col-centro {
  justify-content: flex-start;
  padding-left: 20px;
}
@media (max-width: 768px) {
  /* 1. Quitamos el recorte limpiamente */
  .navbar-solida {
    height: auto;
    min-height: auto;
    padding: 15px 20px;
    overflow: visible; /* Permite que el logo sobresalga si es muy grande */
    
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      "acc  acc"
      "menu logo";
    row-gap: 15px;
    align-items: center;
  }

  /* 2. El contenedor del logo es el ancla (relative) */
  .navbar-solida .nav-col-centro {
    grid-area: logo;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  /* 3. Aumentamos la jerarquía (.padre .hijo) para ganar limpiamente al escritorio */
  .navbar-solida .logo-nav {
    position: absolute;
    height: 150px; /* Aquí controlas el tamaño libremente */
    width: auto;
    
    /* Controles exactos de posición */
    right: -10px; /* Modifica esto para moverlo en el eje X */
    top: 0%; 
    
    z-index: 10;
  }

  /* El resto de elementos de móvil se mantienen normales */
  .nav-col-derecha {
    grid-area: acc;
    justify-content: flex-start;
    padding-right: 0;
  }

  .nav-col-izquierda {
    grid-area: menu;
    justify-content: flex-start;
  }

  .btn-sidebar-trigger {
    padding: 0;
    font-size: 22px;
  }

  .accesibilidad-nav { gap: 15px; }
  .circulo-acc { width: 45px; height: 45px; font-size: 20px; }
  .label-acc { font-size: 11px; }
}

</style>
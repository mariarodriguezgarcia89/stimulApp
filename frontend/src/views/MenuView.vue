<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import avatarDefault from '@/assets/avatar-default.jpg'
import ModalDificultad from '@/components/refran/ModalDificultad.vue'
const menuAbierto = ref(false)
const mostrarModalDificultad = ref(false)

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.token) {
    router.push('/login')
  }
})

function cerrarSesion() {
  authStore.logout()
  router.push('/login')
}

function seleccionarDificultad(nivel) {
  mostrarModalDificultad.value = false
  router.push(`/juego/refran?dificultad=${nivel}`)
}
</script>

<template>
  <div class="menu-container">

    <!-- Barra superior -->
    <div class="topbar">
      <img src="@/assets/logo.png" alt="Logo StimulApp" class="logo" />
      <button class="btn-menu" @click="menuAbierto = !menuAbierto">Menú ▼</button>
    </div>

    <!-- Panel lateral desplegable -->
    <div class="panel-lateral" :class="{ abierto: menuAbierto }">
      <div class="panel-header">
        <img :src="authStore.foto_perfil || avatarDefault" alt="Foto de perfil" class="avatar" />
        <p class="panel-nombre">{{ authStore.nombre }}</p>
      </div>
      <button class="btn-panel" @click="router.push('/perfil'); menuAbierto = false">👤 Mi perfil</button>
      <button class="btn-panel deshabilitado" disabled>📊 Mis estadísticas</button>
      <button class="btn-panel cerrar" @click="cerrarSesion">Cerrar sesión</button>
      <button class="btn-panel" @click="menuAbierto = false">✕ Cerrar menú</button>
    </div>

    <!-- Overlay oscuro al abrir el menú -->
    <div class="overlay" v-if="menuAbierto" @click="menuAbierto = false"></div>

    <!-- Saludo -->
    <div class="saludo">
      <h1>¡Hola, {{ authStore.nombre }}! 👋</h1>
      <p>¿Qué quieres hacer hoy?</p>
    </div>

    <!-- Tarjetas de juegos -->
    <div class="juegos">
      <div class="juego-card" @click="mostrarModalDificultad = true">
        <img src="@/assets/icono-refran.png" alt="Acaba el refrán" class="juego-icono" />
        <div class="juego-info">
          <h2>Acaba el refrán</h2>
          <p>Completa el refrán popular. Ejercita tu memoria y tu lenguaje.</p>
          <button class="btn-juego">¡Jugar!</button>
        </div>
      </div>

      <div class="juego-card" @click="router.push('/juego/memory')">
        <img src="@/assets/icono-memory.png" alt="Memory" class="juego-icono" />
        <div class="juego-info">
          <h2>Memory</h2>
          <p>Encuentra las parejas de tarjetas. Ejercita tu memoria visual.</p>
          <button class="btn-juego">¡Jugar!</button>
        </div>
      </div>

      <div class="juego-card" @click="router.push('/juego/intruso')">
        <img src="@/assets/icono-intruso.png" alt="Encuentra el intruso" class="juego-icono" />
        <div class="juego-info">
          <h2>Encuentra el intruso</h2>
          <p>¿Cuál no encaja? Ejercita tu atención y concentración.</p>
          <button class="btn-juego">¡Jugar!</button>
        </div>
      </div>
    </div>
    <ModalDificultad 
    v-if="mostrarModalDificultad" 
    @seleccionar="seleccionarDificultad" 
    @cerrar="mostrarModalDificultad = false" 
/>
  </div>
</template>

<style scoped>
.menu-container {
  max-width: 520px;
  margin: 0 auto;
  padding: 0 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  position: sticky;
  top: 0;
  background-color: var(--color-fondo);
  z-index: 10;
}

.logo {
  width: 160px;
}

.btn-menu {
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.panel-lateral {
  position: fixed;
  top: 0;
  right: -300px;
  width: 280px;
  height: 100%;
  background-color: white;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  gap: 16px;
  transition: right 0.3s ease;
}

.panel-lateral.abierto {
  right: 0;
}

.panel-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-borde);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-principal);
}

.panel-nombre {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-principal);
  text-align: center;
}

.btn-panel {
  width: 100%;
  padding: 14px;
  font-size: 17px;
  font-weight: bold;
  background-color: white;
  color: var(--color-principal);
  border: 2px solid var(--color-principal);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}

.btn-panel:hover {
  background-color: #fdecea;
}

.btn-panel.cerrar {
  color: #c0392b;
  border-color: #c0392b;
}

.deshabilitado {
  opacity: 0.5;
  cursor: not-allowed;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  z-index: 50;
}

.saludo {
  text-align: center;
}

.saludo h1 {
  font-size: 26px;
  color: var(--color-principal);
}

.saludo p {
  font-size: 18px;
  color: var(--color-texto-suave);
}

.juegos {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.juego-card {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 6px solid var(--color-principal);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.juego-card:hover {
  transform: scale(1.02);
}

.juego-icono {
  width: 80px;
  height: 80px;
  object-fit: contain;
  flex-shrink: 0;
}

.juego-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.juego-card h2 {
  font-size: 20px;
  color: var(--color-principal);
}

.juego-card p {
  font-size: 15px;
  color: var(--color-texto-suave);
}

.btn-juego {
  padding: 10px 20px;
  font-size: 16px;
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  align-self: flex-start;
}

.btn-juego:hover {
  background-color: var(--color-principal-hover);
}
</style>
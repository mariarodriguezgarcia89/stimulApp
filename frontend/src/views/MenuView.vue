<script setup>
import { ref, onMounted, onUnmounted }from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import avatarDefault from '@/assets/avatar-default.jpg'
import ModalDificultad from '@/components/shared/ModalDificultad.vue'

const menuAbierto = ref(false)
const juegoSeleccionado = ref(null)

const JUEGOS = {
    refran: {
        icono: '🧩',
        titulo: '¿Cómo quieres jugar?',
        descripcionFacil: 'Elige la continuación correcta del refrán entre tres opciones. ¡Tómate tu tiempo!',
        descripcionDificil: 'Escribe tú mismo cómo termina el refrán. Tienes 30 segundos por pregunta.'
    },
    memory: {
        icono: '🃏',
        titulo: '¿Cómo quieres jugar?',
        descripcionFacil: 'Encuentra las 4 parejas de tarjetas. Las tarjetas se mostrarán unos segundos al inicio.',
        descripcionDificil: 'Encuentra las 8 parejas antes de que se acabe el tiempo. ¡Concentración!'
    },
    intruso: {
        icono: '🔍',
        titulo: '¿Cómo quieres jugar?',
        descripcionFacil: 'Encuentra cuál de las imágenes no pertenece al grupo.',
        descripcionDificil: 'Las categorías son más parecidas entre sí. ¡Necesitarás pensar bien!'
    }
}

const router = useRouter()
const authStore = useAuthStore()

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

function seleccionarDificultad(nivel) {
    const juego = juegoSeleccionado.value
    juegoSeleccionado.value = null
    router.push(`/juego/${juego}?dificultad=${nivel}`)
}
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

</script>


<template>
  <div class="menu-container">
    <header class="navbar-solida">
      <div class="nav-col-izquierda">
        <button class="btn-sidebar-trigger" @click="menuAbierto = !menuAbierto">
          <span class="icono">☰</span> <span class="texto-menu">MENÚ</span>
        </button>
      </div>
     
      <div class="nav-col-centro">
        <img src="@/assets/logo.png" alt="Logo StimulApp" class="logo logo-nav" />
      </div>


      <div class="nav-col-derecha">
        <div class="accesibilidad-nav">
          <button class="btn-nav-acc" @click="toggleDarkMode">
            <span class="circulo-acc">{{ isDark ? '☀️' : '🌙' }}</span>
            <span class="label-acc">Modo</span>
          </button>
          <button class="btn-nav-acc" @click="toggleFontSize">
            <span class="circulo-acc">Aa</span>
            <span class="label-acc">Zoom</span>
          </button>
        </div>
      </div>
    </header>


    <aside class="panel-lateral" :class="{ abierto: menuAbierto }">
      <div class="panel-header-user">
        <img 
        :src="authStore.foto_perfil || avatarDefault" 
        alt="Foto de perfil" 
        class="avatar-circular-menu"
        @error="(e) => e.target.src = avatarDefault" />

        <h2 class="usuario-nombre">{{ authStore.nombre }}</h2>
      </div>
     
      <nav class="panel-navigation">
        <button class="btn-panel-link" @click="router.push('/perfil'); menuAbierto = false">👤 Mi perfil</button>
        <button class="btn-panel-link deshabilitado" disabled>📊 Mis estadísticas</button>
        <hr class="divisor-panel" />
        <button class="btn-panel-link cerrar-rojo" @click="cerrarSesion">🚪 Cerrar sesión</button>
      </nav>


      <button class="btn-principal secundario-btn" @click="menuAbierto = false">✕ Volver</button>
    </aside>


    <div class="overlay-fixed" v-if="menuAbierto" @click="menuAbierto = false"></div>


    <main class="main-content-menu">
      <div class="saludo-box">
        <h1>¡Hola, {{ authStore.nombre }}! 👋</h1>
        <p>¿Qué quieres hacer hoy?</p>
      </div>


      <div class="grid-juegos-principal">
        <div class="tarjeta-juego caja" @click="juegoSeleccionado = 'refran'">
          <img src="@/assets/icono-refran.png" alt="Refranes" class="logo-juego icono-oscuro" />
          <div class="juego-detalle">
            <h2>Acaba el refrán</h2>
            <p>Completa el refrán popular. Ejercita tu memoria y tu lenguaje.</p>
            <button class="btn-principal">¡Jugar!</button>
          </div>
        </div>


        <div class="tarjeta-juego caja" @click="juegoSeleccionado = 'memory'">
          <img src="@/assets/icono-memory.png" alt="Memory" class="logo-juego"  />
          <div class="juego-detalle">
            <h2>Memory</h2>
            <p>Encuentra las parejas de tarjetas. Ejercita tu memoria visual.</p>
            <button class="btn-principal">¡Jugar!</button>
          </div>
        </div>


        <div class="tarjeta-juego caja" @click="juegoSeleccionado = 'intruso'">
          <img src="@/assets/icono-intruso.png" alt="Intruso" class="logo-juego icono-oscuro"/>
          <div class="juego-detalle">
            <h2>Encuentra el intruso</h2>
            <p>¿Cuál no encaja? Ejercita tu atención y concentración.</p>
            <button class="btn-principal">¡Jugar!</button>
          </div>
        </div>
      </div>
    </main>


    <ModalDificultad
      v-if="juegoSeleccionado"
      :icono="JUEGOS[juegoSeleccionado].icono"
      :titulo="JUEGOS[juegoSeleccionado].titulo"
      :descripcionFacil="JUEGOS[juegoSeleccionado].descripcionFacil"
      :descripcionDificil="JUEGOS[juegoSeleccionado].descripcionDificil"
      @seleccionar="seleccionarDificultad"
      @cerrar="juegoSeleccionado = null"
    />
  </div>
</template>


<style scoped>
/* 1. NAVBAR SÓLIDA (Aprovechando var de main.css) */
.navbar-solida {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: var(--color-principal); 
  width: 100%;
  height: 170px;
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 0; /* ¡Crucial! Sin padding no hay huecos */
  border: none; /* Eliminamos cualquier borde que pueda parecer una sombra */
  overflow: hidden; /* Corta cualquier cosa que sobresalga */
}

.nav-col-izquierda { display: flex; }

.btn-sidebar-trigger {
  /* Eliminamos el fondo oscuro y lo ponemos transparente */
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
  margin: 0;
  
  /* Limpieza total de efectos */
  box-shadow: none !important;
  outline: none;
  transition: background 0.3s;
}

.logo-nav {
  height: 200px;
  width: auto;
  display: block;
  filter: brightness(0) invert(1) !important;
  image-rendering: -webkit-optimize-contrast;
  transition: transform 0.3s ease;
}

/* 2. ACCESIBILIDAD INTEGRADA EN NAVBAR */
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
  font-size: 20px; font-weight: 800; text-transform: uppercase; margin-top: 2px; }


/* 3. PANEL LATERAL */
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
  box-shadow: 10px 0 30px rgba(0,0,0,0.1);
}


.panel-lateral.abierto { left: 0; }
.panel-header-user { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
.avatar-circular-menu { 
  width: 110px; 
  height: 110px; 
  border-radius: 50%; 
  border: 4px solid var(--color-principal); 
  object-fit: cover; 
  display: block;
  margin-bottom: 15px; 
}

.usuario-nombre { color: var(--color-texto); font-size: 22px; font-weight: 800; }

.btn-panel-link {
  width: 100%;
  padding: 16px;
  margin-bottom: 10px;
  background: var(--color-fondo);
  border: 1px solid var(--color-borde);
  border-radius: 12px;
  color: var(--color-texto);
  font-weight: bold;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease; /* Animación suave para color y movimiento */
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-panel-link:hover:not(.deshabilitado) {
  background-color: var(--color-principal); /* Se vuelve granate */
  color: white; /* El texto pasa a blanco para contrastar */
  border-color: var(--color-principal-hover);
  transform: translateX(5px); /* Pequeño desplazamiento a la derecha para feedback visual */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Estado deshabilitado (Mis estadísticas) */
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


/* 4. CONTENIDO JUEGOS */
.main-content-menu { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.saludo-box { text-align: center; margin-bottom: 40px; }
.saludo-box h1 { color: var(--color-principal); font-size: 32px; }


:global([data-theme="dark"]) .saludo-box h1,
:global([data-theme="dark"]) .juego-detalle h2 {
  color: var(--color-texto) !important;
}


.grid-juegos-principal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}


.tarjeta-juego { padding: 30px; display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer; transition: transform 0.2s; }
.tarjeta-juego:hover { transform: translateY(-5px); }


.logo-juego { width: 130px; margin-bottom: 20px; }
.juego-detalle h2 { color: var(--color-principal); margin-bottom: 12px; font-size: 24px;}
.juego-detalle p { margin-bottom: 25px; min-height: 50px; font-size: 17px; }


.overlay-fixed { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 90; }

</style>


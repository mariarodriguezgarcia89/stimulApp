<script setup>
// Vista principal con los tres juegos disponibles y selector de dificultad
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ModalDificultad from '@/components/modals/ModalDificultad.vue'
import fondoMenu from '@/assets/fondo-menu.png' 

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
  if (!authStore.token) router.push('/login')
})

function seleccionarDificultad(nivel) {
  const juego = juegoSeleccionado.value
  juegoSeleccionado.value = null
  router.push(`/juego/${juego}?dificultad=${nivel}`)
}
</script>

<template>
  <div class="menu-container">

    <AppTopbar />

    <main class="main-content-menu">
      <div class="saludo-box">
        <h1>¡Hola, {{ authStore.nombre }}! 👋</h1>
        <p>¿Qué quieres hacer hoy?</p>
      </div>

      <div class="ilustracion-wrapper">
        <img 
          :src="fondoMenu" 
          alt="" 
          aria-hidden="true"
          class="ilustracion" />
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
          <img src="@/assets/icono-memory.png" alt="Memory" class="logo-juego" />
          <div class="juego-detalle">
            <h2>Memory</h2>
            <p>Encuentra las parejas de tarjetas. Ejercita tu memoria visual.</p>
            <button class="btn-principal">¡Jugar!</button>
          </div>
        </div>

        <div class="tarjeta-juego caja" @click="juegoSeleccionado = 'intruso'">
          <img src="@/assets/icono-intruso.png" alt="Intruso" class="logo-juego icono-oscuro" />
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
.menu-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.main-content-menu {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px;
}

.saludo-box {
  text-align: center;
  margin-bottom: 24px;
}

.saludo-box h1 {
  color: var(--color-principal);
  font-size: 28px;
}

.grid-juegos-principal {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 260px));
  justify-content: center;
  gap: 20px;
}

.tarjeta-juego {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.tarjeta-juego:hover { transform: translateY(-5px); }

.logo-juego { width: 90px; margin-bottom: 12px; }
.juego-detalle h2 { color: var(--color-principal); margin-bottom: 8px; font-size: 20px; }
.juego-detalle p { margin-bottom: 16px; min-height: 44px; font-size: 15px; }

.ilustracion-wrapper {
  position: absolute;
  bottom: 0;
  right: -60px;
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 350px;
  height: auto;
  display: block;
}

@media (max-width: 768px) {
  .menu-container {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .main-content-menu {
    padding: 16px 10px 32px;
  }

  .grid-juegos-principal {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .tarjeta-juego {
    padding: 10px;
  }

  .logo-juego {
    width: 80px;
    margin-bottom: 0;
  }

  .juego-detalle h2 {
    font-size: 18px;
    margin-bottom: 4px;
    min-height: 2.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .juego-detalle p {
    font-size: 14px;
    margin-bottom: 10px;
    min-height: 44px;
  }

  .ilustracion-wrapper {
    display: none;
  }
}

</style>
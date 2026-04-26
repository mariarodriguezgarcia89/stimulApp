<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ModalDificultad from '@/components/modals/ModalDificultad.vue'

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
.main-content-menu {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.saludo-box {
  text-align: center;
  margin-bottom: 40px;
}

.saludo-box h1 {
  color: var(--color-principal);
  font-size: 32px;
}

.grid-juegos-principal {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
}

.tarjeta-juego {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.tarjeta-juego:hover { transform: translateY(-5px); }

.logo-juego { width: 130px; margin-bottom: 20px; }
.juego-detalle h2 { color: var(--color-principal); margin-bottom: 12px; font-size: 24px; }
.juego-detalle p { margin-bottom: 25px; min-height: 50px; font-size: 17px; }
</style>
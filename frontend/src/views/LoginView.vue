<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import fondoLogin from '@/assets/fondo-login.png'

const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const error = ref('')

const route = useRoute()
const exito = ref(route.query.registro === 'exitoso' ?
  '✅ ¡Cuenta creada correctamente! Ya puede iniciar sesión con su correo y contraseña.' : '')

const authStore = useAuthStore()
const router = useRouter()

function handleLogin() {
  error.value = ''
  authService.login(email.value, password.value)
    .then(datos => {
      authStore.login(datos.token, datos.nombre, datos.foto_perfil)
      router.push('/menu')
    })
    .catch(err => {
      const status = err.response?.status
      if (status === 403) {
        error.value = 'Esta cuenta ha sido desactivada. Contacte con su cuidador para recuperarla.'
      } else {
        error.value = 'Correo o contraseña incorrectos. Por favor, inténtelo de nuevo.'
      }
    })
}
</script>

<template>
  <div class="login-page">
    <img src="@/assets/logo.png" alt="Logo StimulApp" class="logo" />

    <div class="ilustracion-wrapper" aria-hidden="true">
      <img :src="fondoLogin" alt="" class="ilustracion" />
    </div>

    <div class="caja">
      <h1>Iniciar sesión</h1>
      <p class="bienvenida">Bienvenido/a a StimulApp 😊</p>

      <p v-if="exito" class="exito">{{ exito }}</p>

      <div class="campo">
        <label for="email">Correo electrónico</label>
        <input
          :class="{ 'input-error': error }"
          id="email"
          v-model="email"
          type="email"
          autocomplete="username"
          inputmode="email"
          placeholder="ejemplo@correo.com" />
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <div class="password-wrapper">
          <input
            id="password"
            v-model="password"
            :type="mostrarPassword ? 'text' : 'password'"
            autocomplete="current-password"
            @keyup.enter="handleLogin" />
          <button
            type="button"
            class="btn-mostrar"
            @click="mostrarPassword = !mostrarPassword"
            :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="mostrarPassword">
            {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
        <small class="help-text">
          👆 Pulse <strong>{{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}</strong>
          para {{ mostrarPassword ? 'ocultar' : 'ver' }} lo que está escribiendo
        </small>
      </div>

      <div v-if="error" class="error">
        <span>⚠️ {{ error }}</span>
        <button class="error-cerrar" @click="error = ''" aria-label="Cerrar mensaje de error">✕</button>
      </div>

      <button class="btn-principal" @click="handleLogin">Iniciar sesión</button>

      <p class="registro-link">
        ¿No tienes cuenta?
        <RouterLink to="/registro">Regístrate aquí</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ─── GRID PRINCIPAL ─── */
.login-page {
  display: grid;
  height: 100vh;
  overflow: hidden;
  grid-template-columns: 1fr minmax(380px, 520px) 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "logo form ."
    "ilustracion form .";
}

/* ─── LOGO (fila 0, columna 0) ─── */
.logo {
  grid-area: logo;
  width: 180px;
  display: block;
  margin: 8px 0 -30px 8px;
}

/* ─── ILUSTRACIÓN (fila 2, columna izquierda) ─── */
.ilustracion-wrapper {
  grid-area: ilustracion;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  margin-right: -60px;
  pointer-events: none;
  padding-bottom: 32px;
}

.ilustracion {
  width: 90%;
  max-width: 400px;
  height: auto;
  display: block;
}

/* ─── FORMULARIO (fila 2, columna central) ─── */
.caja {
  grid-area: form;
  align-self: center;
  margin: 0 0 40px;
}

/* ─── MENSAJES ─── */
.exito {
  color: #27ae60;
  font-size: 16px;
  font-weight: bold;
  background-color: #eafaf1;
  border: 1px solid #27ae60;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  text-align: center;
}

.input-error {
  border-color: #c0392b !important;
}

.error {
  position: relative;
  padding-right: 28px;
}

.error-cerrar {
  position: absolute;
  top: 6px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: inherit;
  padding: 0;
  line-height: 1;
}

/* ─── MÓVIL ─── */
@media (max-width: 768px) {
  .login-page {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
    grid-template-areas:
      "logo"
      "ilustracion"
      "form";
  }

  .logo {
    width: 180px;
    margin: 16px auto 8px;
  }

  .ilustracion-wrapper {
    justify-content: flex-start;
    align-items: flex-end;
    padding: 0 0 0 20px;
    height: 130px;
  }

  .ilustracion {
    width: 150px;
    max-width: none;
  }

  .caja {
    margin: 0 0 24px;
  }

  .registro-link {
    text-align: center;
  }

  .registro-link a {
    display: block;
  }

  html[data-size="large"] .ilustracion {
    width: 170px;
  }
}
</style>

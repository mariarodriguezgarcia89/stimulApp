<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

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
    .catch(() => {
      error.value = 'Correo o contraseña incorrectos. Por favor, inténtelo de nuevo.'
    })
}
</script>

<template>
  <div class="login-container">
    <img src="@/assets/logo.png" alt="Logo StimulApp" class="logo" />
    
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
            placeholder="ejemplo@correo.com" />
        </div>

        <div class="campo">
          <label for="password">Contraseña</label>
          <div class="password-wrapper">
              <input 
                id="password" 
                v-model="password" 
                :type="mostrarPassword ? 'text' : 'password'"
                @keyup.enter="handleLogin"
               />
              <button type="button" @click="mostrarPassword = !mostrarPassword">
                {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
          </div>
          <small class="help-text">
            👆 Pulse <strong>{{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}</strong> 
            para {{ mostrarPassword ? 'ocultar' : 'ver' }} lo que está escribiendo
          </small>
        </div>

        <ul v-if="error" class="error">
          <li>⚠️ {{ error }}</li>
        </ul>

        <button class="btn-principal" @click="handleLogin">Iniciar sesión</button>

        <p class="registro-link">
          ¿No tienes cuenta?
          <RouterLink to="/registro">Regístrate aquí</RouterLink>
        </p>
    </div>
  </div>
</template>

<style scoped>
/* ─── SOLO POSICIONAMIENTO Y ESTILOS ÚNICOS DE ESTA VISTA ─── */
.login-container {
  max-width: 650px;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 350px;
  display: block;
  margin: 0 auto -40px auto;
}

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

/* Exito en modo oscuro (usamos :global para que funcione bien en el componente) */
:global([data-theme="dark"]) .exito {
  background-color: #1e3a29;
  color: #4ade80;
  border-color: #27ae60;
}

/* La clase dinámica de error para el input */
.input-error {
  border-color: #c0392b !important;
}
</style>
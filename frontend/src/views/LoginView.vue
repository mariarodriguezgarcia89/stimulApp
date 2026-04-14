<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const error = ref('')
const errorEmail = ref('')
const errorPassword = ref('')

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
    <div class="login-box">
        <h1>Iniciar sesión</h1>
        <p class="bienvenida">Bienvenido/a a StimulApp 😊</p>
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
            Pulse <strong>{{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}</strong> 
            para {{ mostrarPassword ? 'ocultar' : 'ver' }} lo que está escribiendo
        </small>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <button class="btn-principal" @click="handleLogin">Iniciar sesión</button>

    <p class="registro-link">
      ¿No tienes cuenta?
      <RouterLink to="/registro">Regístrate aquí</RouterLink>
    </p>
  </div>
  </div>
</template>

<style scoped>

.bienvenida {
  text-align: center;
  color: var(--color-texto-suave);
  font-size: 16px;
  margin-top: -8px;
}

.login-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-box {
  background-color: white;
  border-radius: 16px;
  padding: 40px 36px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 6px solid var(--color-principal);
}

.logo {
  width: 350px;
  display: block;
  margin: 0 auto -40px auto;
}

h1 {
  font-size: 28px;
  color: var(--color-principal);
  margin-bottom: 10px;
  text-align: center;
}

.campo {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 18px;
  color: var(--color-texto);
  font-weight: bold;
}

input {
  width: 100%;
  padding: 14px;
  font-size: 18px;
  border: 2px solid var(--color-borde);
  border-radius: 8px;
}

input:focus {
  border-color: var(--color-principal);
  outline: none;
}

.password-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.password-wrapper input {
  flex: 1;
}

.password-wrapper button {
  padding: 8px 12px;
  font-size: 15px;
  font-weight: bold;
  color: var(--color-principal);
  background: none;
  border: 1px solid var(--color-principal);
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  min-width: 90px;
}

.btn-principal {
  width: 100%;
  padding: 16px;
  font-size: 20px;
  background-color: var(--color-principal);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 8px;
}

.btn-principal:hover {
  background-color: var(--color-principal-hover);
}

.error {
  color: #c0392b;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  background-color: #fdecea;
  border: 1px solid #c0392b;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
}

.input-error {
  border-color: #c0392b;
}

.registro-link {
  font-size: 16px;
  color: var(--color-texto-suave);
}

.help-text {
  font-size: 14px;
  color: var(--color-texto-suave);
}
</style>
<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { useRouter } from 'vue-router'
import { mensajes } from '@/utils/mensajes.js'

const router = useRouter()
const nombre = ref('')
const apellidos = ref('')
const email = ref('')
const password = ref('')
const confirmarPassword = ref('')
const fechaNacimiento = ref('')
const nombreCuidador = ref('')
const emailCuidador = ref('')
const mostrarPassword = ref(false)
const mostrarConfirmar = ref(false)
const errores = ref([])

function handleRegistro() {
  errores.value = []

  if (!nombre.value) errores.value.push(mensajes.nombreObligatorio)
  if (!apellidos.value) errores.value.push(mensajes.apellidosObligatorios)
  if (!email.value) errores.value.push(mensajes.emailObligatorio)
  else if (!/\S+@\S+\.\S+/.test(email.value)) errores.value.push(mensajes.emailInvalido)
  if (!password.value) errores.value.push(mensajes.passwordObligatoria)
  if (!fechaNacimiento.value) errores.value.push(mensajes.fechaNacimientoObligatoria)
  if (password.value && confirmarPassword.value && password.value !== confirmarPassword.value)
    errores.value.push(mensajes.passwordsNoCoinciden)

  if (errores.value.length > 0) return

  authService.registro({
    nombre: nombre.value,
    apellidos: apellidos.value,
    email: email.value,
    password: password.value,
    fecha_nacimiento: fechaNacimiento.value,
    nombre_cuidador: nombreCuidador.value,
    email_cuidador: emailCuidador.value
  })

  .then(() => {
    router.push('/login?registro=exitoso')
  })
  .catch((err) => {
    if (err.response?.data?.message) {
      errores.value.push(err.response.data.message)
    } else {
      errores.value.push(mensajes.errorRegistro)
    }
  })
}
</script>

<template>
  <div class="registro-container">
    <img src="@/assets/logo.png" alt="Logo StimulApp" class="logo" />

    <div class="registro-box">
      <h1>Crear cuenta</h1>
      <p class="bienvenida">Rellene el formulario para comenzar 😊</p>

      <div class="campo">
        <label for="nombre">Nombre</label>
        <input id="nombre" v-model="nombre" type="text" placeholder="Su nombre" />
      </div>

      <div class="campo">
        <label for="apellidos">Apellidos</label>
        <input id="apellidos" v-model="apellidos" type="text" placeholder="Sus apellidos" />
      </div>

      <div class="campo">
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="email" type="email" placeholder="ejemplo@correo.com" />
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <div class="password-wrapper">
          <input id="password" v-model="password" :type="mostrarPassword ? 'text' : 'password'" @keyup.enter="handleRegistro" />
          <button type="button" @click="mostrarPassword = !mostrarPassword">
            {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
        <small class="help-text">👆 Pulse <strong>{{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}</strong> para {{ mostrarPassword ? 'ocultar' : 'ver' }} lo que está escribiendo</small>
      </div>

      <div class="campo">
        <label for="confirmarPassword">Confirmar contraseña</label>
        <div class="password-wrapper">
          <input id="confirmarPassword" v-model="confirmarPassword" :type="mostrarConfirmar ? 'text' : 'password'" @keyup.enter="handleRegistro" />
          <button type="button" @click="mostrarConfirmar = !mostrarConfirmar">
            {{ mostrarConfirmar ? 'Ocultar' : 'Mostrar' }}
          </button>
        </div>
        <small class="help-text">👆 Pulse <strong>{{ mostrarConfirmar ? 'Ocultar' : 'Mostrar' }}</strong> para {{ mostrarConfirmar ? 'ocultar' : 'ver' }} lo que está escribiendo</small>
      </div>

      <div class="campo">
        <label for="fechaNacimiento">Fecha de nacimiento</label>
        <input id="fechaNacimiento" v-model="fechaNacimiento" type="date" />
      </div>

      <div class="seccion-cuidador">
        <p class="seccion-titulo">Datos del cuidador <span>(opcional)</span></p>
        <div class="campo">
          <label for="nombreCuidador">Nombre del cuidador</label>
          <input id="nombreCuidador" v-model="nombreCuidador" type="text" placeholder="Nombre de su cuidador o familiar" />
        </div>
        <div class="campo">
          <label for="emailCuidador">Correo del cuidador</label>
          <input id="emailCuidador" v-model="emailCuidador" type="email" placeholder="correo@cuidador.com" />
          <small class="help-text">📧 Su cuidador recibirá informes de su progreso en esta dirección</small>
        </div>
      </div>

      <ul v-if="errores.length > 0" class="error">
        <li v-for="e in errores" :key="e">⚠️ {{ e }}</li>
      </ul>

      <button class="btn-principal" @click="handleRegistro">Crear cuenta</button>

      <p class="login-link">
        ¿Ya tienes cuenta?
        <RouterLink to="/login">Inicia sesión aquí</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.registro-container {
  max-width: 520px;
  margin: 0 auto;
  padding: 20px 30px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 220px;
  display: block;
  margin: 0 auto -20px auto;
}

.registro-box {
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

h1 {
  font-size: 28px;
  color: var(--color-principal);
  text-align: center;
}

.bienvenida {
  text-align: center;
  color: var(--color-texto-suave);
  font-size: 16px;
  margin-top: -8px;
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

.seccion-cuidador {
  border: 1px dashed var(--color-borde);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seccion-titulo {
  font-size: 17px;
  font-weight: bold;
  color: var(--color-texto);
}

.seccion-titulo span {
  font-weight: normal;
  color: var(--color-texto-suave);
  font-size: 15px;
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
  background-color: #fdecea;
  border: 1px solid #c0392b;
  border-radius: 8px;
  padding: 12px 16px;
  width: 100%;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.error li {
  text-align: left;
}

.help-text {
  font-size: 14px;
  color: var(--color-texto-suave);
}

.login-link {
  font-size: 16px;
  color: var(--color-texto-suave);
  text-align: center;
}
</style>
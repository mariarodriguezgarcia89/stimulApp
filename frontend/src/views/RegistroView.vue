<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { useRouter } from 'vue-router'
import { mensajes } from '@/utils/mensajes.js'

import fondoRegistro from '@/assets/fondo-registro.png' 

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

const dia = ref('')
const mes = ref('')
const anio = ref('')

const dias = Array.from({ length: 31 }, (_, i) => i + 1)
const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]
const anioActual = new Date().getFullYear()
const anios = Array.from({ length: 100 }, (_, i) => anioActual - i)

function handleRegistro() {
  errores.value = []
  
  if (!nombre.value) errores.value.push(mensajes.nombreObligatorio)
  if (!apellidos.value) errores.value.push(mensajes.apellidosObligatorios)
  
  if (!email.value) {
    errores.value.push(mensajes.emailObligatorio)
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errores.value.push(mensajes.emailInvalido)
  }

  if (!password.value) {
    errores.value.push(mensajes.passwordObligatoria)
  } else if (password.value.length < 6) {
    errores.value.push(mensajes.passwordMinima)
  }

  if (!dia.value || !mes.value || !anio.value) {
    errores.value.push(mensajes.fechaNacimientoObligatoria)
  }

  if (password.value && confirmarPassword.value && password.value !== confirmarPassword.value) {
    errores.value.push(mensajes.passwordsNoCoinciden)
  }

  if (errores.value.length > 0) return

  const fechaFormateada = `${anio.value}-${String(mes.value).padStart(2, '0')}-${String(dia.value).padStart(2, '0')}`

  authService.registro({
    nombre: nombre.value,
    apellidos: apellidos.value,
    email: email.value,
    password: password.value,
    fecha_nacimiento: fechaFormateada,
    nombre_cuidador: nombreCuidador.value,
    email_cuidador: emailCuidador.value
  })
  .then(() => {
    router.push('/login?registro=exitoso')
  })
  .catch((err) => {
    if (err.response?.data?.error) {
        errores.value.push(err.response.data.error)
    } else {
        errores.value.push(mensajes.errorRegistro)
    }
  })
}
</script>

<template>
  <div class="registro-page">
    <img src="@/assets/logo.png" alt="Logo StimulApp" class="logo" />

    <div class="ilustracion-wrapper" aria-hidden="true">
      <img :src="fondoRegistro" alt="" class="ilustracion" />
    </div>

    <div class="caja">
        <h1>Crear cuenta</h1>
        <p class="bienvenida">Rellene el formulario para comenzar 😊</p>

        <div class="formulario-grid">
          
          <div class="campo">
            <label for="nombre">Nombre</label>
            <input id="nombre" v-model="nombre" type="text" autocomplete="given-name" placeholder="Su nombre" />
          </div>

          <div class="campo">
            <label for="apellidos">Apellidos</label>
            <input id="apellidos" v-model="apellidos" type="text" autocomplete="family-name" placeholder="Sus apellidos" />
          </div>

          <div class="campo fila-completa">
            <label for="email">Correo electrónico</label>
            <input id="email" v-model="email" type="email" autocomplete="email"
                inputmode="email" placeholder="ejemplo@correo.com" />
          </div>

          <div class="campo">
            <label for="password">Contraseña</label>
            <div class="password-wrapper">
              <input id="password" v-model="password" :type="mostrarPassword ? 'text' : 'password'" autocomplete="new-password" @keyup.enter="handleRegistro" />
              <button 
                type="button" 
                class="btn-mostrar"
                @click="mostrarPassword = !mostrarPassword"
                :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="mostrarPassword">
                {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <small class="help-text">👆 Pulse <strong>{{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}</strong> para {{ mostrarPassword ? 'ocultar' : 'ver' }} lo que está escribiendo</small>
          </div>

          <div class="campo">
            <label for="confirmarPassword">Confirmar contraseña</label>
            <div class="password-wrapper">
              <input id="confirmarPassword" v-model="confirmarPassword" :type="mostrarConfirmar ? 'text' : 'password'" autocomplete="new-password" @keyup.enter="handleRegistro" />
              <button 
                type="button" 
                class="btn-mostrar"
                @click="mostrarConfirmar = !mostrarConfirmar"
                :aria-label="mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="mostrarConfirmar">
                {{ mostrarConfirmar ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <small class="help-text">👆 Pulse <strong>{{ mostrarConfirmar ? 'Ocultar' : 'Mostrar' }}</strong> para {{ mostrarConfirmar ? 'ocultar' : 'ver' }} lo que está escribiendo</small>
          </div>

          <div class="campo fila-completa">
            <label>Fecha de nacimiento</label>
            <div class="fecha-selector-grid">
              <select v-model="dia" class="select-grande">
                <option value="" disabled>Día</option>
                <option v-for="d in dias" :key="d" :value="d">{{ d }}</option>
              </select>

              <select v-model="mes" class="select-grande">
                <option value="" disabled>Mes</option>
                <option v-for="(m, index) in meses" :key="m" :value="index + 1">{{ m }}</option>
              </select>

              <select v-model="anio" class="select-grande">
                <option value="" disabled>Año</option>
                <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
          </div>
        </div> 
        
        <div class="seccion-cuidador">
          <p class="seccion-titulo">Datos del cuidador <span>(opcional)</span></p>
          
          <div class="formulario-grid">
            <div class="campo">
              <label for="nombreCuidador">Nombre del cuidador</label>
              <input id="nombreCuidador" v-model="nombreCuidador" type="text" autocomplete="off" placeholder="Nombre de su cuidador o familiar" />
            </div>
            <div class="campo">
              <label for="emailCuidador">Correo del cuidador</label>
              <input id="emailCuidador" v-model="emailCuidador" type="email" autocomplete="off"
                inputmode="email" placeholder="correo@cuidador.com" />
            </div>
          </div>
          
          <small class="help-text">📧 Su cuidador recibirá informes de su progreso en esta dirección</small>
        </div>

        <ul v-if="errores.length > 0" class="error">
          <li v-for="e in errores" :key="e">⚠️ {{ e }}</li>
        </ul>

        <button class="btn-principal" @click="handleRegistro">Crear cuenta</button>

        <p class="registro-link">
          ¿Ya tienes cuenta?
          <RouterLink to="/login">Inicia sesión aquí</RouterLink>
        </p>
    </div>
  </div>
</template>

<style scoped>
/* ─── GRID PRINCIPAL ─── */
.registro-page {
  display: grid;
  height: 100vh;
  overflow: hidden;
  grid-template-columns: 1fr minmax(480px, 640px) 1fr;
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
  margin: 8px 0 0 8px;
}

/* ─── ILUSTRACIÓN (fila 1, columna izquierda) ─── */
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

/* ─── FORMULARIO (ambas filas, columna central) ─── */
.caja {
  grid-area: form;
  align-self: center;
  overflow-y: auto;
  max-height: calc(100vh - 40px);
  margin: 20px 0;
}

/* ─── MÓVIL ─── */
@media (max-width: 768px) {
  .registro-page {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
    grid-template-areas:
      "logo"
      "ilustracion"
      "form";
    height: auto;
    overflow: visible;
  }

  .logo {
    width: 180px;
    margin: 16px auto 8px;
  }

  .ilustracion-wrapper {
    justify-content: flex-start;
    align-items: flex-end;
    margin-right: 0;
    padding: 0 0 0 20px;
    height: 130px;
  }

  .ilustracion {
    width: 130px;
    max-width: none;
  }

  .caja {
    overflow-y: visible;
    max-height: none;
    margin: 0 0 24px;
  }

  html[data-size="large"] .ilustracion {
    width: 150px;
  }
}
</style>
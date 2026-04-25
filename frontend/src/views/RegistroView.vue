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

  if (!password.value) errores.value.push(mensajes.passwordObligatoria)

  // Validamos los selectores nuevos
  if (!dia.value || !mes.value || !anio.value) {
    errores.value.push(mensajes.fechaNacimientoObligatoria)
  }

  if (password.value && confirmarPassword.value && password.value !== confirmarPassword.value) {
    errores.value.push(mensajes.passwordsNoCoinciden)
  }

  if (errores.value.length > 0) return

  // ✨ PASO CLAVE: Construimos la fecha que el servidor espera (YYYY-MM-DD)
  const fechaFormateada = `${anio.value}-${String(mes.value).padStart(2, '0')}-${String(dia.value).padStart(2, '0')}`

  authService.registro({
    nombre: nombre.value,
    apellidos: apellidos.value,
    email: email.value,
    password: password.value,
    fecha_nacimiento: fechaFormateada, // 👈 Usamos la fecha construida
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

    <div class="caja">
      <h1>Crear cuenta</h1>
      <p class="bienvenida">Rellene el formulario para comenzar 😊</p>

      <div class="formulario-grid">
        
        <div class="campo">
          <label for="nombre">Nombre</label>
          <input id="nombre" v-model="nombre" type="text" placeholder="Su nombre" />
        </div>

        <div class="campo">
          <label for="apellidos">Apellidos</label>
          <input id="apellidos" v-model="apellidos" type="text" placeholder="Sus apellidos" />
        </div>

        <div class="campo fila-completa">
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
            <input id="nombreCuidador" v-model="nombreCuidador" type="text" placeholder="Nombre de su cuidador o familiar" />
          </div>
          <div class="campo">
            <label for="emailCuidador">Correo del cuidador</label>
            <input id="emailCuidador" v-model="emailCuidador" type="email" placeholder="correo@cuidador.com" />
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
/* Contenedor adaptado. Le bajo un poco a 850px para que no quede excesivamente gigante en PC */
.registro-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 30px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 220px;
  display: block;
  margin: 0 auto -20px auto;
}

/* --- ESTILOS EXCLUSIVOS DE LA SECCIÓN DEL CUIDADOR --- */
.seccion-cuidador {
  border: 2px dashed var(--color-borde);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.seccion-titulo {
  font-size: 18px;
  color: var(--color-texto);
  font-weight: 700;
  margin-bottom: 5px;
}

.seccion-titulo span {
  font-weight: normal;
  color: var(--color-texto-suave);
  font-size: 15px;
}

.error li {
  text-align: left;
  margin-left: 10px;
}

/* --- ADAPTACIÓN AL MODO OSCURO PARA EL CUIDADOR --- */
:global([data-theme="dark"]) .seccion-cuidador {
  border-color: #555555;
}

:global([data-theme="dark"]) .seccion-titulo {
  color: var(--color-texto);
}

:global([data-theme="dark"]) .seccion-titulo span {
  color: var(--color-texto-suave);
}
</style>
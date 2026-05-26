<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { useRouter } from 'vue-router'
import { mensajes } from '@/utils/mensajes.js'
import fondoRegistro from '@/assets/fondo-registro.png'

const router = useRouter()
const pasoActual = ref(1)

const nombre = ref('')
const apellidos = ref('')
const email = ref('')
const password = ref('')
const confirmarPassword = ref('')
const nombreCuidador = ref('')
const emailCuidador = ref('')
const mostrarPassword = ref(false)
const mostrarConfirmar = ref(false)
const errores = ref([])

const dia = ref('')
const mes = ref('')
const anio = ref('')

const dias = Array.from({ length: 31 }, (_, i) => i + 1)
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const anioActual = new Date().getFullYear()
const anios = Array.from({ length: 100 }, (_, i) => anioActual - i)

function validarPaso1() {
  errores.value = []
  if (!nombre.value) errores.value.push(mensajes.nombreObligatorio)
  if (!apellidos.value) errores.value.push(mensajes.apellidosObligatorios)
  return errores.value.length === 0
}

function validarPaso2() {
  errores.value = []
  if (!email.value) errores.value.push(mensajes.emailObligatorio)
  else if (!/\S+@\S+\.\S+/.test(email.value)) errores.value.push(mensajes.emailInvalido)
  if (!dia.value || !mes.value || !anio.value) errores.value.push(mensajes.fechaNacimientoObligatoria)
  return errores.value.length === 0
}

function validarPaso3() {
  errores.value = []
  if (!password.value) errores.value.push(mensajes.passwordObligatoria)
  else if (password.value.length < 6) errores.value.push(mensajes.passwordMinima)
  if (password.value && confirmarPassword.value && password.value !== confirmarPassword.value) {
    errores.value.push(mensajes.passwordsNoCoinciden)
  }
  return errores.value.length === 0
}

async function siguientePaso() {
  if (pasoActual.value === 1 && !validarPaso1()) return
  if (pasoActual.value === 2) {
    if (!validarPaso2()) return
    try {
      const existe = await authService.checkEmail(email.value)
      if (existe) {
        errores.value = ['Este correo electrónico ya está registrado. Si ya tiene una cuenta, puede iniciar sesión aquí.']
        return
      }
    } catch {
      errores.value = [mensajes.errorRegistro]
      return
    }
  }
  if (pasoActual.value === 3 && !validarPaso3()) return
  errores.value = []
  pasoActual.value++
}

function anteriorPaso() {
  errores.value = []
  pasoActual.value--
}

function handleRegistro() {
  errores.value = []
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
    const errorMsg = err.response?.data?.error || mensajes.errorRegistro
    errores.value.push(errorMsg)
    if (errorMsg.includes('registrado')) {
      pasoActual.value = 2
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

      <!-- Indicador de pasos -->
      <div class="pasos-indicador" aria-label="Progreso del formulario">
        <div v-for="n in 4" :key="n" class="paso-item">
          <div class="paso-circulo" :class="{ activo: pasoActual === n, completado: pasoActual > n }">
            {{ n }}
          </div>
        </div>
      </div>

      <h1>Crear cuenta</h1>

      <!-- ── PASO 1: Nombre y apellidos ── -->
      <template v-if="pasoActual === 1">
        <p class="bienvenida">¿Cómo se llama? 😊</p>

        <div class="campo">
          <label for="nombre">Nombre</label>
          <input id="nombre" v-model="nombre" type="text" autocomplete="given-name"
            placeholder="Su nombre" @keyup.enter="siguientePaso" />
        </div>

        <div class="campo">
          <label for="apellidos">Apellidos</label>
          <input id="apellidos" v-model="apellidos" type="text" autocomplete="family-name"
            placeholder="Sus apellidos" @keyup.enter="siguientePaso" />
        </div>

        <div v-if="errores.length > 0" class="error error-registro">
          <ul><li v-for="e in errores" :key="e">⚠️ {{ e }}</li></ul>
          <button class="error-cerrar" @click="errores.length = 0" aria-label="Cerrar errores">✕</button>
        </div>

        <div class="nav-pasos">
          <span></span>
          <button class="btn-principal" @click="siguientePaso">Siguiente →</button>
        </div>

      </template>

      <!-- ── PASO 2: Correo y fecha ── -->
      <template v-else-if="pasoActual === 2">
        <p class="bienvenida">¿Cuál es su correo y fecha de nacimiento? 📅</p>

        <div class="campo">
          <label for="email">Correo electrónico</label>
          <input id="email" v-model="email" type="email" autocomplete="email"
            inputmode="email" placeholder="ejemplo@correo.com" @keyup.enter="siguientePaso" />
        </div>

        <div class="campo">
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

        <div v-if="errores.length > 0" class="error error-registro">
          <ul><li v-for="e in errores" :key="e">⚠️ {{ e }}</li></ul>
          <button class="error-cerrar" @click="errores.length = 0" aria-label="Cerrar errores">✕</button>
        </div>

        <div class="nav-pasos">
          <button class="btn-secundario" @click="anteriorPaso">← Atrás</button>
          <button class="btn-principal" @click="siguientePaso">Siguiente →</button>
        </div>
      </template>

      <!-- ── PASO 3: Contraseña ── -->
      <template v-else-if="pasoActual === 3">
        <p class="bienvenida">Elija una contraseña segura 🔒</p>

        <div class="campo">
          <label for="password">Contraseña</label>
          <div class="password-wrapper">
            <input id="password" v-model="password"
              :type="mostrarPassword ? 'text' : 'password'"
              autocomplete="new-password" @keyup.enter="siguientePaso" />
            <button type="button" class="btn-mostrar"
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
            <input id="confirmarPassword" v-model="confirmarPassword"
              :type="mostrarConfirmar ? 'text' : 'password'"
              autocomplete="new-password" @keyup.enter="siguientePaso" />
            <button type="button" class="btn-mostrar"
              @click="mostrarConfirmar = !mostrarConfirmar"
              :aria-label="mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :aria-pressed="mostrarConfirmar">
              {{ mostrarConfirmar ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <small class="help-text">👆 Pulse <strong>{{ mostrarConfirmar ? 'Ocultar' : 'Mostrar' }}</strong> para {{ mostrarConfirmar ? 'ocultar' : 'ver' }} lo que está escribiendo</small>
        </div>

        <div v-if="errores.length > 0" class="error error-registro">
          <ul><li v-for="e in errores" :key="e">⚠️ {{ e }}</li></ul>
          <button class="error-cerrar" @click="errores.length = 0" aria-label="Cerrar errores">✕</button>
        </div>

        <div class="nav-pasos">
          <button class="btn-secundario" @click="anteriorPaso">← Atrás</button>
          <button class="btn-principal" @click="siguientePaso">Siguiente →</button>
        </div>
      </template>

      <!-- ── PASO 4: Datos del cuidador ── -->
      <template v-else>
        <p class="bienvenida">Datos del cuidador <span class="opcional">(opcional)</span> 👤</p>

        <div class="campo">
          <label for="nombreCuidador">Nombre del cuidador</label>
          <input id="nombreCuidador" v-model="nombreCuidador" type="text"
            autocomplete="off" placeholder="Nombre de su cuidador o familiar" />
        </div>

        <div class="campo">
          <label for="emailCuidador">Correo del cuidador</label>
          <input id="emailCuidador" v-model="emailCuidador" type="email"
            autocomplete="off" inputmode="email" placeholder="correo@cuidador.com" />
        </div>

        <small class="help-text">📧 Su cuidador recibirá informes de su progreso en esta dirección</small>

        <div v-if="errores.length > 0" class="error error-registro">
          <ul><li v-for="e in errores" :key="e">⚠️ {{ e }}</li></ul>
          <button class="error-cerrar" @click="errores.length = 0" aria-label="Cerrar errores">✕</button>
        </div>

        <div class="nav-pasos">
          <button class="btn-secundario" @click="anteriorPaso">← Atrás</button>
          <button class="btn-principal" @click="handleRegistro">Crear cuenta</button>
        </div>
      </template>

      <p class="registro-link">
        ¿Ya tienes cuenta?
        <RouterLink to="/login">Inicia sesión aquí</RouterLink>
      </p>

    </div>
  </div>
</template>

<style scoped>
/* ─── CONTENEDOR PRINCIPAL ─── */
.registro-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ─── LOGO (esquina superior izquierda) ─── */
.logo {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 180px;
  display: block;
  z-index: 1;
}

/* ─── ILUSTRACIÓN (pegada al borde izquierdo del formulario) ─── */
.ilustracion-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: calc(50% + 180px);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  pointer-events: none;
  z-index: 1;
}

.ilustracion {
  width: 100%;
  max-width: 400px;
  height: auto;
  display: block;
}

/* ─── CAJA (centrada en el viewport) ─── */
.caja {
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 480px;
  padding: 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Anular márgenes de bloque para que solo mande el gap del flex */
.caja h1 { margin: 0; }
.caja p  { margin: 0; }

input,
select {
  padding: 10px 14px !important;
}

/* ─── INDICADOR DE PASOS ─── */
.pasos-indicador {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 10px;
}

.paso-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.paso-circulo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-borde, #ccc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: var(--color-texto);
  background: var(--color-caja);
  transition: all 0.2s ease;
}

.paso-circulo.activo {
  background: var(--color-principal);
  border-color: var(--color-principal);
  color: #fff;
}

.paso-circulo.completado {
  background: var(--color-principal);
  border-color: var(--color-principal);
  color: #fff;
  opacity: 0.6;
}


/* ─── NAVEGACIÓN ENTRE PASOS ─── */
.nav-pasos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 10px;
}

.nav-pasos .btn-principal {
  margin-top: 0;
  flex: 1;
}

.btn-secundario {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 2px solid var(--color-principal);
  background: transparent;
  color: var(--color-principal);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secundario:hover {
  background: var(--color-principal);
  color: #fff;
}

/* ─── ERRORES ─── */
.error-registro {
  position: relative;
  text-align: left;
  padding-right: 28px;
}

.error-registro ul {
  margin: 0;
  padding-left: 4px;
  list-style: none;
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

/* ─── OPCIONAL ─── */
.opcional {
  font-size: 0.85em;
  font-weight: 400;
  color: var(--color-texto);
  opacity: 0.7;
}

/* ─── MÓVIL ─── */
@media (max-width: 768px) {
  .registro-page {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: auto;
    min-height: 100vh;
    overflow: visible;
    padding: 20px 16px 32px;
  }

  .logo {
    position: relative;
    top: auto;
    left: auto;
    width: 140px;
    margin: 0 auto 16px;
    display: block;
  }

  .ilustracion-wrapper {
    display: none;
  }

  .caja {
    width: 100%;
    max-width: none;
    padding: 24px 20px;
    margin-bottom: 0;
  }
}
</style>

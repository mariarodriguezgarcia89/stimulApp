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

  if (!password.value) errores.value.push(mensajes.passwordObligatoria)

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

    <div class="registro-layout">
      
      <div class="ilustracion-wrapper">
        <img 
          :src="fondoRegistro" 
          alt="" 
          aria-hidden="true"
          class="ilustracion" />
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
  </div>
</template>

<style scoped>
/* ─── CONTENEDOR PRINCIPAL ─── */
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

/* ─── LAYOUT Y CAJA ─── */
.registro-layout {
  position: relative;
  width: 100%;
  max-width: 980px;
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.registro-layout .caja {
  width: 100%;
  max-width: 100% !important;
  padding: 40px 50px; 
  position: relative;
  z-index: 2; 
}

/* ─── ILUSTRACIÓN DE ESCRITORIO ─── */
.ilustracion-wrapper {
  position: absolute;
  right: -550px;
  top: 75%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 700px;
  height: auto;
  display: block;
}

/* ─── RESPONSIVE ESCRITORIO ─── */
@media (max-width: 1500px) {
  .ilustracion-wrapper {
    right: -150px; 
  }
  .ilustracion {
    width: 380px;
  }
}

@media (max-width: 1300px) {
  .ilustracion-wrapper {
    display: none; 
  }
}

/* ─── RESPONSIVE MÓVIL Y ZOOM ─── */
@media (max-width: 768px) {

  .logo {
    width: 200px;
    margin-bottom: -50px;
  }

  .registro-container {
    padding: 10px 8px; 
  }

  .registro-layout {
    flex-direction: column; 
    width: 100%;
  }

  .registro-layout .caja {
    padding: 24px 12px; 
  }

  /* 👇 ILUSTRACIÓN APILADA (TIPO LOGIN) 👇 */
  .ilustracion-wrapper {
    display: block !important; 
    position: static; 
    transform: none; 
    right: auto; 
    top: auto; 
    z-index: 1;
    margin: 0 10px -20px auto; 
    text-align: right; 
  }

  .ilustracion {
    width: 130px; 
    height: auto;
    display: block; 
    margin: 0 0 0 auto; 
    filter: none; 
  }

  /* 👇 AJUSTES ESPECÍFICOS DE LA ILUSTRACIÓN CON ZOOM 👇 */
  html[data-size="large"] .ilustracion-wrapper {
    margin: 0 15px -25px auto; 
  }
  
  html[data-size="large"] .ilustracion {
    width: 150px; 
  }

  /* =============================================================
  👇 LÓGICA DE COMPRESIÓN PARA ZOOM - COMENTADA PARA PRUEBA 👇 
  (Asegúrate de haber pegado esto en tu main.css global)
  =============================================================
  
  html[data-size="large"] .registro-layout .caja {
    box-sizing: border-box !important;
    max-width: 100% !important; 
    padding: 16px 12px !important; 
    overflow-x: hidden; 
  }

  html[data-size="large"] .formulario-grid { row-gap: 8px !important; }
  html[data-size="large"] .campo { gap: 2px !important; }
  html[data-size="large"] .password-wrapper { gap: 4px !important; }

  html[data-size="large"] input,
  html[data-size="large"] select {
    box-sizing: border-box !important; 
    width: 100% !important;
    max-width: 100% !important; 
    padding: 10px 8px !important; 
    font-size: 1.1rem !important; 
  }

  html[data-size="large"] .btn-mostrar {
    min-height: auto !important; 
    padding: 6px 12px !important;
  }

  html[data-size="large"] .btn-principal {
    padding: 10px !important;
    margin-top: 0 !important;
  }
  
  html[data-size="large"] h1 { margin-bottom: 0 !important; }

  html[data-size="large"] .seccion-cuidador {
    padding: 12px !important;
    gap: 8px !important;
  }

  html[data-size="large"] .caja p, 
  html[data-size="large"] .caja h1,
  html[data-size="large"] .campo label {
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  }
  =============================================================
  */
}

/* --- MODO OSCURO --- */
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
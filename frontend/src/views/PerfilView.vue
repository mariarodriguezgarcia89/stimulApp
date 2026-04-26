<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import usuarioService from '@/services/usuarioService'
import { mensajes } from '@/utils/mensajes.js'
import avatarDefault from '@/assets/avatar-default.jpg'

const router = useRouter()
const authStore = useAuthStore()

const nombre = ref('')
const apellidos = ref('')
const fotoPerfil = ref('')
const email = ref('')
const nombreCuidador = ref('')
const emailCuidador = ref('')
const nuevaPassword = ref('')
const confirmarPassword = ref('')
const mostrarPassword = ref(false)
const mostrarConfirmar = ref(false)
const errores = ref([])
const exito = ref('')

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

onMounted(() => {
  if (!authStore.token) {
    router.push('/login')
    return
  }

  usuarioService.obtenerPerfil()
    .then(datos => {
      nombre.value = datos.nombre
      apellidos.value = datos.apellidos
      fotoPerfil.value = datos.foto_perfil
      email.value = datos.email
      nombreCuidador.value = datos.nombre_cuidador || ''
      emailCuidador.value = datos.email_cuidador || ''

      if (datos.fecha_nacimiento) {
        const fecha = datos.fecha_nacimiento.substring(0, 10).split('-')
        anio.value = parseInt(fecha[0])
        mes.value = parseInt(fecha[1])
        dia.value = parseInt(fecha[2])
      }
    })
    .catch(() => {
      router.push('/login')
    })
})

function handleGuardar() {
  errores.value = []
  exito.value = ''

  if (!nombre.value) errores.value.push(mensajes.nombreObligatorio)
  if (!apellidos.value) errores.value.push(mensajes.apellidosObligatorios)

  if (nuevaPassword.value || confirmarPassword.value) {
    if (nuevaPassword.value.length < 6) errores.value.push('La contraseña debe tener al menos 6 caracteres.')
    if (nuevaPassword.value !== confirmarPassword.value) errores.value.push(mensajes.passwordsNoCoinciden)
  }

  if (errores.value.length > 0) return

  const fechaFormateada = dia.value && mes.value && anio.value
    ? `${anio.value}-${String(mes.value).padStart(2, '0')}-${String(dia.value).padStart(2, '0')}`
    : ''

  const datos = {
    nombre: nombre.value,
    apellidos: apellidos.value,
    fecha_nacimiento: fechaFormateada,
    nombre_cuidador: nombreCuidador.value,
    email_cuidador: emailCuidador.value
  }

  if (nuevaPassword.value) {
    datos.password = nuevaPassword.value
  }

  usuarioService.actualizarPerfil(datos)
    .then(() => {
      exito.value = mensajes.exitoActualizarPerfil
      authStore.nombre = nombre.value
      localStorage.setItem('nombre', nombre.value)
      nuevaPassword.value = ''
      confirmarPassword.value = ''
    })
    .catch(() => {
      errores.value.push(mensajes.errorActualizarPerfil)
    })
}

function cerrarSesion() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="perfil-container">
    <img src="@/assets/logo.png" alt="Logo StimulApp" class="logo" />

    <div class="caja perfil-layout">

      <!-- CABECERA CENTRADA -->
      <div class="perfil-header">
        <h1>Mi perfil</h1>
        <p class="bienvenida">Aquí puede consultar y modificar sus datos 😊</p>
      </div>
<div class="perfil-columnas">

  <!-- Foto arriba izquierda -->
  <div class="bloque-foto">
    <img :src="fotoPerfil || avatarDefault" alt="Foto de perfil" class="foto-perfil" />
    <small class="help-text">📷 La edición de la foto estará disponible próximamente</small>
  </div>

  <!-- Derecha: ocupa dos filas -->
  <div class="columna-derecha">
    <div class="seccion-cuidador">
      <p class="seccion-titulo">Cambiar contraseña <span>(opcional)</span></p>
      <div class="campo">
        <label for="nuevaPassword">Nueva contraseña</label>
        <div class="password-wrapper">
          <input id="nuevaPassword" v-model="nuevaPassword" :type="mostrarPassword ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" />
          <button type="button" @click="mostrarPassword = !mostrarPassword">{{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}</button>
        </div>
      </div>
      <div class="campo">
        <label for="confirmarPassword">Confirmar contraseña</label>
        <div class="password-wrapper">
          <input id="confirmarPassword" v-model="confirmarPassword" :type="mostrarConfirmar ? 'text' : 'password'" placeholder="Repita la nueva contraseña" />
          <button type="button" @click="mostrarConfirmar = !mostrarConfirmar">{{ mostrarConfirmar ? 'Ocultar' : 'Mostrar' }}</button>
        </div>
      </div>
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
      </div>
      <small class="help-text">📧 Su cuidador recibirá informes de su progreso en esta dirección</small>
    </div>
  </div>

  <!-- Datos personales abajo izquierda -->
  <div class="bloque-datos">
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
        <input id="email" v-model="email" type="email" disabled />
        <small class="help-text">📧 El correo electrónico no puede modificarse</small>
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
  </div>

</div>

      <!-- PIE: errores, éxito y botones -->
      <div class="perfil-footer">
        <ul v-if="errores.length > 0" class="error">
          <li v-for="e in errores" :key="e">⚠️ {{ e }}</li>
        </ul>
        <p v-if="exito" class="exito">{{ exito }}</p>

        <div class="botones-footer">
          <button class="btn-volver" @click="router.push('/menu')">← Volver al menú</button>
          <button class="btn-principal" @click="handleGuardar">Guardar cambios</button>
          <button class="btn-cerrar" @click="cerrarSesion">🚪 Cerrar sesión</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.perfil-container {
  max-width: 1100px;
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

/* Layout principal de la caja */
.perfil-layout {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Cabecera centrada */
.perfil-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.foto-perfil {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-principal);
}


.columna {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.perfil-columnas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: 
    "foto derecha"
    "datos derecha";
  gap: 24px 40px;
  align-items: start;
}

.bloque-foto {
  grid-area: foto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 2px dashed var(--color-borde);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.bloque-datos {
  grid-area: datos;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 2px dashed var(--color-borde);
  border-radius: 12px;
  padding: 20px;
}

:global([data-theme="dark"]) .bloque-datos {
  border-color: #555555;
}


.columna-derecha {
  grid-area: derecha;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
/* Secciones con borde discontinuo */
.seccion-cuidador {
  border: 2px dashed var(--color-borde);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seccion-titulo {
  font-size: 18px;
  color: var(--color-texto);
  font-weight: 700;
}

.seccion-titulo span {
  font-weight: normal;
  color: var(--color-texto-suave);
  font-size: 15px;
}

:global([data-theme="dark"]) .seccion-cuidador {
  border-color: #555555;
}

/* Input deshabilitado */
input:disabled {
  background-color: #f0f0f0;
  color: var(--color-texto-suave);
  cursor: not-allowed;
}

:global([data-theme="dark"]) input:disabled {
  background-color: #333333;
  color: var(--color-texto-suave);
}

/* Pie de página */
.perfil-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.botones-footer {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
  align-items: center;
}

/* Mensaje de éxito */
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

:global([data-theme="dark"]) .exito {
  background-color: #1e3a29;
  color: #4ade80;
  border-color: #27ae60;
}

</style>
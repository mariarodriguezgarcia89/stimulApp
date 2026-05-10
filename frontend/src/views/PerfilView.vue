<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import usuarioService from '@/services/usuarioService'
import { mensajes } from '@/utils/mensajes.js'
import avatarDefault from '@/assets/avatar-default.jpg'
import fondoPerfil from '@/assets/fondo-perfil.png'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import ModalEliminarCuenta from '@/components/modals/ModalEliminarCuenta.vue'

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

const mostrarModalEliminar = ref(false)

function handleEliminarCuenta() {
  usuarioService.eliminarCuenta()
    .then(() => {
      authStore.logout()
      router.push('/login')
    })
    .catch(() => {
      errores.value.push('No se ha podido eliminar la cuenta. Inténtalo de nuevo.')
    })
}
</script>

<template>
  <div class="perfil-page">

    <AppTopbar :modoJuego="true" />

    <div class="perfil-container">
      
      <div class="ilustracion-wrapper">
        <img 
          :src="fondoPerfil" 
          alt="" 
          aria-hidden="true"
          class="ilustracion" />
      </div>

      <div class="perfil-layout">

        <div class="perfil-header">
          <h1>Mi perfil</h1>
          <p class="bienvenida">Aquí puede consultar y modificar sus datos 😊</p>
        </div>

        <div class="perfil-columnas">

          <div class="bloque-foto">
            <img :src="fotoPerfil || avatarDefault" alt="Foto de perfil" class="foto-perfil" />
            <small class="help-text">📷 La edición de la foto estará disponible próximamente</small>
          </div>

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

          <div class="zona-peligro">
              <p class="zona-peligro-titulo">⚠️ Zona de peligro</p>
              <button class="btn-eliminar" @click="mostrarModalEliminar = true">Eliminar cuenta</button>
            </div>

            <ModalEliminarCuenta
              v-if="mostrarModalEliminar"
              @confirmar="handleEliminarCuenta"
              @cancelar="mostrarModalEliminar = false"
            />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── BASE DE LA PÁGINA (Sin scroll exterior) ── */
.perfil-page {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Obliga a medir exactamente el 100% de la ventana */
  overflow: hidden; /* Elimina el scroll global */
}

.perfil-container {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 16px 24px; /* Reducido drásticamente (antes 60px abajo) */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-height: 0;
}

/* ── ILUSTRACIÓN LATERAL ── */
.ilustracion-wrapper {
  position: absolute;
  left: -400px;
  bottom: 0; /* Anclada abajo para que no se corte raro */
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 600px; /* Un pelín más pequeña para que no moleste */
  height: auto;
  display: block;
}

/* ── TARJETA DEL PERFIL ── */
.perfil-layout {
  background-color: var(--color-caja, #ffffff);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px; /* Reducido de 32px a 20px */
  width: 100%;
  max-width: 900px; 
  padding: 24px 32px; /* Reducido para ganar espacio vertical */
  z-index: 2;
  flex: 1; /* Se estira para ocupar el espacio central */
  min-height: 0;
  overflow-y: auto; /* Seguro de vida: si el monitor es enano, hará scroll por dentro, no por fuera */
}

/* ── CABECERA CENTRADA ── */
.perfil-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.perfil-header h1 {
  margin: 0;
  color: var(--color-principal);
  font-size: 1.8rem;
}

/* ── CUADRÍCULA DE SECCIONES ── */
.perfil-columnas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: 
    "foto derecha"
    "datos derecha";
  gap: 16px 32px; /* Menos separación vertical entre cajas */
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
  padding: 16px; /* Reducido */
  text-align: center;
}

.foto-perfil {
  width: 85px; /* Foto ligeramente más pequeña */
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-principal);
}

.bloque-datos {
  grid-area: datos;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 2px dashed var(--color-borde);
  border-radius: 12px;
  padding: 16px;
}

.columna-derecha {
  grid-area: derecha;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seccion-cuidador {
  border: 2px dashed var(--color-borde);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seccion-titulo {
  font-size: 16px; /* Títulos un poquito más discretos */
  color: var(--color-texto);
  font-weight: 700;
  margin: 0;
}

.seccion-titulo span {
  font-weight: normal;
  color: var(--color-texto-suave);
  font-size: 14px;
}

/* ── CAMPOS DE FORMULARIO ── */
.formulario-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 10px 16px; /* Menos aire entre filas de inputs */
}

.fila-completa {
  grid-column: 1 / -1; 
}

.fecha-selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; 
  gap: 8px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.campo label {
  font-size: 0.9rem;
  font-weight: 600;
}

.help-text {
  font-size: 0.8rem;
  color: var(--color-texto-suave);
  line-height: 1.2;
  margin: 0;
}

.password-wrapper {
  display: flex;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

input:disabled {
  background-color: #f0f0f0;
  color: var(--color-texto-suave);
  cursor: not-allowed;
}

/* ── PIE DE PÁGINA ── */
.perfil-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto; /* Empuja los botones hacia abajo si sobra espacio */
}

.botones-footer {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
  align-items: center;
}

.botones-footer button {
  padding: 10px; /* Botones más estilizados para ahorrar espacio vertical */
  font-size: 1rem;
}

.exito, .error {
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  font-weight: bold;
}

.exito {
  color: #27ae60;
  background-color: #eafaf1;
  border: 1px solid #27ae60;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
  list-style-type: none;
}

.zona-peligro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #e74c3c;
  padding-top: 16px;
  margin-top: 8px;
}

.zona-peligro-titulo {
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: 600;
  margin: 0;
}

.btn-eliminar {
  background-color: transparent;
  color: #c0392b;
  border: 1px solid #c0392b;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
}

.btn-eliminar:hover {
  background-color: #fdecea;
}

/* ── RESPONSIVE (MÓVILES Y TABLETS PEQUEÑAS) ── */
@media (max-width: 768px) {
  /* 1. Devolvemos el scroll natural a la página entera */
  .perfil-page {
    height: auto;
    overflow: visible;
  }

  .perfil-container {
    padding: 16px 12px 30px;
  }

  /* 2. Ocultamos al señor de la ilustración para hacer sitio */
  .ilustracion-wrapper {
    display: none !important;
  }

  /* 3. Ajustamos la caja blanca */
  .perfil-layout {
    padding: 24px 16px;
    gap: 24px;
    overflow-y: visible; /* El scroll lo hace la página, no la caja */
  }

  /* 4. Magia: Pasamos de 2 columnas a 1 sola, apilando todo hacia abajo */
  .perfil-columnas {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "foto"
      "datos"
      "derecha";
    gap: 20px;
  }

  /* 5. Apilamos también "Nombre" y "Apellidos" uno encima del otro */
  .formulario-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* Reducimos un poco el padding de los selectores de fecha para que quepan bien */
  .select-grande {
    padding: 10px 4px;
    font-size: 0.95rem;
  }

  /* 6. Apilamos los botones del final para que sean fáciles de pulsar con el dedo */
  .botones-footer {
    grid-template-columns: 1fr; /* Uno debajo del otro */
    gap: 12px;
  }

  .botones-footer button {
    padding: 16px; /* Botones más altos (mejor accesibilidad táctil) */
    font-size: 1.1rem;
  }
  
  /* Ajuste para el botón de mostrar/ocultar contraseña */
  .password-wrapper button {
    padding: 0 12px;
    font-size: 0.9rem;
  }
}
</style>
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
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const anioActual = new Date().getFullYear()
const anios = Array.from({ length: 100 }, (_, i) => anioActual - i)

const tabActiva = ref('datos')

onMounted(() => {
  if (!authStore.token) { router.push('/login'); return }
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
    .catch(() => { router.push('/login') })
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
  if (emailCuidador.value && !/\S+@\S+\.\S+/.test(emailCuidador.value)) {
    errores.value.push('El formato del correo del cuidador no es válido.')
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
  if (nuevaPassword.value) datos.password = nuevaPassword.value

  usuarioService.actualizarPerfil(datos)
    .then(() => {
      exito.value = mensajes.exitoActualizarPerfil
      authStore.nombre = nombre.value
      localStorage.setItem('nombre', nombre.value)
      nuevaPassword.value = ''
      confirmarPassword.value = ''
    })
    .catch(() => { errores.value.push(mensajes.errorActualizarPerfil) })
}

function cerrarSesion() {
  authStore.logout()
  router.push('/login')
}

const mostrarModalEliminar = ref(false)

function handleEliminarCuenta() {
  usuarioService.eliminarCuenta()
    .then(() => { authStore.logout(); router.push('/login') })
    .catch(() => { errores.value.push('No se ha podido eliminar la cuenta. Inténtalo de nuevo.') })
}
</script>

<template>
  <div class="perfil-page">
    <AppTopbar :modoJuego="true" />

    <div class="ilustracion-wrapper" aria-hidden="true">
      <img :src="fondoPerfil" alt="" class="ilustracion" />
    </div>

    <div class="perfil-container">
      <div class="perfil-layout caja">

        <!-- Cabecera: foto + nombre + email -->
        <div class="perfil-header">
          <img :src="fotoPerfil || avatarDefault" alt="Foto de perfil" class="foto-perfil" />
          <div class="perfil-header-texto">
            <h1>{{ nombre }} {{ apellidos }}</h1>
            <p class="email-display">{{ email }}</p>
          </div>
        </div>

        <!-- Pestañas -->
        <div class="tabs-nav" role="tablist">
          <button class="tab-btn" :class="{ activa: tabActiva === 'datos' }"
            @click="tabActiva = 'datos'" role="tab" :aria-selected="tabActiva === 'datos'">
            👤 Mis datos
          </button>
          <button class="tab-btn" :class="{ activa: tabActiva === 'password' }"
            @click="tabActiva = 'password'" role="tab" :aria-selected="tabActiva === 'password'">
            🔒 Contraseña
          </button>
          <button class="tab-btn" :class="{ activa: tabActiva === 'cuidador' }"
            @click="tabActiva = 'cuidador'" role="tab" :aria-selected="tabActiva === 'cuidador'">
            👨‍👩‍👧 Cuidador
          </button>
        </div>

        <div class="tab-contenido">

          <!-- Tab: Datos personales + fecha -->
          <div v-if="tabActiva === 'datos'" class="tab-panel">
            <div class="campo-fila">
              <div class="campo">
                <label for="nombre">Nombre</label>
                <input id="nombre" v-model="nombre" type="text" placeholder="Su nombre" />
              </div>
              <div class="campo">
                <label for="apellidos">Apellidos</label>
                <input id="apellidos" v-model="apellidos" type="text" placeholder="Sus apellidos" />
              </div>
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
          </div>

          <!-- Tab: Contraseña -->
          <div v-if="tabActiva === 'password'" class="tab-panel">
            <div class="campo">
              <label for="nuevaPassword">Nueva contraseña</label>
              <div class="password-wrapper">
                <input id="nuevaPassword" v-model="nuevaPassword"
                  :type="mostrarPassword ? 'text' : 'password'"
                  placeholder="Mínimo 6 caracteres" />
                <button type="button" class="btn-mostrar"
                  @click="mostrarPassword = !mostrarPassword">
                  {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
            </div>
            <div class="campo">
              <label for="confirmarPassword">Confirmar contraseña</label>
              <div class="password-wrapper">
                <input id="confirmarPassword" v-model="confirmarPassword"
                  :type="mostrarConfirmar ? 'text' : 'password'"
                  placeholder="Repita la nueva contraseña" />
                <button type="button" class="btn-mostrar"
                  @click="mostrarConfirmar = !mostrarConfirmar">
                  {{ mostrarConfirmar ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Tab: Cuidador -->
          <div v-if="tabActiva === 'cuidador'" class="tab-panel">
            <div class="campo-fila">
              <div class="campo">
                <label for="nombreCuidador">Nombre del cuidador</label>
                <input id="nombreCuidador" v-model="nombreCuidador" type="text"
                  placeholder="Nombre del cuidador" />
              </div>
              <div class="campo">
                <label for="emailCuidador">Correo del cuidador</label>
                <input id="emailCuidador" v-model="emailCuidador" type="email"
                  placeholder="correo@cuidador.com" />
              </div>
            </div>
            <small class="help-text">📧 Su cuidador recibirá informes de su progreso en esta dirección</small>
          </div>

        </div>

        <!-- Mensajes -->
        <div v-if="errores.length > 0" class="error">
          <ul><li v-for="e in errores" :key="e">⚠️ {{ e }}</li></ul>
          <button class="error-cerrar" @click="errores.splice(0)" aria-label="Cerrar errores">✕</button>
        </div>
        <p v-if="exito" class="exito">{{ exito }}</p>

        <!-- Botones -->
        <div class="botones-footer">
          <button class="btn-volver" @click="router.push('/menu')">← Volver</button>
          <button class="btn-principal" @click="handleGuardar">Guardar cambios</button>
          <button class="btn-cerrar" @click="cerrarSesion">🚪 Cerrar sesión</button>
        </div>

        <!-- Zona peligro -->
        <div class="zona-peligro">
          <p class="zona-peligro-titulo">⚠️ Zona de peligro</p>
          <button class="btn-eliminar" @click="mostrarModalEliminar = true">Eliminar cuenta</button>
        </div>

      </div>
    </div>

    <ModalEliminarCuenta
      v-if="mostrarModalEliminar"
      @confirmar="handleEliminarCuenta"
      @cancelar="mostrarModalEliminar = false"
    />
  </div>
</template>

<style scoped>
.perfil-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.perfil-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  min-height: 0;
}

/* ── ILUSTRACIÓN ── */
.ilustracion-wrapper {
  position: fixed;
  bottom: 0;
  right: -60px;
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 480px;
  height: auto;
  display: block;
}

/* ── TARJETA ── */
.perfil-layout {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2;
}

/* ── CABECERA ── */
.perfil-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-borde, #eee);
}

.foto-perfil {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-principal);
  flex-shrink: 0;
}

.perfil-header-texto h1 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--color-principal);
}

.email-display {
  margin: 2px 0 0;
  font-size: 0.9rem;
  color: var(--color-texto-suave);
}

/* ── PESTAÑAS ── */
.tabs-nav {
  display: flex;
  gap: 6px;
  border-bottom: 2px solid var(--color-borde, #ddd);
}

.tab-btn {
  flex: 1;
  padding: 11px 6px;
  border: 1px solid var(--color-borde, #ddd);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  background: var(--color-fondo, #f5f5f5);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-texto-suave);
  transition: background 0.15s, color 0.15s;
  line-height: 1.3;
}

.tab-btn.activa {
  background: var(--color-caja);
  color: var(--color-principal);
  border-color: var(--color-borde, #ddd);
  border-bottom: 2px solid var(--color-caja);
  margin-bottom: -2px;
}

.tab-btn:hover:not(.activa) {
  background: var(--color-borde, #eee);
  color: var(--color-texto);
}

.tab-contenido {
  border: 1px solid var(--color-borde, #ddd);
  border-top: none;
  border-radius: 0 0 10px 10px;
  padding: 16px;
  min-height: 148px;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── CAMPOS ── */
.campo-fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.fecha-selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.password-wrapper {
  display: flex;
  gap: 8px;
}

.password-wrapper input {
  flex: 1;
}

.help-text {
  font-size: 0.85rem;
  color: var(--color-texto-suave);
}

/* ── MENSAJES ── */
.error {
  position: relative;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
  border-radius: 8px;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  font-weight: bold;
}

.error ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.error-cerrar {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: inherit;
  padding: 0;
  line-height: 1;
}

.exito {
  color: #27ae60;
  background-color: #eafaf1;
  border: 1px solid #27ae60;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin: 0;
}

/* ── BOTONES ── */
.botones-footer {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 12px;
  align-items: center;
}

.botones-footer button {
  padding: 10px;
  font-size: 1rem;
  white-space: nowrap;
}

/* ── ZONA PELIGRO ── */
.zona-peligro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e74c3c;
  padding-top: 10px;
}

.zona-peligro-titulo {
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: 600;
  margin: 0;
}

.btn-eliminar {
  background: transparent;
  color: #c0392b;
  border: 1px solid #c0392b;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
}

.btn-eliminar:hover {
  background-color: #fdecea;
}

/* ── MÓVIL ── */
@media (max-width: 768px) {
  .perfil-container {
    align-items: flex-start;
    padding: 16px 12px 30px;
  }

  /* Anula el padding grande que hereda de .caja (40px 36px por defecto) */
  .perfil-layout {
    padding: 20px 16px;
  }

  .ilustracion-wrapper {
    display: none;
  }

  .tab-btn {
    font-size: 0.8rem;
    padding: 10px 4px;
  }

  .tab-contenido {
    min-height: auto;
  }

  .campo-fila {
    grid-template-columns: 1fr;
  }

  .fecha-selector-grid {
    grid-template-columns: 1fr 2fr 1fr;
  }

  .fecha-selector-grid .select-grande {
    padding: 8px 4px;
    font-size: 15px;
  }

  .botones-footer {
    grid-template-columns: 1fr;
  }

  .zona-peligro {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
}
</style>

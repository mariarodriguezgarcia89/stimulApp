<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import usuarioService from '@/services/usuarioService'
import { mensajes } from '@/utils/mensajes.js'

const router = useRouter()
const authStore = useAuthStore()
import avatarDefault from '@/assets/avatar-default.jpg'

const nombre = ref('')
const apellidos = ref('')
const fotoPerfil = ref('')
const email = ref('') 
const fechaNacimiento = ref('')
const nombreCuidador = ref('')
const emailCuidador = ref('')
const errores = ref([])
const exito = ref('')

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
      fechaNacimiento.value = datos.fecha_nacimiento 
        ? datos.fecha_nacimiento.substring(0, 10) 
        : ''
      nombreCuidador.value = datos.nombre_cuidador || ''
      emailCuidador.value = datos.email_cuidador || ''
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

  if (errores.value.length > 0) return

  usuarioService.actualizarPerfil({
    nombre: nombre.value,
    apellidos: apellidos.value,
    fecha_nacimiento: fechaNacimiento.value,
    nombre_cuidador: nombreCuidador.value,
    email_cuidador: emailCuidador.value
  })
  .then(() => {
    exito.value = mensajes.exitoActualizarPerfil
    authStore.nombre = nombre.value
    localStorage.setItem('nombre', nombre.value)
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

    <div class="perfil-box">
      <h1>Mi perfil</h1>
      <p class="bienvenida">Aquí puede consultar y modificar sus datos 😊</p>

      <div class="avatar">
        <img 
        :src="fotoPerfil || avatarDefault" 
        alt="Foto de perfil" 
        class="foto-perfil" 
        />
        <p class="help-text">📷 La edición de la foto estará disponible próximamente</p>
      </div>

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
        <input id="email" v-model="email" type="email" disabled />
        <small class="help-text">📧 El correo electrónico no puede modificarse</small>
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

      <p v-if="exito" class="exito">{{ exito }}</p>

      <button class="btn-principal" @click="handleGuardar">Guardar cambios</button>

      <button class="btn-secundario" @click="cerrarSesion">Cerrar sesión</button>
    </div>
  </div>
</template>

<style scoped>
.perfil-container {
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

.perfil-box {
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

.avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.foto-perfil {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-principal);
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

input:disabled {
  background-color: #f0f0f0;
  color: var(--color-texto-suave);
  cursor: not-allowed;
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

.btn-secundario {
  width: 100%;
  padding: 14px;
  font-size: 18px;
  background-color: white;
  color: var(--color-principal);
  border: 2px solid var(--color-principal);
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.btn-secundario:hover {
  background-color: #fdecea;
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

.help-text {
  font-size: 14px;
  color: var(--color-texto-suave);
}
</style>
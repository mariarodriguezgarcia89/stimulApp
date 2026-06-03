import { ref } from 'vue'
import { defineStore } from 'pinia'

// Estado global de autenticación: persiste token, nombre y foto en localStorage entre sesiones
export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const nombre = ref(localStorage.getItem('nombre'))
  const foto_perfil = ref(localStorage.getItem('foto_perfil'))

  // Guarda la sesión del usuario tras el login exitoso
  function login(tokenValue, nombreValue, fotoPerfilValue) {
    token.value = tokenValue
    nombre.value = nombreValue
    foto_perfil.value = fotoPerfilValue
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('nombre', nombreValue)
    localStorage.setItem('foto_perfil', fotoPerfilValue)
  }

  // Limpia todos los datos de sesión (logout manual o por token expirado)
  function logout() {
    token.value = null
    nombre.value = null
    foto_perfil.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('nombre')
    localStorage.removeItem('foto_perfil')
  }

  return { token, nombre, foto_perfil, login, logout }
})
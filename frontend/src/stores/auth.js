import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token'))
    const nombre = ref(localStorage.getItem('nombre'))
    const foto_perfil = ref(localStorage.getItem('foto_perfil'))

//Login: guarda el token y el nombre del usuario en el localStorage y en las variables reactivas
function login(tokenValue, nombreValue, fotoPerfilValue) {
    token.value = tokenValue
    nombre.value = nombreValue
    foto_perfil.value = fotoPerfilValue
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('nombre', nombreValue)
    localStorage.setItem('foto_perfil', fotoPerfilValue)
}   

//Logout: borra el token y el nombre del usuario del localStorage y de las variables reactivas
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
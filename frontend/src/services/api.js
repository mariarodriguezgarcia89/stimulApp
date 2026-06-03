import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// Instancia axios con la URL base del backend (configurable por variable de entorno)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

// Añade el JWT a cada petición si el usuario está autenticado
api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Cierra sesión automáticamente si el backend devuelve 401 (token expirado o inválido)
// No redirige si ya estamos en Login para evitar bucles
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && router.currentRoute.value.name !== 'Login') {
      const authStore = useAuthStore()
      authStore.logout()
      router.push({ name: 'Login' })
    }
    return Promise.reject(error)
  }
)

export default api
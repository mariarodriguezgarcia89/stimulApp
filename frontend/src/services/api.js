import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: 'http://localhost:3000'
})

// Interceptor de petición: añade el JWT a cada llamada
api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Interceptor de respuesta: si el backend devuelve 401, cierra sesión y redirige al login
api.interceptors.response.use(
  response => response,                    // todo OK, deja pasar la respuesta
  error => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push({ name: 'Login' })
    }
    return Promise.reject(error)           // propaga el error para que el componente sepa que falló
  }
)

export default api
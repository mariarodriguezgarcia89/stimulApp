import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'
import RegistroView from '@/views/RegistroView.vue'
import PerfilView from '@/views/PerfilView.vue'
import MenuView from '@/views/MenuView.vue' 
import RefranView from '@/views/RefranView.vue'
import MemoryView from '@/views/MemoryView.vue'
import IntrusoView from '@/views/IntrusoView.vue'
import EstadisticasView from '@/views/EstadisticasView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/registro',
      name: 'Registro',
      component: RegistroView
    },
    {
      path: '/perfil',
      name: 'Perfil',
      component: PerfilView,
      meta: { requiresAuth: true }
    }, 
    {
      path: '/menu',
      name: 'Menu',
      component: MenuView,
      meta: { requiresAuth: true }
    },
    { path: '/juego/refran', 
      name: 'Refran', 
      component: RefranView,
      meta: { requiresAuth: true }
    }, 
    { path: '/juego/memory', 
      name: 'Memory', 
      component: MemoryView,
      meta: { requiresAuth: true }
    },
    { path: '/juego/intruso', 
      name: 'Intruso', 
      component: IntrusoView,
      meta: { requiresAuth: true }
    },
    { path: '/estadisticas', 
      name: 'Estadisticas', 
      component: EstadisticasView,
      meta: { requiresAuth: true }
     }
  ],
})

router.beforeEach((to, from) => {
    const authStore = useAuthStore()
    
    // Si la ruta requiere autenticación y no hay token, redirige al login
    if (to.meta.requiresAuth && !authStore.token) {
        return { name: 'Login' }
    }
    
    // En cualquier otro caso, deja pasar
})

export default router

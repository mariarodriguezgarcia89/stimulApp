import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegistroView from '@/views/RegistroView.vue'
import PerfilView from '@/views/PerfilView.vue'

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
      component: PerfilView
    }
  ],
})

export default router

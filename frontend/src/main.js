// Punto de entrada de la app: registra plugins (Pinia, Router, ApexCharts) y monta el componente raíz
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Registro de plugins y montaje de la aplicación
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.component('apexchart', VueApexCharts)
app.mount('#app')

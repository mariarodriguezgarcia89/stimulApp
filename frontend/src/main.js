// Punto de entrada de la app: registra plugins (Pinia, Router, ApexCharts) y monta el componente raíz
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('apexchart', VueApexCharts)
app.mount('#app')

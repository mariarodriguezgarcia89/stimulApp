// Store de preferencias de UI: gestiona el modo oscuro y el tamaño de fuente, persistidos en localStorage
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // Estado inicial leído de localStorage; por defecto modo claro y tamaño normal
  const dark = ref(localStorage.getItem('ui-dark') === 'true')
  const large = ref(localStorage.getItem('ui-large') === 'true')

  // Alterna el modo oscuro, lo persiste y aplica el atributo al <html>
  function toggleDark() {
    dark.value = !dark.value
    localStorage.setItem('ui-dark', dark.value)
    aplicarDark()
  }

  // Alterna el tamaño de fuente grande, lo persiste y aplica el atributo al <html>
  function toggleLarge() {
    large.value = !large.value
    localStorage.setItem('ui-large', large.value)
    aplicarLarge()
  }

  function aplicarDark() {
    document.documentElement.setAttribute('data-theme', dark.value ? 'dark' : 'light')
  }

  function aplicarLarge() {
    document.documentElement.setAttribute('data-size', large.value ? 'large' : 'normal')
  }

  // Aplica el estado guardado al arrancar la app (llamar una vez desde main.js)
  function init() {
    aplicarDark()
    aplicarLarge()
  }

  return { dark, large, toggleDark, toggleLarge, init }
})

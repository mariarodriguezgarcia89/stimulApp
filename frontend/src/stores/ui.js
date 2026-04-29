import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // ── ESTADO ──
  // Leemos de localStorage al arrancar para que se mantenga entre sesiones.
  // Si no hay nada guardado, partimos de false (modo claro, tamaño normal).
  const dark = ref(localStorage.getItem('ui-dark') === 'true')
  const large = ref(localStorage.getItem('ui-large') === 'true')

  // ── ACCIONES ──
  // Cada acción cambia el estado, lo persiste en localStorage,
  // y aplica la clase al <html> para que el CSS reaccione.
  function toggleDark() {
    dark.value = !dark.value
    localStorage.setItem('ui-dark', dark.value)
    aplicarDark()
  }

  function toggleLarge() {
    large.value = !large.value
    localStorage.setItem('ui-large', large.value)
    aplicarLarge()
  }

  // ── HELPERS PRIVADOS ──
  // Manipulan el atributo del <html>. Los expone también el método init().
  function aplicarDark() {
    document.documentElement.setAttribute('data-theme', dark.value ? 'dark' : 'light')
  }

  function aplicarLarge() {
    document.documentElement.setAttribute('data-size', large.value ? 'large' : 'normal')
  }

  // Llamar UNA VEZ al arrancar la app, desde main.js.
  // Aplica las clases según el estado leído de localStorage.
  function init() {
    aplicarDark()
    aplicarLarge()
  }

  return { dark, large, toggleDark, toggleLarge, init }
})
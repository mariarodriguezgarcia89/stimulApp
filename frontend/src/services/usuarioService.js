import api from './api'

function obtenerPerfil() {
  return api.get('/usuarios/me')
    .then(res => res.data)
    .catch(err => {
      console.error('Error al obtener el perfil:', err)
      throw err
    })
}

function actualizarPerfil(datos) {
  return api.put('/usuarios/me', datos)
    .then(res => res.data)
    .catch(err => {
      console.error('Error al actualizar el perfil:', err)
      throw err
    })
}

export default { obtenerPerfil, actualizarPerfil }
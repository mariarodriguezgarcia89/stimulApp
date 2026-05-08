<script setup>
import { ref } from 'vue'
import authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import fondoLogin from '@/assets/fondo-login.png'

const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const error = ref('')

const route = useRoute()
const exito = ref(route.query.registro === 'exitoso' ? 
  '✅ ¡Cuenta creada correctamente! Ya puede iniciar sesión con su correo y contraseña.' : '')

const authStore = useAuthStore()
const router = useRouter()

function handleLogin() {
  error.value = ''
  authService.login(email.value, password.value)
    .then(datos => {
      authStore.login(datos.token, datos.nombre, datos.foto_perfil)
      router.push('/menu')
    })
    .catch(err => {
      const status = err.response?.status
      if (status === 403) {
        error.value = 'Esta cuenta ha sido desactivada. Contacte con su cuidador para recuperarla.'
      } else {
        error.value = 'Correo o contraseña incorrectos. Por favor, inténtelo de nuevo.'
  }
})
}
</script>

  <template>
  <div class="login-container">
    <img src="@/assets/logo.png" alt="Logo StimulApp" class="logo" />
    
    <div class="login-layout">
      <!-- Ilustración decorativa -->
      <div class="ilustracion-wrapper">
        <img 
          :src="fondoLogin" 
          alt="" 
          aria-hidden="true"
          class="ilustracion" />
      </div>
    
    <div class="caja">
        <h1>Iniciar sesión</h1>
        <p class="bienvenida">Bienvenido/a a StimulApp 😊</p>
        
        <p v-if="exito" class="exito">{{ exito }}</p>
        
        <div class="campo">
          <label for="email">Correo electrónico</label>
          <input 
            :class="{ 'input-error': error }"
            id="email" 
            v-model="email" 
            type="email" 
            autocomplete="username"
            inputmode="email"
            placeholder="ejemplo@correo.com" />
        </div>

        <div class="campo">
          <label for="password">Contraseña</label>
          <div class="password-wrapper">
              <input 
                id="password" 
                v-model="password" 
                :type="mostrarPassword ? 'text' : 'password'"
                autocomplete="current-password"
                @keyup.enter="handleLogin"
               />
              <button 
                type="button" 
                class="btn-mostrar"
                @click="mostrarPassword = !mostrarPassword"
                :aria-label="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :aria-pressed="mostrarPassword">
                {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
          </div>
          <small class="help-text">
            👆 Pulse <strong>{{ mostrarPassword ? 'Ocultar' : 'Mostrar' }}</strong> 
            para {{ mostrarPassword ? 'ocultar' : 'ver' }} lo que está escribiendo
          </small>
        </div>

        <ul v-if="error" class="error">
          <li>⚠️ {{ error }}</li>
        </ul>

        <button class="btn-principal" @click="handleLogin">Iniciar sesión</button>

        <p class="registro-link">
          ¿No tienes cuenta?
          <RouterLink to="/registro">Regístrate aquí</RouterLink>
        </p>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── CONTENEDOR PRINCIPAL ─── */
.login-container {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.logo {
  width: 350px;
  display: block;
  margin: 0 auto -40px auto;
}

.login-container .caja {
  position: relative;
  z-index: 2;
}

/* ─── ILUSTRACIÓN (a la izquierda, sin afectar a la caja) ─── */
.ilustracion-wrapper {
  position: absolute;
  left: -480px;
  top: 75%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.ilustracion {
  width: 650px;
  height: auto;
  display: block;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 1500px) {
  .ilustracion-wrapper {
    left: -430px;
  }
  .ilustracion {
    width: 380px;
  }
}

@media (max-width: 1300px) {
  .ilustracion-wrapper {
    display: none;
  }
}

/* ─── Estilos existentes ─── */
.exito {
  color: #27ae60;
  font-size: 16px;
  font-weight: bold;
  background-color: #eafaf1;
  border: 1px solid #27ae60;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  text-align: center;
}

.input-error {
  border-color: #c0392b !important;
}

@media (max-width: 768px) {
  .logo {
    width: 200px;
  }

  .login-container {
    padding: 10px 8px; /* Reducimos el padding exterior en móvil */
  }

  .registro-link {
    text-align: center;
  }
  
  .registro-link a {
    display: block;
  }

/* 
  html[data-size="large"] .caja {
    padding: 20px 16px !important; 
    gap: 8px !important; 
  }
  
  html[data-size="large"] .campo {
    gap: 2px !important; 
  }
  
  html[data-size="large"] .password-wrapper {
    gap: 4px !important;
  }
 
  html[data-size="large"] input {
    padding: 8px 12px !important; 
  }
  
  html[data-size="large"] .btn-mostrar {
    min-height: auto !important; 
    padding: 6px 12px !important;
  }
  
  html[data-size="large"] .btn-principal {
    padding: 10px !important;
    margin-top: 0 !important;
  }
  
  html[data-size="large"] h1 {
    margin-bottom: 0 !important;
  } */
  /* 3. Ajustar el tamaño de la ilustración si el zoom está activado en móvil */
  html[data-size="large"] .ilustracion-wrapper {
    margin: 0 0 -25px 15px; /* Un poco más de superposición con zoom */
  }
  html[data-size="large"] .ilustracion {
    width: 170px; /* Un poco más grande con zoom */
  }

  /* 1. Volver a mostrar la ilustración y reposicionarla para móvil */
  .ilustracion-wrapper {
    display: block !important; /* Anular el 'none' de la regla de max-width: 1300px */
    position: static; /* Volver a posicionamiento normal en el flujo */
    transform: none; /* Quitar la transformación de escritorio */
    left: auto; /* Quitar el left de escritorio */
    top: auto; /* Quitar el top de escritorio */
    z-index: 1; /* Mantener z-index */
    margin: 0 auto -20px 20px; /* Centrar y margen inferior negativo para "apoyarlo" en la caja */
    text-align: center; /* Centrar la imagen si es más pequeña que el contenedor */
  }

  /* 2. Reducir el tamaño de la ilustración para que sea "pequeña" */
  .ilustracion {
    width: 150px; /* Tamaño "pequeño" para móvil. Ajustar si la quieres más grande/pequeña */
    height: auto;
    display: block; /* Asegurar que sea un bloque para centrar */
    margin: 0;
    filter: none; /* Asegurar que no tenga filtros heredados no deseados */
  }
}

</style>
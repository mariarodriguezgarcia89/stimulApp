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
    .catch(() => {
      error.value = 'Correo o contraseña incorrectos. Por favor, inténtelo de nuevo.'
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
  align-items: center;
  gap: 8px;
  position: relative;
}

.logo {
  width: 350px;
  display: block;
  margin: 0 auto -40px auto;
}

.login-container .caja {
  width: 500px;
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
</style>
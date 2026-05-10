# 🧠 StimulApp

**Aplicación web de estimulación cognitiva para personas mayores**

StimulApp es una aplicación web desarrollada como Trabajo Final de Ciclo de 2º DAM. Está dirigida a personas mayores sin deterioro cognitivo o con un grado leve-moderado, y ofrece tres juegos de estimulación cognitiva adaptados a sus necesidades, con seguimiento del rendimiento, análisis de tendencias y alertas automáticas al cuidador.

---

## 🛠️ Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 + Vite, Pinia, Vue Router, Axios, ApexCharts |
| Backend | Node.js, Express, Sequelize ORM, JWT, bcryptjs |
| Base de datos | MariaDB |
| Correo | Nodemailer |
| Informes PDF | Puppeteer |
| Tareas automáticas | node-cron |

---

## 📁 Estructura del proyecto

```
StimulApp/
├── backend/
│   ├── config/          # Configuración de la conexión a la base de datos
│   ├── jobs/            # Tareas programadas: envío de informes y alertas de inactividad
│   ├── middleware/      # Verificación del token JWT en rutas protegidas
│   ├── models/          # Modelos de datos: Usuario, Juego, Partida, Estadística, etc.
│   ├── public/          # Archivos generados por la app (informes HTML)
│   ├── routes/          # Endpoints de la API REST organizados por entidad
│   ├── seeds/           # Script para poblar la base de datos con datos de ejemplo
│   ├── services/        # Lógica de negocio: generación de informes y envío de correos
│   ├── templates/       # Plantilla HTML base para los informes mensuales
│   ├── .env.example     # Plantilla de configuración (ver sección de configuración)
│   └── app.js           # Punto de entrada del servidor
└── frontend/
    ├── public/          # Imágenes estáticas de los juegos
    └── src/
        ├── assets/      # Recursos gráficos: logo, fondos, avatar por defecto
        ├── components/  # Componentes reutilizables: barra de navegación, modales
        ├── composables/ # Lógica compartida entre vistas (ej: gestión de partidas)
        ├── router/      # Definición de rutas y protección de páginas privadas
        ├── services/    # Funciones para comunicarse con la API del backend
        ├── stores/      # Estado global de la aplicación con Pinia
        ├── utils/       # Textos y mensajes centralizados
        └── views/       # Pantallas principales de la aplicación
```

---

## ✅ Requisitos previos

Antes de instalar el proyecto, asegúrate de tener instalado lo siguiente en tu máquina:

- **[Node.js](https://nodejs.org/) v18 o superior** — entorno de ejecución de JavaScript necesario tanto para el backend como para el frontend. Al instalarlo, se instala también `npm` automáticamente.
- **[npm](https://www.npmjs.com/) v9 o superior** — gestor de paquetes de Node.js, necesario para instalar las dependencias del proyecto.
- **[MariaDB](https://mariadb.org/) v10.6 o superior** — sistema de base de datos donde se almacenará toda la información de la aplicación.

> 💡 Puedes comprobar las versiones instaladas ejecutando `node -v`, `npm -v` y `mariadb --version` en la terminal.

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/mariarodriguezgarcia89/stimulapp.git
cd stimulapp
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

Este comando descarga e instala todas las librerías que necesita el servidor (Express, Sequelize, JWT, etc.).

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

Este comando instala las librerías del cliente (Vue 3, Pinia, Axios, etc.).

---

## ⚙️ Configuración

### Base de datos

Crea la base de datos en MariaDB antes de arrancar el servidor por primera vez. Puedes hacerlo desde **DBeaver** siguiendo estos pasos:

1. Abre DBeaver y conéctate a tu servidor MariaDB
2. En el panel izquierdo, haz click derecho sobre tu conexión → **Create → Database**
3. Escribe `stimulapp` como nombre y pulsa **OK**

O si prefieres ejecutarlo directamente como sentencia SQL, abre un editor SQL en DBeaver (**SQL Editor → New SQL Script**) y ejecuta:

```sql
CREATE DATABASE stimulapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Las tablas se crean automáticamente la primera vez que arranques el servidor, gracias a `sequelize.sync()`.

### Variables de entorno

El proyecto utiliza variables de entorno para gestionar las credenciales de forma segura, evitando que datos sensibles queden expuestos en el código fuente.

**Pasos:**

1. Entra en la carpeta `backend/`
2. Copia el archivo `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```
3. Abre el archivo `.env` y rellena cada valor con tus datos reales:

```env
# Base de datos
DB_HOST=localhost        # Dirección del servidor de base de datos (normalmente localhost)
DB_PORT=3306             # Puerto de MariaDB (3306 por defecto)
DB_NAME=stimulapp        # Nombre de la base de datos que has creado
DB_USER=tu_usuario       # Usuario de MariaDB con acceso a esa base de datos
DB_PASSWORD=tu_contraseña

# Autenticación
JWT_SECRET=una_clave_secreta_larga_y_segura   # Cadena aleatoria usada para firmar los tokens

# Correo (necesario para alertas al cuidador e informes mensuales)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

> 📧 **¿Cómo obtener la contraseña de aplicación de Gmail?**
> La contraseña de aplicación es un código de 16 caracteres que Google genera específicamente para que aplicaciones externas puedan enviar correos desde tu cuenta, sin usar tu contraseña real.
>
> Pasos:
> 1. Accede a tu cuenta de Google y ve a **Gestionar tu cuenta de Google → Seguridad**
> 2. Activa la **verificación en dos pasos** si no la tienes activada (es obligatorio)
> 3. Una vez activada, busca **Contraseñas de aplicaciones** en el mismo apartado de Seguridad
> 4. Selecciona "Correo" como aplicación y "Otro" como dispositivo (ponle el nombre que quieras, ej: *StimulApp*)
> 5. Google te generará un código de 16 caracteres — cópialo y pégalo como valor de `EMAIL_PASS`

> ⚠️ El archivo `.env` **nunca debe subirse al repositorio**. Ya está incluido en `.gitignore` para evitarlo.

---

## 🌱 Carga de datos de ejemplo

Una vez configurada la base de datos y arrancado el servidor al menos una vez (para que se creen las tablas), ejecuta el script de seed desde la carpeta `backend/`:

```bash
node seeds/seed.js
```

Este script insertará de forma automática:

- Los **3 juegos** disponibles en la aplicación
- **3 usuarios de prueba** con los que podrás navegar y probar todas las funcionalidades
- **10 refranes** de ejemplo para el juego *Acaba el refrán*
- **6 ejercicios** para el juego *Encuentra el intruso* (3 de nivel Normal, 3 de nivel Avanzado)

> 💡 El script es seguro de ejecutar varias veces: usa `findOrCreate` internamente, por lo que no duplicará datos si ya existen.

### 👤 Usuarios de prueba

| Nombre | Email | Contraseña |
|--------|-------|-----------|
| Sergio González | sergio.gonzalez@example.com | password123 |
| María Rodríguez | maria.rodriguez@example.com | password123 |
| Juan Pérez | juan.perez@example.com | password123 |

---

## 🚀 Arranque

Es necesario tener **tanto el backend como el frontend en ejecución** para que la aplicación funcione correctamente. Abre dos terminales distintas:

### Terminal 1 — Backend

```bash
cd backend
node app.js
```

El servidor estará disponible en `http://localhost:3000`. Verás en la consola mensajes de confirmación de conexión a la base de datos y al servidor de correo.

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`. Ábrela en el navegador para empezar a usarla.

---

## 🎮 Funcionalidades principales

### 👤 Autenticación y perfil
- **Registro e inicio de sesión** con correo y contraseña, protegido mediante tokens JWT.
- **Perfil de usuario** editable: nombre, apellidos, fecha de nacimiento y datos del cuidador.
- **Cierre de sesión** y **eliminación de cuenta** con borrado lógico (los datos se conservan para el historial).
- Las rutas privadas están protegidas: si el usuario no está autenticado, se redirige automáticamente al login.

### 🕹️ Juegos cognitivos

Cada juego tiene dos niveles de dificultad: **Normal** y **Avanzado**.

- **Acaba el refrán** — Se muestra la primera parte de un refrán popular y el usuario debe completarlo. En nivel Normal, elige entre tres opciones; en nivel Avanzado, escribe la respuesta libremente.

- **Memory** — Juego clásico de memoria visual. En nivel Normal se muestran 8 cartas con más tiempo de visualización inicial; en nivel Avanzado, 16 cartas con menos tiempo.

- **Encuentra el intruso** — Se muestran cuatro imágenes y el usuario debe identificar cuál no pertenece al grupo. En nivel Normal las diferencias son evidentes; en nivel Avanzado son semánticamente más sutiles.

### 📊 Estadísticas y seguimiento
- **Panel de estadísticas** con evolución de puntuaciones mediante gráficas (ApexCharts).
- **Análisis de tendencia clínica**: compara las últimas 5 partidas con la media histórica y clasifica el rendimiento en mejoría, estabilidad o descenso.
- **Comparativa entre juegos**: identifica automáticamente el mejor, el más estable y el que más atención requiere.

### 📧 Comunicación con el cuidador
- **Alertas automáticas**: si el rendimiento cae más de un 30% respecto a la media histórica, se envía un correo de aviso al cuidador registrado.
- **Informes mensuales en PDF**: cada 15 días se genera y envía automáticamente un informe detallado al usuario y al cuidador, con gráficas, análisis por juego y recomendaciones personalizadas.
- **Recordatorio de inactividad**: si el usuario lleva más de 10 días sin jugar, recibe un correo de recordatorio.

### ♿ Accesibilidad
- **Modo oscuro** para reducir la fatiga visual.
- **Ajuste de tamaño de texto** para usuarios con dificultades visuales.
- Diseño adaptado a dispositivos móviles.

---

## 👩‍💻 Autor

**María Rodríguez García**
2º DAM — Trabajo Final de Ciclo 2025/2026
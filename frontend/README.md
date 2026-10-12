# StimulApp · Frontend

Cliente web de StimulApp, desarrollado con **Vue 3 + Vite**.

- **Estado global:** Pinia
- **Rutas:** Vue Router (con protección de páginas privadas)
- **Peticiones a la API:** Axios
- **Gráficas:** ApexCharts
- **App Android:** Capacitor

## Arranque en local

```bash
npm install
npm run dev
```

Antes de arrancar, copia `.env.example` a `.env`. Contiene la URL del backend:

```
VITE_API_URL=http://localhost:3000
```

La instalación completa del proyecto (backend, base de datos y datos de ejemplo) está en el [README principal](../README.md).

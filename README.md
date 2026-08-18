# 🌿 EcoGastroFest 2026 - PWA & Panel de Control

Plataforma integral Progressive Web App (PWA) y panel de operadores para festivales gastronómicos y culturales con sincronización en tiempo real, soporte offline en aglomeraciones y arquitectura híbrida **Firebase Firestore + Express REST**.

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos
- Node.js (versión 18 o superior recomendada)
- Navegador moderno (Chrome, Edge, Firefox, Safari)

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
# O directamente:
node server.js
```
El servidor quedará disponible en:
- 📱 **App Cliente (PWA):** `http://localhost:8080/index.html`
- 🛠️ **Panel de Administración:** `http://localhost:8080/admin.html`
- 🔥 **Asistente Firebase:** `http://localhost:8080/firebase_setup.html`

---

## 🌟 Características Destacadas

1. **📱 Experiencia de Usuario PWA (Mobile-First)**:
   - Instalable en la pantalla de inicio de Android/iOS/Windows.
   - Navegación fluida y carga instantánea con Service Worker (`sw.js`).
   - Radar en Vivo de aforo, tiempo de espera en puestos y estado de stock de platos.
   - Trivia ecológica con entrega de tickets virtuales para sorteos en el festival.

2. **🛠️ Panel de Control de Operadores en Tiempo Real**:
   - Edición y alta de puestos gastronómicos, cartas y precios.
   - Programación de shows, oradores, escenarios y horarios.
   - Conmutador de plato agotado (`Sold Out`) reflejado al instante en las pantallas de los usuarios.
   - Gestión de patrocinadores y categorías dinámicas.

3. **☁️ / 💻 Modo Híbrido Resiliente**:
   - Funciona conectado a la nube con **Firebase Firestore** para sincronización multi-dispositivo en tiempo real.
   - Cuenta con persistencia offline en **IndexedDB** para operar con alta concurrencia y cortes de señal.
   - Si no hay conexión o configuración en la nube, opera de forma 100% autónoma con su **REST API Local** (`data/db.json`).

4. **🎨 Optimización de Medios**:
   - Script automatizado (`scripts/fetch_and_convert_artists.js`) para comprimir fotos de artistas a formato WebP (< 100 KB).

---

## 🧪 Pruebas y Validación

```powershell
# Ejecutar batería de pruebas dinámicas (CRUD, sync y consistencia)
powershell -ExecutionPolicy Bypass -File test_dynamic_system.ps1

# Procesar/actualizar fotos de artistas
node scripts/fetch_and_convert_artists.js

# Comprobar estado de servidores
powershell -ExecutionPolicy Bypass -File check_status.ps1
```

---

## 📖 Documentación Adicional

- [📋 Historial de Cambios (CHANGELOG.md)](CHANGELOG.md): Registro detallado de versiones y mejoras según el estándar *Keep a Changelog*.
- [📐 Contexto y Arquitectura Técnica (PROJECT_CONTEXT.md)](PROJECT_CONTEXT.md): Especificación técnica completa, arquitectura, endpoints y diseño del sistema.

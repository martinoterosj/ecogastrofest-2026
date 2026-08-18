# 📋 Historial Detallado de Cambios (Changelog) - EcoGastroFest 2026

Todas las modificaciones, mejoras arquitectónicas, módulos y correcciones del proyecto **EcoGastroFest 2026** se documentan exhaustivamente en este archivo, siguiendo el estándar [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y las directrices de [Semantic Versioning (SemVer)](https://semver.org/).

---

## [Unreleased]
### Planificado / Próximas Mejoras
- [ ] **Pasarela de Pagos Digitales**: Integración con Mercado Pago / POS Web para pre-compra de eco-vasos y tickets gastronómicos.
- [ ] **Módulo de Analíticas en Vivo**: Dashboard con gráficos en tiempo real sobre afluencia por zonas, platos más vendidos y velocidad de rotación.
- [ ] **Notificaciones Web Push**: Alertas automáticas al dispositivo cuando un show marcado como favorito esté a 10 minutos de comenzar.

---

## [1.2.0] - 2026-08-18

### Added (Nuevas Funcionalidades)
- **Pipeline de Optimización de Medios WebP (`scripts/fetch_and_convert_artists.js`)**:
  - Descarga y procesamiento automatizado de imágenes de artistas referentes de la música uruguaya (*Jaime Roos, Ruben Rada, Emiliano Brancciari / NTVG, Sebastián Teysera / La Vela Puerca, Jorge Drexler, Roberto Musso / El Cuarteto de Nos, Hugo Fattoruso, Gabriel Peluffo / Buitres, Sergio Puglia & Lucía Soria, Laura Canoura*).
  - Conversión a formato WebP moderno con compresión inteligente `sharp` garantizando pesos inferiores a **100 KB** por activo con dimensiones fijas (700x420 px).
- **Adaptador Híbrido y Universal de Base de Datos (`js/db-adapter.js`)**:
  - Abstracción unificada que conmuta automáticamente entre **Firebase Cloud Firestore** (producción en la nube) y **REST API Express / LocalStorage** (desarrollo local y contingencia).
  - Activación de persistencia offline en **IndexedDB** (`enablePersistence({ synchronizeTabs: true })`) permitiendo funcionamiento ininterrumpido en eventos masivos con saturación de antenas 4G/5G.
  - Suscripción en tiempo real mediante `onSnapshot()` para distribuir cambios en milisegundos a todos los clientes conectados.
- **Asistente de Inicialización y Migración Cloud (`firebase_setup.html`)**:
  - Interfaz de diagnóstico para verificar credenciales de Firebase.
  - Botón de migración en 1 clic que vuelca la estructura completa inicial desde `db.json` hacia la colección `festivals/ecogastrofest_2026` de Firestore.
- **Suite de Simulación Multi-Agente Autónoma (`test_multiagent_simulation.js`)**:
  - Simula concurrentemente 5 perfiles de agentes con objetivos diversos:
    1. 🥦 **Valentina (Vegana/Celíaca)**: Validación de filtros dietarios combinados, búsqueda con caracteres especiales/acentos/emojis y votación de stand.
    2. 🎸 **Rodrigo (Melómano)**: Favoritos locales, cálculo del Live Radar con simulador de horarios (`10:00`, `12:30`, `18:00`, `21:30`, `23:55`) y verificación de fotos WebP en disco.
    3. 🎟️ **Camila (Cazadora de Sorteos)**: Fuzzing de formularios, protección anti-inyecciones, generación de Golden Ticket y dibujado en Canvas QR.
    4. 🛠️ **Carlos (Operador Admin)**: Login por PIN, alta de puestos en backend REST, conmutador de platos agotados (`Sold Out`) y emisión de alertas en vivo.
    5. ⚡ **Stress Bot (Carga Concurrente)**: 30 peticiones concurrentes a `/api/sync` y 10 registros de sorteo simultáneos con latencia P95 < 100 ms.
  - **100% de éxito (41/41 aserciones pasadas en 1.07s)**.
- **Suite Automatizada de Pruebas de Interfaz (`test_all_app_buttons.js`)**:
  - Batería de 66 pruebas de integración ejecutadas sobre JSDOM simulando interacción de usuario en 100% de los botones, formularios y modales (PWA cliente y panel de administración).

### Fixed (Correcciones de Robustez Descubiertas por los Agentes)
- **Selección Dinámica de Stands (`js/stands.js` & `js/raffle.js`)**: Corregido acceso a `opt.text` en entornos con propiedades `textContent`, previniendo errores al preseleccionar el stand votado en el formulario de sorteos.
- **Creación Flexible de Stands en Backend (`server.js`)**: Soporte para IDs personalizados y matrices de platos `menu` completos en el endpoint `POST /api/stands`.
- **Inicialización de App (`js/app.js`)**: Detección de `document.readyState` para asegurar que `App.init()` se ejecute inmediatamente si el DOM ya ha sido parseado.

### Changed (Modificaciones y Mejoras)
- **Sincronización en Tiempo Real (`js/sync.js`)**:
  - Detección de conectividad de red (`navigator.onLine`) con actualización visual del estado (Nube / Local / Offline).
  - Algoritmo de resolución de conflictos optimista para asegurar que las acciones de los operadores no se pierdan ante micro-cortes.
- **Panel de Administración (`admin.html` / `js/admin.js`)**:
  - Agregado badge de estado del motor de base de datos (`#dbEngineBadge`) que refleja en vivo si se opera en *Firebase Firestore (Nube)* o *Servidor Local / REST*.
  - Refactorización de modales con animaciones fluidas y cierre automático con tecla `Escape`.

---

## [1.1.0] - 2026-08-17

### Added (Arquitectura Dinámica sin Hardcoding)
- **Motor de Categorías Dinámicas**:
  - Eliminación total de valores fijos (*hardcoded*) para categorías de puestos gastronómicos y espectáculos.
  - Endpoints REST `/api/categories` con soporte para creación y eliminación con icono personalizado.
- **Gestión Dinámica de Escenarios (`stages`) y Zonas de la Plaza (`zones`)**:
  - Creación dinámica de escenarios con asignación en tiempo real a los shows de la agenda.
  - Editor interactivo del plano satelital de Plaza Independencia con posicionamiento de pines mediante coordenadas porcentuales `(x, y)` y código de sector.
- **Control de Stock y Plato Agotado (`Sold Out`)**:
  - Conmutador instantáneo en el panel de operadores para marcar platos individuales como agotados.
  - Actualización reactiva en las tarjetas de stands de los usuarios con insignia visual `Agotado` y desactivación del botón de pedido.
- **Gestión de Patrocinadores Sustentables (`sponsors`)**:
  - Administración de marcas aliadas segmentadas por categorías *Gold* (Eco-Vasos Oficiales, Bodegas Orgánicas, Banco Huella Cero) y *Silver* (Lácteos Regenerativos, Oliva Virgen Extra, Packaging Compostable).
- **Suites de Pruebas Automatizadas en PowerShell**:
  - `test_dynamic_system.ps1`: 9 pruebas dinámicas que validan el ciclo de vida completo de altas, actualizaciones, consistencia en `/api/sync` y bajas limpias.
  - `test_crud.ps1` & `test_eco_sponsors.ps1`: Pruebas de endpoints REST específicos.

### Fixed (Correcciones de Bugs)
- **Filtros de Puestos Gastronómicos**: Corregido problema donde agregar un puesto en una categoría recién creada no actualizaba inmediatamente la botonera de filtros de la PWA.
- **Limpieza de Modales**: Corregido bug donde los datos residuales del formulario de stands persistían al abrir el modal para crear un nuevo stand.

---

## [1.0.0] - 2026-08-16

### Added (Lanzamiento Inicial de la Plataforma)
- **Aplicación Web Progresiva para Clientes (`index.html`)**:
  - **Radar en Vivo (`js/live-radar.js`)**:
    - Reloj del festival con cálculo dinámico del show en curso, barra de progreso porcentual del espectáculo y cuenta regresiva para el siguiente show.
    - Simulador de horarios integrado con botones rápidos (`11:45`, `13:15`, `17:45`, `21:00`, `Tiempo Real`) para pruebas y demostraciones.
  - **Directorio de Stands Gastronómicos (`js/stands.js`)**:
    - Catálogo interactivo con filtrado por categorías (Carnes, Burgers, Vegano, Street Food, Cervezas, Dulces).
    - Filtros dietarios especializados (*100% Plant Based / Vegano*, *Sin TACC / Apto Celíacos*).
    - Modal Bottom-Sheet con detalle del puesto, menú completo con precios, botón de votación como puesto favorito e integración directa con WhatsApp.
  - **Cronograma y Agenda de Espectáculos (`js/agenda.js`)**:
    - Visualización cronológica de shows, oradores, fotos de artistas y escenarios.
    - Sistema de favoritos locales (`⭐`) persistidos en `LocalStorage` con filtro rápido *Mis Favoritos*.
  - **Trivia Ecológica y Tickets de Sorteo (`js/raffle.js`)**:
    - Formulario de inscripción con validación de nombre, WhatsApp y selección de stand favorito.
    - Generador de **Golden Ticket Digital** con código serial único (`GF-XXXX`), fecha de emisión y renderizado interactivo de matriz QR en Canvas HTML5.
    - Botones para copiar código al portapapeles y compartir la participación en WhatsApp.
  - **Guía del Predio & Mapa Satelital (`js/app.js`)**:
    - Plano de distribución de Plaza Independencia (San José de Mayo) con pines interactivos, enlaces a Google Maps / Waze e información de estacionamiento, primeros auxilios y Punto Verde.
  - **Soporte Offline & PWA (`sw.js` / `manifest.json` / `js/pwa.js`)**:
    - Service Worker con estrategia *Stale-While-Revalidate* para recursos críticos (HTML, CSS, JS, imágenes WebP y fuentes).
    - Indicador visual de instalación en dispositivos móviles y de escritorio.
- **Panel de Administración para Operadores (`admin.html` / `js/admin.js`)**:
  - Autenticación rápida mediante teclado numérico (PIN de 4 dígitos) y gestión de sesión en `sessionStorage`.
  - Pestañas operativas: *Agenda de Shows*, *Puestos Gastronómicos*, *Editor de Mapa*, *Anuncios en Vivo*, *Sorteos & Ruleta*, *Configuración Global*.
  - Ruleta digital en vivo para sorteo aleatorio de ganadores entre los participantes registrados.
  - Herramienta de Exportación/Importación de base de datos completa en formato JSON.
- **Backend Ligero y Persistente (`server.js` / `server.ps1`)**:
  - Servidor Express en Node.js con endpoints REST estructurados y persistencia en `data/db.json`.
  - Servidor de respaldo puro en PowerShell (`server.ps1`) con soporte para entornos sin Node.js instalado.
  - Scripts de despliegue automatizado para Firebase Hosting (`deploy_hosting.ps1`, `deploy.bat`).

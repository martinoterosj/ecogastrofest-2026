# 📋 Historial Detallado de Cambios (Changelog) - EcoGastroFest 2026

Todas las modificaciones, mejoras arquitectónicas, módulos y correcciones del proyecto **EcoGastroFest 2026** se documentan exhaustivamente en este archivo, siguiendo el estándar [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y las directrices de [Semantic Versioning (SemVer)](https://semver.org/).

---

## [Unreleased]
### Planificado / Próximas Mejoras
- [ ] **Pasarela de Pagos Digitales**: Integración con Mercado Pago / POS Web para pre-compra de eco-vasos y tickets gastronómicos.
- [ ] **Módulo de Analíticas en Vivo**: Dashboard con gráficos en tiempo real sobre afluencia por zonas, platos más vendidos y velocidad de rotación.
- [ ] **Notificaciones Web Push**: Alertas automáticas al dispositivo cuando un show marcado como favorito esté a 10 minutos de comenzar.

---

## [1.6.0] - 2026-08-18

### Changed (Optimizaciones Responsivas y Calibración Móvil)
- **Calibración Integral de Tamaños y Espaciados para Dispositivos Móviles (`css/main.css`, `css/components.css`, `css/admin.css`)**:
  - **Cabecera Adaptativa (`.app-header`)**: En pantallas < 380px, los títulos y chips de usuario usan tipografía fluida `clamp()` con `ellipsis`, y la píldora de estado colapsa su texto secundario mostrando únicamente el indicador parpadeante en vivo, evitando cualquier desborde horizontal.
  - **Navegación Inferior & Safe Areas (`.bottom-nav`)**: Calibración precisa para iPhones con Home Indicator y Androids con navegación por gestos (`padding-bottom: calc(var(--safe-bottom) + 6px)`), e iconos adaptados para pantallas ultra-compactas (320px / 360px).
  - **Modales de Bienvenida & Auth (`#authWelcomeModal`)**: Rediseño con `max-width: min(400px, 94vw)`, reducción proporcional del padding interno y botones táctiles con altura mínima de 44px (estándar Apple/Google HIG).
  - **Drawer de Perfil (`#userProfileDrawer`)**: Altura máxima y padding inferior calibrados para evitar colisiones con el teclado o la barra de gestos.
  - **Tarjetas de Agenda & Artistas (`.show-card`)**: Fijada relación de aspecto `aspect-ratio: 16/9` con `object-fit: cover` para las imágenes WebP de artistas, eliminando saltos de diseño (*layout shift*).
  - **Panel de Operadores Móvil (`admin.html` / `css/admin.css`)**: Barra de pestañas con desplazamiento horizontal inercial suave (`scrollbar-width: none`), formularios apilados en 1 columna en pantallas < 600px y tablas de gestión con scroll horizontal contenido.

---

## [1.5.0] - 2026-08-18

### Added (Nuevas Funcionalidades)
- **Base de Datos de Leads y Correos Electrónicos para Campañas de Marketing**:
  - Almacenamiento centralizado y persistente de usuarios registrados (`data/db.json` -> `users` y `localStorage.getItem('gastrofest_registered_users')`).
  - Endpoints REST dedicados en backend Express (`GET /api/users`, `POST /api/users`, `DELETE /api/users/:id`, `GET /api/users/export/csv`).
  - **Pestaña de Usuarios & Campañas en el Panel de Operadores (`#pane-users`)**:
    - Métricas en tiempo real: *Total Visitantes*, *Emails Google Verificados*, *Participantes con Golden Ticket*.
    - **Exportación CSV en 1 Clic (`AdminApp.exportUsersCSV()`)**: Descarga directa de archivo `.csv` compatible con Excel, Google Sheets, Mailchimp, Brevo, SendGrid y Meta Ads.
    - **Copiado Rápido de Correos (`AdminApp.copyAllEmails()`)**: Copia la lista de correos separados por comas al portapapeles con un solo toque.
    - Buscador reactivo por nombre, email o código de ticket.

### Changed (Mejoras en Suites de Pruebas)
- **Expansión de la Suite de Pruebas (`test_all_app_buttons.js`)**: Batería ampliada a **82 pruebas** (+5 aserciones dedicadas al panel de leads, renderizado de tablas, KPIs y buscador). Total general del proyecto: **127 pruebas automatizadas al 100%**.

---

## [1.4.0] - 2026-08-18

### Added (Nuevas Funcionalidades)
- **Módulo de Autenticación y Bienvenida (`js/auth.js`)**:
  - Pantalla flotante de bienvenida (*Dark Botanical Glassmorphism*) desplegada automáticamente al ingresar por primera vez o tras cerrar sesión.
  - **Inicio de Sesión con Google**: Botón estilizado con el logotipo SVG oficial de Google que crea la sesión del usuario con avatar, nombre verificado y correo electrónico.
  - **Acceso Inmediato como Invitado**: Permite a cualquier visitante comenzar a explorar el festival en 1 solo tap sin barreras ni contraseñas.
  - **Chip de Perfil en Barra Superior (`#userProfileChip`)**: Muestra en vivo la foto/avatar y nombre del usuario con distinción visual para cuentas de Google (`.is-google`).
  - **Drawer / Bottom Sheet de Perfil (`#userProfileDrawer`)**: Panel deslizable para consultar el estado de la sesión, vincular cuenta Google desde modo invitado, ver el Golden Ticket activo o cerrar sesión.
  - **Auto-Completado de Sorteo**: Al registrarse con Google, el formulario de sorteos pre-carga automáticamente el nombre del titular para una experiencia fluida.

### Changed (Mejoras en Suites de Pruebas)
- **Expansión de la Suite de Botones & UI (`test_all_app_buttons.js`)**: Batería ampliada a **77 pruebas** (+11 aserciones dedicadas al flujo de autenticación, modal de bienvenida, chip y drawer de perfil).
- **Expansión de la Simulación Multi-Agente (`test_multiagent_simulation.js`)**: Batería ampliada a **45 pruebas** validando el comportamiento de visitantes con cuenta Google y modo invitado en 1.62 segundos.

---

## [1.3.0] - 2026-08-18

### Removed (Eliminación de Código y Dependencias Inutilizadas)
- **Eliminación Total de Firebase y Reducción Masiva de Peso (-237 MB)**:
  - Eliminado el binario pesado `firebase.exe` (237 MB) y archivos de configuración huérfanos (`firebase.json`, `.firebaserc`, `firebase_setup.html`, `iniciar_sesion_firebase.bat`, `deploy_hosting.ps1`, `test_firestore.ps1`, `js/firebase-config.js`).
  - Limpieza de scripts CDN de Firebase en `index.html` y `admin.html`, acelerando la carga inicial y eliminando peticiones externas innecesarias.

### Changed (Optimizaciones y Refactorización)
- **Arquitectura Liviana y Pura REST + LocalStorage (`js/db-adapter.js` & `js/sync.js`)**:
  - `DBAdapter` simplificado a un adaptador nativo de sincronización transparente con el backend Express (`server.js`) y persistencia local offline en `localStorage`.
  - Incorporado `ensureState()` infalible en `js/admin.js` que garantiza la integridad completa de todas las entidades (shows, stands, zonas, avisos, sorteos) evitando pérdidas parciales de estado.
  - Exposición explícita de `window.GASTRO_DATA` en `js/data.js` para compatibilidad universal con entornos de prueba y navegadores.

### Fixed (Limpieza de Datos Residuales & Auto-Limpieza en Tests)
- **Purga de Datos de Prueba en `data/db.json` y `js/data.js`**:
  - Eliminada zona de prueba `zone-154` (`OTERO`).
  - Eliminado stand de prueba `st-69` (`Asado Criollo VIP Test`).
  - Eliminados avisos flash de prueba duplicados, conservando únicamente el comunicado oficial del festival libre de plásticos.
  - Purgados los más de 700 participantes generados por las pruebas de estrés de `StressBot`, restaurando los 3 registros semilla iniciales.
- **Auto-Limpieza en Suites de Pruebas (`test_multiagent_simulation.js`)**:
  - Los agentes `Carlos` y `StressBot` ahora eliminan automáticamente los registros creados durante la prueba tras verificar su aserción, garantizando que la base de datos se mantenga permanentemente limpia.

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

### Fixed (Correcciones de Robustez Descubiertas por los Agentes & Operadores)
- **Persistencia y Renderizado de Zonas en el Mapa (`js/app.js`, `js/sync.js`, `js/db-adapter.js` & `server.js`)**:
  - Resuelto problema donde las zonas creadas o modificadas (ej: *"ZONA DJ"*) no se renderizaban en la PWA de visitantes si el servidor operaba con fallback offline o antes de la primera sincronización.
  - Incorporada carga reactiva de `localStorage` en `App.init()` y fallback en `LiveSync.syncWithBackend()`.
  - Añadidos métodos CRUD dedicados en `DBAdapter` (`addZone`, `updateZone`, `deleteZone`) para sincronización bidireccional en tiempo real con Firebase Firestore.
  - Integrada oficialmente la **ZONA DJ** (`zone-dj` - *🎧 Espacio DJ & Ambientación Electrónica*) en el cuadrante Noroeste de Plaza Independencia (X: 38%, Y: 24%) con atajo rápido en el panel de administración.
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

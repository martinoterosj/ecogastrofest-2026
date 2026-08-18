# 🤖 AGENTS.md - Protocolo de Contexto para Antigravity & Asistentes de IA

Bienvenido/a a **EcoGastroFest 2026**. Si eres un agente de IA abriendo este proyecto en cualquier máquina, sigue este protocolo obligatorio para retomar el trabajo exactamente donde se dejó.

---

## 🎯 1. Instrucción de Arranque Inicial (Obligatoria)
Antes de responder al usuario o realizar cualquier cambio:
1. **Lee el contexto maestro**: Consulta [PROJECT_CONTEXT.md](file:///c:/Users/Martin/.gemini/antigravity-ide/scratch/gastrofest-app/PROJECT_CONTEXT.md) para comprender la arquitectura técnica, los 28 archivos del proyecto y los endpoints REST.
2. **Revisa el historial reciente**: Consulta [CHANGELOG.md](file:///c:/Users/Martin/.gemini/antigravity-ide/scratch/gastrofest-app/CHANGELOG.md) para conocer la última versión desplegada (`v1.2.0`) y las tareas en curso en la sección `[Unreleased]`.
3. **Valida el estado de la UI y los Tests**: Ejecuta `node test_all_app_buttons.js` para asegurar que las 66 pruebas de integración sigan pasando al 100%.

---

## 🏗️ 2. Resumen Técnico Rápido
* **Propósito**: PWA para festival gastronómico con radar en vivo, agenda de espectáculos, stands con filtros dietarios (Vegano/Sin TACC), sorteo con Golden Ticket QR interactivo y panel de administración para operadores con acceso por PIN.
* **Stack**: HTML5, Vanilla CSS (Dark Eco Theme), JavaScript Moderno, Express REST API (`server.js`), Firebase Cloud Firestore (`js/db-adapter.js` con persistencia IndexedDB offline) y Sharp para compresión WebP.
* **URLs de Servicio Local**:
  * 📱 **PWA Visitantes:** `http://localhost:8080/index.html`
  * 🛠️ **Panel Operadores:** `http://localhost:8080/admin.html` (PIN rápido: `1234` o `2026`)
  * 🔥 **Asistente Firestore:** `http://localhost:8080/firebase_setup.html`

---

## 🧪 3. Comandos de Verificación
* **Test de Botones & UI (66 pruebas JSDOM):** `node test_all_app_buttons.js`
* **Test de Integración Backend (PowerShell):** `powershell -ExecutionPolicy Bypass -File test_dynamic_system.ps1`
* **Optimización de Artistas WebP:** `node scripts/fetch_and_convert_artists.js`
* **Iniciar Servidor Local:** `node server.js`

---

## 📝 4. Regla de Mantenimiento de Contexto
Cada vez que implementes una funcionalidad o corrijas un error:
* Actualiza la sección `[Unreleased]` en [CHANGELOG.md](file:///c:/Users/Martin/.gemini/antigravity-ide/scratch/gastrofest-app/CHANGELOG.md).
* Si cambia la arquitectura o se agrega un endpoint, actualiza [PROJECT_CONTEXT.md](file:///c:/Users/Martin/.gemini/antigravity-ide/scratch/gastrofest-app/PROJECT_CONTEXT.md).

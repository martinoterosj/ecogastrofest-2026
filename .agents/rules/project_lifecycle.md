---
trigger: always_on
description: Protocolo obligatorio de mantenimiento de contexto, historial (CHANGELOG.md) y arquitectura viva (PROJECT_CONTEXT.md)
---

# 🧠 Protocolo Universal de Contexto e Historial para Antigravity

Cada vez que trabajes en este proyecto o en cualquier otro repositorio:

## 1. 🚀 Arranque Inicial (Lectura de Contexto)
- Al abrir o retomar un proyecto, antes de realizar cambios o responder al usuario, consulta si existen:
  1. `AGENTS.md` / `GEMINI.md`
  2. `PROJECT_CONTEXT.md` (Arquitectura, endpoints, componentes)
  3. `CHANGELOG.md` (Versiones y tareas pendientes en `[Unreleased]`)
- Si no existen y el proyecto tiene complejidad media/alta, inicialízalos siguiendo los estándares *Keep a Changelog* y *SSOT*.

## 2. 📝 Mantenimiento Continuo de Historial
- Al completar cualquier feature, refactorización, test o corrección de bug:
  - Registra el cambio en la sección `[Unreleased]` de `CHANGELOG.md` categorizándolo en `Added`, `Changed`, `Fixed` o `Removed`.
  - Si se introducen nuevos endpoints, módulos o cambios de arquitectura, actualiza inmediatamente `PROJECT_CONTEXT.md`.

## 3. 🧪 Validación de Calidad Automatizada
- Antes de dar por finalizada una tarea, ejecuta los scripts de pruebas del proyecto (ej: tests de UI, integración o multi-agente) para garantizar 0 regresiones y 100% de aserciones pasadas.

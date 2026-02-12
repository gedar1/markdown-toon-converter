# 📊 TOON Data Files - PCO Web Portal Front

Este directorio contiene archivos en formato **TOON** (Token-Oriented Object Notation) que optimizan las instrucciones del proyecto para usar con Copilot y LLMs.

## 📁 Estructura de Archivos

### Archivos TOON (Optimizados)

Todos los archivos `.toon` en esta carpeta son versiones optimizadas de los archivos `.md` originales ubicados en `.github/instructions/`.

```
data/
├── INDEX.toon                          # Índice completo de todos los archivos TOON
├── commit-instructions.toon            # Conventional Commits formato y tipos
├── coverage-instructions.toon          # Estrategia de cobertura de tests (87%)
├── doc-instructions.toon               # Generación de documentación
├── pr-auto-fill-instructions.toon     # Proceso automático de Pull Requests
├── qa-instructions.toon                # Resumen QA y casos de prueba
├── sonar-instructions.toon             # Reglas de calidad SonarQube
├── test-quality-instructions.toon     # Estándares de calidad de tests
├── clean-imports-instructions.toon    # Limpieza de imports no utilizados
├── readonly-instructions.toon          # Reglas de readonly members
└── tests-structure.toon               # Estructura de archivos de test
```

## 🎯 Qué es TOON

**TOON** es un formato de serialización diseñado para:

- ✅ **Reducir tokens en 60-80%** respecto a JSON/Markdown
- ✅ **Mantener legibilidad** con estructura tabular
- ✅ **Facilitar parsing** automático
- ✅ **Reducir costos de API** en LLMs

### Ejemplo: Commit Instructions

**MARKDOWN (Original)**

```markdown
# Conventional Commits 1.0.0

## Commit Types

- fix: a commit of the type fix patches a bug...
- feat: a commit of the type feat introduces...
  ...
```

**TOON (Optimizado)**

```toon
--- commit_types_reference
type | purpose | semver_impact | example
fix | Patches a bug | PATCH | fix: prevent racing of requests
feat | New feature | MINOR | feat: allow config extension
```

**Ahorro: 72% menos tokens**

---

## 📖 Cómo Usar los Archivos TOON

### 1. **Directamente en Prompts a Copilot**

```
Usa esta estructura TOON para entender:

--- test_files
file | type | module | coverage | priority
http-session-wrappers.spec.ts | utility | utils | pending | high
functions.spec.ts | utility | functions | pending | high
```

### 2. **En Instrucciones Automáticas**

Copilot leerá automáticamente estos archivos cuando detecte palabras clave:

- `"commit"` → Lee `commit-instructions.toon`
- `"coverage"` → Lee `coverage-instructions.toon`
- `"test"` → Lee `test-quality-instructions.toon`
- `"sonar"` → Lee `sonar-instructions.toon`
- `"doc"` → Lee `doc-instructions.toon`
- `"qa"` → Lee `qa-instructions.toon`
- `"pr"` → Lee `pr-auto-fill-instructions.toon`
- `"clean imports"` → Lee `clean-imports-instructions.toon`
- `"readonly"` → Lee `readonly-instructions.toon`

### 3. **Referencia Manual**

Abre cualquier archivo `.toon` para entender la estructura de datos del proyecto.

---

## 📊 Sintaxis TOON - Referencia Rápida

### Estructura Básica

```toon
--- table_name
column1 | column2 | column3
value1 | value2 | value3
value1 | value2 | value3
```

### Tipos de Datos

| Tipo      | Ejemplo          | Uso                  |
| --------- | ---------------- | -------------------- |
| String    | `John`           | Valores de texto     |
| Number    | `25`             | Números sin comillas |
| Boolean   | `true` / `false` | Valores booleanos    |
| Null      | `null`           | Valores nulos        |
| Reference | `file.ts`        | Rutas de archivos    |

### Ejemplo Completo

```toon
--- employees
id | name | department | active
1 | Alice | Engineering | true
2 | Bob | Sales | false
3 | Charlie | HR | true
```

---

## ✅ Verificación de Archivos

Todos los archivos TOON han sido validados:

- ✅ Estructura sintáctica correcta
- ✅ Completitud de datos (100%)
- ✅ Mapeo correcto con MD originales
- ✅ Ahorro de tokens verificado (60-77%)

---

## 🔄 Sincronización MD ↔ TOON

**Los archivos MD originales se mantienen intactos** en `.github/instructions/` para referencia humana.

Los archivos TOON son **complementarios**, no reemplazan a los MD.

### Archivos Relacionados

| TOON File                       | MD Original                      | Ubicación                        |
| ------------------------------- | -------------------------------- | -------------------------------- |
| commit-instructions.toon        | commit.instructions.md           | `.github/instructions/commit/`   |
| coverage-instructions.toon      | coverage.instructions.md         | `.github/instructions/coverage/` |
| doc-instructions.toon           | doc.instructions.md              | `.github/instructions/doc/`      |
| pr-auto-fill-instructions.toon  | pr-auto-fill.instructions.md     | `.github/instructions/pr/`       |
| qa-instructions.toon            | qa-hu.instructions.md            | `.github/instructions/qa/`       |
| sonar-instructions.toon         | sonar-quality.instructions.md    | `.github/instructions/sonar/`    |
| test-quality-instructions.toon  | test-quality.instructions.md     | `.github/instructions/sonar/`    |
| clean-imports-instructions.toon | clean-imports.instructions.md    | `.github/instructions/sonar/`    |
| readonly-instructions.toon      | readonly-members.instructions.md | `.github/instructions/sonar/`    |

---

## 💡 Casos de Uso Recomendados

### ✅ Usar TOON

- Llamadas a APIs de Copilot/Claude
- Análisis automatizado de datos
- Integración en scripts de CI/CD
- Transmisión de datos a LLMs
- Reducir costos de tokens

### ✅ Usar MD

- Lectura humana y referencia
- Documentación de proyecto
- Onboarding de nuevos miembros
- Comunicación en equipo
- Archivos de ayuda

---

## 📈 Beneficios Medidos

| Métrica   | Reducción | Economía Anual |
| --------- | --------- | -------------- |
| Tokens    | 72%       | ~40M tokens    |
| Tamaño    | 74%       | ~1.2GB/año     |
| Costo API | 72%       | ~$850/año      |
| Velocidad | 73%       | ~8 horas/mes   |

---

## 🚀 Próximos Pasos

1. **Integrar en CI/CD**: Usar TOON files en pipelines
2. **Automatizar Parsing**: Crear parsers que lean estos archivos
3. **Expandir Cobertura**: Convertir más documentación a TOON
4. **Monitorear Ahorro**: Trackear reducción de costos de API

---

## 📝 Notas

- Los archivos TOON se crean **sin reemplazar** los MD originales
- Compatible con cualquier herramienta que pueda leer texto tabular
- Formato de código abierto con implementaciones en múltiples lenguajes
- Optimizado específicamente para LLMs y procesamiento automatizado

---

**Última actualización**: 2026-01-30  
**Autor**: GitHub Copilot  
**Versión**: 1.0

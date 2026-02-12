/**
 * Template data for Copilot/AI documentation in Markdown format.
 * Provides structured templates for creating efficient AI context documentation.
 * 
 * Validates: Requirements 13.1, 13.2, 13.3, 13.4
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const templates: Template[] = [
  {
    id: 'copilot-instructions',
    name: '🤖 Copilot Instructions',
    description: 'Template for Copilot customization rules and best practices',
    content: `# Copilot Customization: [Feature Name]

## Objetivo

[Describe the main goal of these instructions - what should Copilot do automatically?]

## Regla Principal: [Rule Name]

### Criterio
[Define the main criterion or condition for applying this rule]

### Aplicar a:
- [Context 1 where rule applies]
- [Context 2 where rule applies]
- [Context 3 where rule applies]

### NO aplicar a:
- [Context 1 where rule does NOT apply]
- [Context 2 where rule does NOT apply]
- [Context 3 where rule does NOT apply]

## Patrones de Aplicación

1. **[Pattern Name 1]**
   - Descripción del patrón
   - Cuándo aplicarlo
   - Ejemplo de uso correcto
   - Ejemplo de uso incorrecto

2. **[Pattern Name 2]**
   - Descripción del patrón
   - Cuándo aplicarlo
   - Ejemplo de uso correcto
   - Ejemplo de uso incorrecto

3. **[Pattern Name 3]**
   - Descripción del patrón
   - Cuándo aplicarlo
   - Ejemplo de uso correcto
   - Ejemplo de uso incorrecto

## Casos Específicos

1. **[Specific Case 1]**
   - Contexto del caso
   - Regla a aplicar
   - Justificación
   - Ejemplo

2. **[Specific Case 2]**
   - Contexto del caso
   - Regla a aplicar
   - Justificación
   - Ejemplo

## Validación Automática

Antes de completar cualquier edición:
- ✅ [Validation checkpoint 1]
- ✅ [Validation checkpoint 2]
- ✅ [Validation checkpoint 3]
- ✅ [Validation checkpoint 4]`
  },
  {
    id: 'flow-documentation',
    name: '🔄 Flow Documentation',
    description: 'Template for documenting user flows and interaction sequences',
    content: `# [Feature Name] - User Flow Documentation

## Flujo Principal: [Flow Name]

**Contexto:** [Describe the context and starting conditions]

1. **[Step Name]**
   - Estado inicial: [Initial state description]
   - Acción del usuario: [User action]
   - Componente: [Component name or identifier]
   - Resultado: [What happens after the action]

2. **[Step Name]**
   - Estado inicial: [Initial state description]
   - Acción del usuario: [User action]
   - Validación: [Any validation that occurs]
   - Resultado: [What happens after the action]

3. **[Step Name]**
   - Estado inicial: [Initial state description]
   - Acción del usuario: [User action]
   - Lógica de negocio: [Business logic applied]
   - Resultado: [What happens after the action]

### Ruta Alternativa A: [Alternative Path Name]

4. **[Step Name]**
   - Condición: [When this path is taken]
   - Acción del usuario: [User action]
   - Resultado: [What happens]

5. **[Step Name]**
   - Acción del usuario: [User action]
   - Validación: [Validation logic]
   - Resultado: [What happens]

### Ruta Alternativa B: [Alternative Path Name]

4. **[Step Name]**
   - Condición: [When this path is taken]
   - Acción del usuario: [User action]
   - Resultado: [What happens]

## Flujo Secundario: [Secondary Flow Name]

**Contexto:** [Describe the context]

1. **[Step Name]**
   - Prerequisito: [What must be true before this step]
   - Acción: [Action taken]
   - Resultado: [Outcome]

2. **[Step Name]**
   - Acción: [Action taken]
   - Sincronización: [How data syncs with other parts]
   - Resultado: [Outcome]

## Puntos Críticos

1. **[Critical Point 1]**
   - Descripción: [What makes this critical]
   - Comportamiento esperado: [Expected behavior]
   - Validación requerida: [Required validation]

2. **[Critical Point 2]**
   - Descripción: [What makes this critical]
   - Comportamiento esperado: [Expected behavior]
   - Validación requerida: [Required validation]`
  },
  {
    id: 'code-patterns',
    name: '📐 Code Patterns',
    description: 'Template for documenting code patterns and anti-patterns',
    content: `# Code Patterns: [Pattern Category]

## Patrón Recomendado: [Pattern Name]

**Propósito:** [Why this pattern exists and what problem it solves]

**Cuándo usar:** [Situations where this pattern should be applied]

### Implementación

1. **[Implementation Step 1]**
   - Descripción: [What to do]
   - Código ejemplo: [Code example or reference]
   - Consideraciones: [Important notes]

2. **[Implementation Step 2]**
   - Descripción: [What to do]
   - Código ejemplo: [Code example or reference]
   - Consideraciones: [Important notes]

3. **[Implementation Step 3]**
   - Descripción: [What to do]
   - Código ejemplo: [Code example or reference]
   - Consideraciones: [Important notes]

## Anti-Patrones a Evitar

1. **[Anti-Pattern 1]**
   - Descripción: [What this anti-pattern looks like]
   - Por qué es problemático: [Why it's bad]
   - Solución correcta: [How to fix it]
   - Impacto: [Consequences of using this anti-pattern]

2. **[Anti-Pattern 2]**
   - Descripción: [What this anti-pattern looks like]
   - Por qué es problemático: [Why it's bad]
   - Solución correcta: [How to fix it]
   - Impacto: [Consequences of using this anti-pattern]

3. **[Anti-Pattern 3]**
   - Descripción: [What this anti-pattern looks like]
   - Por qué es problemático: [Why it's bad]
   - Solución correcta: [How to fix it]
   - Impacto: [Consequences of using this anti-pattern]

## Ejemplos Comparativos

1. **[Scenario 1]**
   - Código incorrecto: [Bad example]
   - Código correcto: [Good example]
   - Explicación: [Why the correct version is better]

2. **[Scenario 2]**
   - Código incorrecto: [Bad example]
   - Código correcto: [Good example]
   - Explicación: [Why the correct version is better]

## Checklist de Validación

- ✅ [Validation point 1]
- ✅ [Validation point 2]
- ✅ [Validation point 3]
- ✅ [Validation point 4]`
  },
  {
    id: 'best-practices',
    name: '⭐ Best Practices',
    description: 'Template for documenting best practices and guidelines',
    content: `# Best Practices: [Topic/Technology]

## Objetivo

[Describe the overall goal of these best practices]

## Principios Fundamentales

1. **[Principle 1]**
   - Definición: [What this principle means]
   - Importancia: [Why it matters]
   - Aplicación: [How to apply it]
   - Ejemplo: [Concrete example]

2. **[Principle 2]**
   - Definición: [What this principle means]
   - Importancia: [Why it matters]
   - Aplicación: [How to apply it]
   - Ejemplo: [Concrete example]

3. **[Principle 3]**
   - Definición: [What this principle means]
   - Importancia: [Why it matters]
   - Aplicación: [How to apply it]
   - Ejemplo: [Concrete example]

## Prácticas Recomendadas

1. **[Practice 1]**
   - Descripción: [What to do]
   - Beneficios: [Why this is beneficial]
   - Implementación: [How to implement]
   - Herramientas: [Tools that help]

2. **[Practice 2]**
   - Descripción: [What to do]
   - Beneficios: [Why this is beneficial]
   - Implementación: [How to implement]
   - Herramientas: [Tools that help]

3. **[Practice 3]**
   - Descripción: [What to do]
   - Beneficios: [Why this is beneficial]
   - Implementación: [How to implement]
   - Herramientas: [Tools that help]

## Errores Comunes

1. **[Common Mistake 1]**
   - Descripción del error: [What people do wrong]
   - Por qué ocurre: [Why this mistake happens]
   - Cómo evitarlo: [Prevention strategy]
   - Solución: [How to fix if it happens]

2. **[Common Mistake 2]**
   - Descripción del error: [What people do wrong]
   - Por qué ocurre: [Why this mistake happens]
   - Cómo evitarlo: [Prevention strategy]
   - Solución: [How to fix if it happens]

3. **[Common Mistake 3]**
   - Descripción del error: [What people do wrong]
   - Por qué ocurre: [Why this mistake happens]
   - Cómo evitarlo: [Prevention strategy]
   - Solución: [How to fix if it happens]

## Métricas de Calidad

1. **[Metric 1]**
   - Qué mide: [What this metric measures]
   - Valor objetivo: [Target value]
   - Cómo medirlo: [How to measure]
   - Cómo mejorarlo: [How to improve]

2. **[Metric 2]**
   - Qué mide: [What this metric measures]
   - Valor objetivo: [Target value]
   - Cómo medirlo: [How to measure]
   - Cómo mejorarlo: [How to improve]`
  },
  {
    id: 'component-spec',
    name: '🧩 Component Specification',
    description: 'Template for documenting component behavior and API',
    content: `# Component Specification: [ComponentName]

## Propósito

[Describe what this component does and why it exists]

## Props/Inputs

1. **[propName1]**
   - Tipo: [Type definition]
   - Requerido: [Yes/No]
   - Default: [Default value]
   - Descripción: [What this prop does]
   - Validación: [Any validation rules]

2. **[propName2]**
   - Tipo: [Type definition]
   - Requerido: [Yes/No]
   - Default: [Default value]
   - Descripción: [What this prop does]
   - Validación: [Any validation rules]

3. **[propName3]**
   - Tipo: [Type definition]
   - Requerido: [Yes/No]
   - Default: [Default value]
   - Descripción: [What this prop does]
   - Validación: [Any validation rules]

## Events/Outputs

1. **[eventName1]**
   - Payload: [Event payload type]
   - Cuándo se emite: [When this event fires]
   - Uso esperado: [How parent should handle]
   - Ejemplo: [Example usage]

2. **[eventName2]**
   - Payload: [Event payload type]
   - Cuándo se emite: [When this event fires]
   - Uso esperado: [How parent should handle]
   - Ejemplo: [Example usage]

## Estados Internos

1. **[stateName1]**
   - Tipo: [State type]
   - Valor inicial: [Initial value]
   - Cuándo cambia: [What triggers changes]
   - Efecto en UI: [How it affects rendering]

2. **[stateName2]**
   - Tipo: [State type]
   - Valor inicial: [Initial value]
   - Cuándo cambia: [What triggers changes]
   - Efecto en UI: [How it affects rendering]

## Métodos Públicos

1. **[methodName1]**
   - Parámetros: [Parameter list]
   - Retorna: [Return type]
   - Descripción: [What this method does]
   - Cuándo usar: [When to call this method]

2. **[methodName2]**
   - Parámetros: [Parameter list]
   - Retorna: [Return type]
   - Descripción: [What this method does]
   - Cuándo usar: [When to call this method]

## Comportamiento

1. **[Behavior 1]**
   - Condición: [When this behavior occurs]
   - Acción: [What happens]
   - Resultado: [Expected outcome]

2. **[Behavior 2]**
   - Condición: [When this behavior occurs]
   - Acción: [What happens]
   - Resultado: [Expected outcome]

## Dependencias

1. **[Dependency 1]**
   - Tipo: [Service/Component/Library]
   - Propósito: [Why it's needed]
   - Versión: [Version requirement]

2. **[Dependency 2]**
   - Tipo: [Service/Component/Library]
   - Propósito: [Why it's needed]
   - Versión: [Version requirement]`
  },
  {
    id: 'api-integration',
    name: '🔌 API Integration',
    description: 'Template for documenting API integration details',
    content: `# API Integration: [API Name]

## Configuración

**Base URL:** [API base URL]
**Autenticación:** [Auth method]
**Headers requeridos:** [Required headers]

## Endpoints

1. **[Endpoint Name 1]**
   - Método: [HTTP method]
   - Path: [Endpoint path]
   - Descripción: [What this endpoint does]
   - Autenticación: [Required/Not required]
   - Rate limit: [Rate limit info]

2. **[Endpoint Name 2]**
   - Método: [HTTP method]
   - Path: [Endpoint path]
   - Descripción: [What this endpoint does]
   - Autenticación: [Required/Not required]
   - Rate limit: [Rate limit info]

## Request/Response Formats

1. **[Endpoint Name 1]**
   - Request body: [Request structure]
   - Query params: [Query parameters]
   - Response success: [Success response structure]
   - Response error: [Error response structure]
   - Status codes: [Possible status codes]

2. **[Endpoint Name 2]**
   - Request body: [Request structure]
   - Query params: [Query parameters]
   - Response success: [Success response structure]
   - Response error: [Error response structure]
   - Status codes: [Possible status codes]

## Error Handling

1. **[Error Type 1]**
   - Código: [Error code]
   - Descripción: [What this error means]
   - Causa común: [Common cause]
   - Solución: [How to handle]
   - Retry: [Should retry? How?]

2. **[Error Type 2]**
   - Código: [Error code]
   - Descripción: [What this error means]
   - Causa común: [Common cause]
   - Solución: [How to handle]
   - Retry: [Should retry? How?]

## Casos de Uso

1. **[Use Case 1]**
   - Escenario: [When to use]
   - Endpoints involucrados: [Which endpoints]
   - Secuencia: [Call sequence]
   - Manejo de errores: [Error handling strategy]

2. **[Use Case 2]**
   - Escenario: [When to use]
   - Endpoints involucrados: [Which endpoints]
   - Secuencia: [Call sequence]
   - Manejo de errores: [Error handling strategy]`
  },
  {
    id: 'testing-strategy',
    name: '🧪 Testing Strategy',
    description: 'Template for documenting testing approach and test cases',
    content: `# Testing Strategy: [Feature/Module Name]

## Objetivo de Testing

[Describe what aspects need to be tested and why]

## Tipos de Tests

1. **Unit Tests**
   - Alcance: [What to test at unit level]
   - Herramientas: [Testing tools/frameworks]
   - Cobertura objetivo: [Target coverage %]
   - Prioridad: [High/Medium/Low]

2. **Integration Tests**
   - Alcance: [What to test at integration level]
   - Herramientas: [Testing tools/frameworks]
   - Cobertura objetivo: [Target coverage %]
   - Prioridad: [High/Medium/Low]

3. **E2E Tests**
   - Alcance: [What to test end-to-end]
   - Herramientas: [Testing tools/frameworks]
   - Cobertura objetivo: [Target coverage %]
   - Prioridad: [High/Medium/Low]

## Casos de Prueba

1. **[Test Case 1]**
   - Descripción: [What is being tested]
   - Precondiciones: [Setup required]
   - Pasos: [Test steps]
   - Resultado esperado: [Expected outcome]
   - Datos de prueba: [Test data needed]

2. **[Test Case 2]**
   - Descripción: [What is being tested]
   - Precondiciones: [Setup required]
   - Pasos: [Test steps]
   - Resultado esperado: [Expected outcome]
   - Datos de prueba: [Test data needed]

3. **[Test Case 3]**
   - Descripción: [What is being tested]
   - Precondiciones: [Setup required]
   - Pasos: [Test steps]
   - Resultado esperado: [Expected outcome]
   - Datos de prueba: [Test data needed]

## Edge Cases

1. **[Edge Case 1]**
   - Escenario: [Unusual scenario]
   - Comportamiento esperado: [How system should behave]
   - Validación: [How to verify]

2. **[Edge Case 2]**
   - Escenario: [Unusual scenario]
   - Comportamiento esperado: [How system should behave]
   - Validación: [How to verify]

## Mocking Strategy

1. **[Mock 1]**
   - Qué se mockea: [What to mock]
   - Por qué: [Reason for mocking]
   - Implementación: [How to implement mock]

2. **[Mock 2]**
   - Qué se mockea: [What to mock]
   - Por qué: [Reason for mocking]
   - Implementación: [How to implement mock]`
  },
  {
    id: 'code-documentation',
    name: '💻 Code Documentation',
    description: 'Template for documenting code with examples and references',
    content: `# Code Documentation: [Module/Feature Name]

## Overview

[Brief description of what this code does and its purpose]

## File Structure

1. **[File Path 1]**
   - Purpose: [What this file does]
   - Exports: [Main exports]
   - Dependencies: [Key dependencies]

2. **[File Path 2]**
   - Purpose: [What this file does]
   - Exports: [Main exports]
   - Dependencies: [Key dependencies]

## Code Examples

### Example 1: [Use Case Name]

**Context:** [When to use this]

\`\`\`typescript
// Short example code here (< 10 lines)
export const example = () => {
  return "Hello World";
};
\`\`\`

**Explanation:** [What this code does]

### Example 2: [Use Case Name]

**Context:** [When to use this]

**File Reference:** \`src/path/to/file.ts\` (lines 15-45)

**Summary:** [Brief description of what the code does]

## Key Functions/Components

1. **[Function/Component Name]**
   - Purpose: [What it does]
   - Parameters: [Input parameters]
   - Returns: [Return value]
   - Example: [Usage example]

2. **[Function/Component Name]**
   - Purpose: [What it does]
   - Parameters: [Input parameters]
   - Returns: [Return value]
   - Example: [Usage example]

## Patterns Used

1. **[Pattern Name]**
   - Description: [What pattern is used]
   - Why: [Reason for using it]
   - Example: [Code example or reference]

2. **[Pattern Name]**
   - Description: [What pattern is used]
   - Why: [Reason for using it]
   - Example: [Code example or reference]

## External References

1. **[Library/Framework Name]**
   - Documentation: [URL]
   - Version: [Version used]
   - Usage: [How it's used in this code]

2. **[Library/Framework Name]**
   - Documentation: [URL]
   - Version: [Version used]
   - Usage: [How it's used in this code]`
  }
];

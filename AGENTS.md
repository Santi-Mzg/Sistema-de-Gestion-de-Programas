# Reglas de trabajo para Sílabus

Sílabus es un sistema institucional de gestión de programas de asignaturas.
Priorizar la preservación del comportamiento, la trazabilidad y la verificación.

## Comunicación y autorización

- Responder en español.
- No interpretar consultas o propuestas como autorización para implementarlas.
- Pedir autorización antes de ejecutar comandos o crear, modificar o eliminar
  archivos, incluidos código, pruebas, configuración, documentación y artefactos.
- Presentar grupos concretos de comandos o cambios, con propósito, alcance,
  efectos esperados y forma de verificación.
- Cada aprobación vale únicamente para el alcance presentado.
- Si se necesita ampliar el alcance, detener las acciones dependientes y consultar.
- La lectura directa autorizada no habilita comandos ni modificaciones.

## Acciones que requieren autorización específica

- Commits, push, despliegues y migraciones.
- Acciones sobre servicios externos.
- Instalación de dependencias o actualización de versiones.
- Antes de proponer dependencias, explicar necesidad, alternativas y riesgos.
- Antes de iniciar aplicaciones o pruebas, identificar posibles migraciones,
  seeders, escrituras y llamadas a servicios externos.

## Preservación del proyecto

- Preservar los cambios existentes del usuario.
- No sobrescribir, revertir ni limpiar cambios ajenos.
- No cambiar reglas de negocio, permisos, contratos de API ni comportamiento
  observable bajo la etiqueta de refactorización.
- Presentar cualquier cambio funcional de forma explícita y obtener aprobación.
- Mantener los cambios pequeños, justificados y revisables.

## Secretos y datos

- No leer ni mostrar valores de secretos o credenciales.
- No abrir archivos que puedan contenerlos para luego redactar su contenido.
- Solicitar versiones de ejemplo sin secretos cuando se necesite configuración.
- No utilizar datos institucionales reales en pruebas sin autorización específica.

## Diagnóstico y evidencia

- Diferenciar hechos comprobados, hipótesis y aspectos pendientes de verificar.
- Respaldar hallazgos con archivos, símbolos y líneas cuando corresponda.
- Declarar el alcance inspeccionado y sus límites.
- No afirmar que algo funciona o es seguro solo porque compiló o pasó un escáner.
- No afirmar que una prueba pasó si no se ejecutó y se observó su resultado.

## Cambios y verificación

- Explicar el problema, la decisión y el código que se propone modificar.
- Acordar criterios de aceptación antes de implementar.
- Proponer pruebas proporcionales: frontend, backend, integración y flujos completos.
- Para refactorizaciones, caracterizar primero el comportamiento relevante.
- Ejecutar únicamente las verificaciones autorizadas.
- Informar cambios realizados, resultados, limitaciones y riesgos pendientes.

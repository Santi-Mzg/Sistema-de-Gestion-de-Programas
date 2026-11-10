# Plan de commits de develop — 10 de noviembre de 2026

Este documento organiza el árbol local observado; no ejecuta commits, staging, push, migraciones ni despliegues. Los IDs C01–C14 de este archivo son la referencia para futuras instrucciones. Sustituyen, para esta preparación, la secuencia candidata de las secciones 21 y 24 de [Registro de cambios](Registro-cambios-implementados-2026-11-04.md), que refleja una fotografía anterior.

## Fotografía revisada

- Rama: `develop`.
- HEAD: `ae122f79bd2304fc8cbe52d935939f732a734eff` (`fix: programa vigente loaded with all original data`).
- Inventario inicial: 292 rutas locales pendientes. Inventario final, antes de añadir este plan: 291 rutas, de las cuales 186 rastreadas (160 modificadas y 26 eliminadas) y 105 nuevas sin seguimiento.
- Durante la revisión, `Frontend/CLAUDE.md` dejó de figurar entre las rutas pendientes. No se restauró ni se incluye en el inventario final.
- Staging inicialmente vacío. No se modificó el índice ni se usaron add/reset/checkout/stash.
- 26 rutas participan en más de un commit. Se detallan sus cortes por símbolos, no solo por número de línea.
- La única escritura de esta tarea es este plan, que se suma al inventario como documento nuevo de C14.
- El inventario comprende todos los paths del status, los diffs de las rutas rastreadas, los cambios del contrato generado, diferencias de versiones del lockfile y clasificación de archivos nuevos por contenido/estructura y dependencias. No es una auditoría funcional o de seguridad de cada línea.
- No se abrió el contenido de `Backend/src/main/resources/application-dev-local.properties` ni de `docs/config/pruebas.env.example`; solo se identificaron sus rutas, tamaños y consumidores. Su inclusión en C05 queda condicionada a confirmar contenido publicable sin credenciales reales.
- En esta tarea no se ejecutaron pruebas, instalaciones, builds, aplicaciones ni verificadores SQL. Las 198 pruebas frontend y TypeScript/lint aprobados en tareas anteriores corresponden al árbol conjunto de aquel momento, no a estos commits parciales.

## Orden y mensajes

| ID | Mensaje exacto propuesto | Rutas del inventario que toca |
|---|---|---:|
| C01 | `refactor(schemas): agrupar validaciones activas por dominio` | 4 |
| C02 | `build(frontend): actualizar lockfile e incorporar herramientas de lint` | 2 |
| C03 | `test(backend): aislar contexto y excluir lanzadores locales en CI` | 5 |
| C04 | `feat(programas): implementar circuito por etapas y revisiones por ronda` | 73 |
| C05 | `chore(dev): preparar entorno local y fixtures optativos sin integraciones externas` | 19 |
| C06 | `fix(ui): unificar controles y corregir asociaciones de etiquetas` | 32 |
| C07 | `feat(frontend): integrar circuito y contrato compartido de programas` | 147 |
| C08 | `refactor(cache): centralizar invalidaciones de operaciones CRUD` | 17 |
| C09 | `fix(frontend): estabilizar hooks y corregir errores de lint restantes` | 15 |
| C10 | `ci: verificar builds, tipos, lint y pruebas antes de integrar` | 9 |
| C11 | `feat(pdf): ajustar bloque de firmas departamentales` | 1 |
| C12 | `test(db): incorporar adaptación heredada y verificador descartable` | 5 |
| C13 | `chore(db): preparar reinicio controlado del circuito de prueba en Aiven` | 1 |
| C14 | `docs: consolidar implementación y reglas de trabajo del repositorio` | 5 |

Las cantidades se superponen cuando hay fragmentos compartidos; no se deben sumar como archivos únicos. C14 agrega además este plan.

C01/C02/C03 preparan piezas independientes. C04 agrupa las dependencias cruzadas del backend. C05 aporta operación local y C06 los controles compartidos. C07 integra el contrato y su frontend en una unidad consistente. C08/C09 separan la centralización CRUD y las correcciones independientes restantes. C10 habilita los gates después de esos cambios. C11–C13 son artefactos de finalidad específica y C14 consolida la documentación.

C07 es deliberadamente más amplio: 53 de sus rutas son cliente/modelos generados. No separar la eliminación de enums duplicados de la adaptación de sus consumidores ni eliminar Profesor sin incorporar su reemplazo Docente y sus imports/rutas. Las reglas de nombres del estado, contenido mínimo y responsabilidades nuevas deben permanecer coordinadas.

Este es un orden de versionado y revisión, no un orden de despliegue o de ejecución SQL. C04/C07/esquema conforman una entrega coordinada; no se recomienda desplegar automáticamente cada punto intermedio. No se comprobó en esta tarea la configuración de despliegue remoto.

## Criterios para preparar cada commit cuando se autorice

1. Confirmar rama/HEAD/status y comprobar que no aparecieron cambios desde esta fotografía.
2. Usar rutas explícitas y preparación por fragmentos en los archivos compartidos; nunca `git add .` para este árbol.
3. Revisar el diff preparado, incluyendo imports, dependencias, borrados y reemplazos. Un archivo nuevo también puede aportar versiones parciales acumulativas, como `invalidacion-consultas.ts`.
4. No modificar, ocultar ni revertir el resto del trabajo para simplificar la selección. Si hace falta un árbol temporal para validar el índice, acordar ese mecanismo cuando se autorice ejecutar el grupo.
5. Verificar el contenido exacto del commit candidato. Pasar pruebas sobre el working tree completo no demuestra que el índice parcial compile.
6. No inventar pasos intermedios incompatibles para producir más commits. Si un corte concreto no permite mantener la coherencia, documentarlo y reunir las partes dependientes antes de commitear.
7. Hacer solamente el commit o grupo que se pida. Un permiso para commit no implica push, ejecutar SQL, arrancar servicios ni desplegar.
8. No regenerar Orval, reinstalar dependencias ni ampliar el alcance por la sola preparación del commit; los artefactos finales ya están en el árbol.

Verificación candidata proporcional: TypeScript (`node node_modules/typescript/bin/tsc --noEmit --incremental false` antes de incorporar el script de C10), suites frontend pertinentes y ESLint; Maven `-o -Pci clean verify` cuando exista C03. La ejecución de pruebas/builds y sus escrituras debe respetar las autorizaciones vigentes. Build frontend permanece fuera del alcance autorizado de verificación local de la conversación; se puede revisar su configuración de CI sin ejecutarlo.

## Alcance e inventario por commit

Leyenda: M = modificado; D = eliminado; N = nuevo/sin seguimiento. “Parcial” significa preparar solo los fragmentos del grupo; los demás quedan en el working tree. La lista contiene las 291 rutas pendientes finales; este plan figura aparte en C14.

### C01 — refactor(schemas): agrupar validaciones activas por dominio

**Dependencias:** Ninguna.

**Contenido:** Mover loginSchema/LoginFormData a lib/schemas/auth.ts; retirar schemas.ts con sus definiciones sin consumidores y quitar solo el tipo ProgramaCarreraFormData del esquema de programas. En login/page.tsx entra únicamente el cambio de importación.

**Aceptación y límites:** Conservar exactamente las reglas y mensajes de login, incluido el mínimo actual; no aprovechar el movimiento para alterar validaciones. TypeScript sobre el contenido aislado del commit.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Frontend/app/(auth)/login/page.tsx` | Parcial; comparte C06, C09 |
| D | `Frontend/lib/schemas.ts` | Completo |
| M | `Frontend/lib/schemas/programa.ts` | Parcial; comparte C07 |
| N | `Frontend/lib/schemas/auth.ts` | Completo |

### C02 — build(frontend): actualizar lockfile e incorporar herramientas de lint

**Dependencias:** Ninguna dependencia funcional; ejecutar después de C01 por orden operativo.

**Contenido:** package-lock.json completo y únicamente las dos devDependencies nuevas de package.json: eslint 9.39.5 y eslint-config-next 16.4.5. Los scripts typecheck/lint:ci quedan para C10.

**Aceptación y límites:** El lockfile también cambia Next 16.3.0 → 16.4.5, Sharp 0.35.3 → 0.35.5 y transitivas de producción. Hay 179 rutas de paquetes agregadas, 6 retiradas y 62 con cambio de versión. No describir este commit como si fueran solamente dependencias de desarrollo. No instalar ni regenerar el lockfile para preparar el corte.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Frontend/package-lock.json` | Completo |
| M | `Frontend/package.json` | Parcial; comparte C10 |

### C03 — test(backend): aislar contexto y excluir lanzadores locales en CI

**Dependencias:** Independiente del circuito nuevo.

**Contenido:** Perfil Maven ci, application-ci.properties, base IsolatedApplicationTest y adaptación de las pruebas de contexto y AuthController.

**Aceptación y límites:** La configuración usa H2 en memoria y mocks de seeder/correo/IA. La comprobación candidata es mvnw -o -Pci clean verify sobre este commit; no ejecutar pruebas contra la configuración habitual ni lanzadores local/. Validación todavía no ejecutada en esta tarea.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Backend/pom.xml` | Completo |
| M | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/SistemaDeGestionDeProgramasApplicationTests.java` | Completo |
| M | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/controller/AuthControllerTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/support/IsolatedApplicationTest.java` | Completo |
| N | `Backend/src/test/resources/application-ci.properties` | Completo |

### C04 — feat(programas): implementar circuito por etapas y revisiones por ronda

**Dependencias:** C03 para la verificación aislada.

**Contenido:** Backend del circuito completo: Secretaría inicial, Área opcional, decisiones de CCC por ronda, devoluciones, drafts por contexto, contenido mínimo único, terminología Docente y nombres de estados, consultas/estadísticas/asignaciones, permisos por contexto, notificaciones y errores. Incluir OpenAPI con Rol/EstadoPrograma compartidos, pruebas relacionadas, documentación de nomenclatura y SQL de renombrado. En la plantilla PDF entran solo los renombres de propiedad y etiqueta necesarios para docenteResponsable.

**Aceptación y límites:** Mantener juntos entidades, repositorios, contexto, workflow, servicios, controladores, DTO y mappers por sus dependencias mutuas. Es funcional, no una refactorización neutra. Cuatro archivos de tests antiguos solo cambian comentarios/código comentado; no representan pruebas habilitadas. No ejecutar el SQL ni desplegar contra un esquema sin adaptar. Existe un pendiente estático del PDF descrito en C11 (pc.contenidosMinimos retirado del modelo); por eso este plan no acredita una entrega funcional completa del PDF.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/controller/AreaController.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/controller/CarreraController.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/controller/MateriaController.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/controller/ProgramaController.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/area/AreaResponseDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/DashboardResumenDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/EstadoHistoricoResponseDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/EstadoUpdateDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/ProgramaCargaDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/ProgramaCarreraCreateDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/ProgramaCarreraResponseDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/ProgramaResponseDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/ProgramaResponseReducedDTO.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/entities/AreaEntity.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/entities/DecisionComisionEntity.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/entities/EstadoHistoricoEntity.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/entities/ProgramaCarreraEntity.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/entities/ProgramaDraftEntity.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/entities/ProgramaEntity.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/entities/UsuarioDepartamentoEntity.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/enums/EstadoPrograma.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/enums/Rol.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/utils/ProgramaSpecifications.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/mappers/extensions/AreaMapper.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/mappers/extensions/ProgramaCargaMapper.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/mappers/extensions/ProgramaCarreraMapper.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/mappers/extensions/ProgramaResponseMapper.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/mappers/extensions/ProgramaResponseReducedMapper.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/repositories/AreaRepository.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/repositories/CarreraRepository.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/repositories/DecisionComisionRepository.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/repositories/MateriaRepository.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/repositories/ProgramaDraftRepository.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/repositories/ProgramaRepository.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/security/SecurityConfig.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/AreaService.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/CarreraService.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/MateriaService.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/ProgramaService.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/email/EmailService.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/impl/AreaServiceImpl.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/impl/CarreraServiceImpl.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/impl/MateriaServiceImpl.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/impl/ProgramaServiceImpl.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/util/exception/GlobalExceptionHandler.java` | Completo |
| M | `Backend/src/main/resources/templates/pdf/programa.html` | Parcial; comparte C11 |
| M | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/controller/ProgramaControllerIntegrationTest.java` | Completo |
| M | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/controller/ProgramaControllerTest.java` | Completo |
| M | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/repositories/ProgramaRepositoryTest.java` | Completo |
| M | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/impl/ProgramaServiceImplTest.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/converters/EstadoProgramaConverter.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/enums/ResultadoDecisionComision.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/utils/CircuitoPrograma.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/security/ContextoPrograma.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/security/ProgramaContextInterceptor.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/security/ProgramaWebConfig.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/ProgramaBorradorService.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/ProgramaWorkflowService.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/util/exception/ConflictoProgramaException.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/util/exception/ValidacionProgramaException.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/controller/ProgramaErroresTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/CircuitoProgramaTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/TerminologiaDocenteTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/security/ContextoProgramaTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/security/ProgramaWebConfigTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/AreaCoordinacionServiceTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/CarrerasAsignadasIntegrationTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/DashboardPendientesIntegrationTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/MateriasSinProgramaIntegrationTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/ProgramaCircuitoIntegrationTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/email/EmailServiceTest.java` | Completo |
| N | `docs/Nomenclatura-estados-programa.md` | Completo |
| N | `docs/sql/renombrar_estados_programa.sql` | Completo |

### C05 — chore(dev): preparar entorno local y fixtures optativos sin integraciones externas

**Dependencias:** C03 y C04: la configuración local usa ValidacionProgramaException y los fixtures usan el dominio nuevo.

**Contenido:** Compose local, configuraciones/lanzadores, proveedores por perfil, carga sintética optativa, cookie de login diferenciada solo en desarrollo explícito, prueba de cookie y de proveedores, guías locales y puerto por defecto de Orval.

**Aceptación y límites:** Antes de preparar application-dev-local.properties y pruebas.env.example, confirmar que contienen exclusivamente configuración local publicable. No se abrió su contenido en esta revisión. Versionar un lanzador no autoriza a arrancarlo: los fixtures escriben en PostgreSQL local; el verificador SQL usa contenedores descartables. La modificación de cookie tiene una condición explícita NODE_ENV + SILABUS_DEV_LOCAL, y no habilita un cambio global de cookie.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/ai/formatterAPA/providers/GeminiBibliografiaFormatterService.java` | Completo |
| M | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/services/email/providers/ResendEmailSender.java` | Completo |
| M | `Frontend/app/api/auth/login/route.ts` | Completo |
| M | `Frontend/orval.config.ts` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/config/DevLocalConfig.java` | Completo |
| N | `Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/config/DevLocalIntegracionesConfig.java` | Completo |
| N | `Backend/src/main/resources/application-dev-local.properties` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/config/DevLocalIntegracionesConfigTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/local/LocalDatabaseSeedTest.java` | Completo |
| N | `Backend/src/test/java/com/santimaszong/Sistema_de_Gestion_de_Programas/local/LocalManualFixtureTest.java` | Completo |
| N | `Backend/src/test/resources/application-isolated.properties` | Completo |
| N | `Frontend/__tests__/api/login-route.test.ts` | Completo |
| N | `compose.pruebas.yml` | Completo |
| N | `dev-backend.ps1` | Completo |
| N | `dev-datos-prueba.ps1` | Completo |
| N | `dev-frontend.ps1` | Completo |
| N | `docs/Base-local-pruebas.md` | Completo |
| N | `docs/Datos-prueba-local-DCIC.md` | Completo |
| N | `docs/config/pruebas.env.example` | Completo |

### C06 — fix(ui): unificar controles y corregir asociaciones de etiquetas

**Dependencias:** C02 para lint con dependencias reproducibles; cambios de UI independientes del nuevo contrato.

**Contenido:** Estilos comunes, Input/Select/Textarea, etiqueta con ayuda accesible y su prueba. Incorporar capitalización y ajustes responsive de pantallas/formularios CRUD existentes y autenticación, sin cambios de API, roles ni invalidación.

**Aceptación y límites:** Verificar controles de consulta, asociación label/control y estilos compartidos. Los textos/estilos específicos de los formularios del circuito se mantienen con C07 para evitar recortar cada línea de archivos reescritos. No incluir cambios funcionales de permisos con este mensaje.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Frontend/app/(auth)/forgot-password/page.tsx` | Completo |
| M | `Frontend/app/(auth)/login/page.tsx` | Parcial; comparte C01, C09 |
| M | `Frontend/app/(auth)/set-password/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/areas/[id]/page.tsx` | Parcial; comparte C07, C08, C09 |
| M | `Frontend/app/(dashboard)/carreras/[id]/page.tsx` | Parcial; comparte C08, C09 |
| M | `Frontend/app/(dashboard)/departamentos/[id]/page.tsx` | Parcial; comparte C08, C09 |
| M | `Frontend/app/(dashboard)/materias/[id]/page.tsx` | Parcial; comparte C08, C09 |
| M | `Frontend/app/(dashboard)/mi-perfil/page.tsx` | Parcial; comparte C09 |
| M | `Frontend/app/(dashboard)/usuarios/[id]/page.tsx` | Parcial; comparte C08, C09 |
| M | `Frontend/components/forms/area-form.tsx` | Parcial; comparte C08 |
| M | `Frontend/components/forms/carrera-form.tsx` | Parcial; comparte C08 |
| M | `Frontend/components/forms/departamento-form.tsx` | Parcial; comparte C08 |
| M | `Frontend/components/forms/materia-form.tsx` | Parcial; comparte C08 |
| M | `Frontend/components/forms/usuario-form.tsx` | Parcial; comparte C07, C08 |
| M | `Frontend/components/modals/about-dialog.tsx` | Completo |
| M | `Frontend/components/modals/cargar-programa-dialog.tsx` | Parcial; comparte C07 |
| M | `Frontend/components/modals/departamento-selector-dialog.tsx` | Completo |
| M | `Frontend/components/modals/programa-anio-existente-dialog.tsx` | Parcial; comparte C07 |
| M | `Frontend/components/modals/role-selector-dialog copy.tsx` | Parcial; comparte C07 |
| M | `Frontend/components/nav/sidebar.tsx` | Parcial; comparte C07, C09 |
| M | `Frontend/components/pages/areas-list.tsx` | Parcial; comparte C07, C08, C09 |
| M | `Frontend/components/pages/carreras-list.tsx` | Parcial; comparte C07, C08, C09 |
| M | `Frontend/components/pages/departamentos-list.tsx` | Parcial; comparte C07, C08, C09 |
| M | `Frontend/components/pages/materias-list.tsx` | Parcial; comparte C07, C08, C09 |
| M | `Frontend/components/pages/usuarios-list.tsx` | Parcial; comparte C07, C08 |
| M | `Frontend/components/ui/input.tsx` | Completo |
| M | `Frontend/components/ui/label-with-tooltip.tsx` | Completo |
| M | `Frontend/components/ui/select.tsx` | Completo |
| M | `Frontend/components/ui/textarea.tsx` | Completo |
| M | `Frontend/context/header-context.tsx` | Completo |
| N | `Frontend/__tests__/components/label-with-tooltip.test.tsx` | Completo |
| N | `Frontend/lib/form-field-styles.ts` | Completo |

### C07 — feat(frontend): integrar circuito y contrato compartido de programas

**Dependencias:** C01, C04 y C06; C05 aporta la configuración local, no un requisito de compilación del frontend.

**Contenido:** Cliente Orval final completo y todos los consumidores de Rol/EstadoPrograma/docenteResponsable; formularios/rutas por actor, borradores y rechazo con cambios, dashboards/estadísticas, asignaciones, materias sin programa/preselección, historial, acciones y borrado confirmado. Contextos de rol/departamento y preferencia persistida, cabeceras HTTP y corrección del tipo ResetPasswordRequest. Incluir helpers y pruebas de esas funcionalidades.

**Aceptación y límites:** El contrato generado tiene 53 rutas locales afectadas y no debe separarse de sus consumidores. Los formularios nuevos y reescritos entran con sus correcciones de lint ya integradas; C09 agrupa únicamente las correcciones independientes restantes. En invalidacion-consultas.ts incluir primero invalidarConsultasPrograma, invalidarAsignacionesDepartamento e invalidarCoordinacionArea, con sus imports. Los helpers CRUD y consumidores restantes se reservan para C08. El bloque es amplio porque partirlo en “solo generado”, “solo enums” y “solo formularios” dejaría importaciones o propiedades incompatibles.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Frontend/app/(dashboard)/areas/[id]/page.tsx` | Parcial; comparte C06, C08, C09 |
| M | `Frontend/app/(dashboard)/areas/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/carreras/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/materias/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/programas/[id]/carga/administracion/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/programas/[id]/carga/docente/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/programas/[id]/historial-estados/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/programas/[id]/revision/comision/[carreraId]/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/programas/[id]/revision/secretaria/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/programas/crear/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/programas/page.tsx` | Completo |
| M | `Frontend/app/(dashboard)/usuarios/page.tsx` | Completo |
| M | `Frontend/app/api/custom-instance.ts` | Parcial; comparte C09 |
| M | `Frontend/app/api/generated/client.ts` | Completo |
| M | `Frontend/app/api/generated/model/actualizarEstadoParams.ts` | Completo |
| D | `Frontend/app/api/generated/model/actualizarEstadoRolActivo.ts` | Completo |
| M | `Frontend/app/api/generated/model/areaResponseDTO.ts` | Completo |
| D | `Frontend/app/api/generated/model/dashboardProgramaResumenDTO.ts` | Completo |
| M | `Frontend/app/api/generated/model/dashboardResumenDTO.ts` | Completo |
| M | `Frontend/app/api/generated/model/deleteDraftParams.ts` | Completo |
| D | `Frontend/app/api/generated/model/deleteDraftRolActivo.ts` | Completo |
| M | `Frontend/app/api/generated/model/estadoHistoricoResponseDTO.ts` | Completo |
| D | `Frontend/app/api/generated/model/estadoHistoricoResponseDTOActorRol.ts` | Completo |
| D | `Frontend/app/api/generated/model/estadoHistoricoResponseDTOEstado.ts` | Completo |
| M | `Frontend/app/api/generated/model/estadoUpdateDTO.ts` | Completo |
| D | `Frontend/app/api/generated/model/estadoUpdateDTODestinoRechazo.ts` | Completo |
| D | `Frontend/app/api/generated/model/formatearAPA200.ts` | Completo |
| D | `Frontend/app/api/generated/model/formatearAPABody.ts` | Completo |
| M | `Frontend/app/api/generated/model/getDashboardResumenParams.ts` | Completo |
| D | `Frontend/app/api/generated/model/getDashboardResumenRolActivo.ts` | Completo |
| M | `Frontend/app/api/generated/model/getDraftParams.ts` | Completo |
| D | `Frontend/app/api/generated/model/getDraftRolActivo.ts` | Completo |
| M | `Frontend/app/api/generated/model/index.ts` | Completo |
| D | `Frontend/app/api/generated/model/listProgramasCoordinacionEstado.ts` | Completo |
| M | `Frontend/app/api/generated/model/listProgramasCoordinacionParams.ts` | Completo |
| D | `Frontend/app/api/generated/model/listProgramasCoordinacionRolActivo.ts` | Completo |
| D | `Frontend/app/api/generated/model/listProgramasEstado.ts` | Completo |
| M | `Frontend/app/api/generated/model/listProgramasParams.ts` | Completo |
| M | `Frontend/app/api/generated/model/listProgramasPendientesCoordinadorParams.ts` | Completo |
| D | `Frontend/app/api/generated/model/listProgramasPendientesCoordinadorRolActivo.ts` | Completo |
| M | `Frontend/app/api/generated/model/listProgramasPendientesParams.ts` | Completo |
| D | `Frontend/app/api/generated/model/listProgramasPendientesRolActivo.ts` | Completo |
| D | `Frontend/app/api/generated/model/listProgramasRolActivo.ts` | Completo |
| D | `Frontend/app/api/generated/model/materiaReducedResponseDTO.ts` | Completo |
| M | `Frontend/app/api/generated/model/pageableObject.ts` | Completo |
| M | `Frontend/app/api/generated/model/programaCargaDTO.ts` | Completo |
| M | `Frontend/app/api/generated/model/programaCarreraCreateDTO.ts` | Completo |
| M | `Frontend/app/api/generated/model/programaCarreraResponseDTO.ts` | Completo |
| M | `Frontend/app/api/generated/model/programaResponseDTO.ts` | Completo |
| D | `Frontend/app/api/generated/model/programaResponseDTOEstado.ts` | Completo |
| M | `Frontend/app/api/generated/model/programaResponseReducedDTO.ts` | Completo |
| D | `Frontend/app/api/generated/model/programaResponseReducedDTOEstado.ts` | Completo |
| M | `Frontend/app/api/generated/model/saveDraftParams.ts` | Completo |
| D | `Frontend/app/api/generated/model/saveDraftRolActivo.ts` | Completo |
| D | `Frontend/app/api/generated/model/setPasswordRequest.ts` | Completo |
| M | `Frontend/app/api/generated/model/userCreateDTO.ts` | Completo |
| D | `Frontend/app/api/generated/model/userCreateDTORolesItem.ts` | Completo |
| M | `Frontend/app/api/generated/model/usuarioDepartamentoDTO.ts` | Completo |
| D | `Frontend/app/api/generated/model/usuarioDepartamentoDTORolesItem.ts` | Completo |
| M | `Frontend/components/dashboards/administracion-dashboard.tsx` | Completo |
| M | `Frontend/components/dashboards/coordinador-dashboard.tsx` | Completo |
| M | `Frontend/components/dashboards/dir-admin-dashboard.tsx` | Completo |
| D | `Frontend/components/dashboards/profesor-dashboard.tsx` | Completo |
| M | `Frontend/components/dashboards/secretario-dashboard.tsx` | Completo |
| M | `Frontend/components/forms/programa-administracion-form.tsx` | Completo |
| M | `Frontend/components/forms/programa-carrera-block-field-coord.tsx` | Completo |
| M | `Frontend/components/forms/programa-carrera-block-field.tsx` | Completo |
| M | `Frontend/components/forms/programa-carrera-block-view.tsx` | Completo |
| M | `Frontend/components/forms/programa-coordinador-form.tsx` | Completo |
| M | `Frontend/components/forms/programa-creation-form.tsx` | Completo |
| D | `Frontend/components/forms/programa-profesor-form.tsx` | Completo |
| M | `Frontend/components/forms/programa-secretaria-form.tsx` | Completo |
| M | `Frontend/components/forms/usuario-form.tsx` | Parcial; comparte C06, C08 |
| M | `Frontend/components/modals/cargar-programa-dialog.tsx` | Parcial; comparte C06 |
| M | `Frontend/components/modals/programa-anio-existente-dialog.tsx` | Parcial; comparte C06 |
| M | `Frontend/components/modals/rechazo-dialog.tsx` | Completo |
| M | `Frontend/components/modals/role-selector-dialog copy.tsx` | Parcial; comparte C06 |
| M | `Frontend/components/nav/sidebar.tsx` | Parcial; comparte C06, C09 |
| M | `Frontend/components/pages/areas-list.tsx` | Parcial; comparte C06, C08, C09 |
| M | `Frontend/components/pages/carreras-list.tsx` | Parcial; comparte C06, C08, C09 |
| M | `Frontend/components/pages/departamentos-list.tsx` | Parcial; comparte C06, C08, C09 |
| M | `Frontend/components/pages/historial-estados-flow.tsx` | Completo |
| M | `Frontend/components/pages/materias-list-reduced.tsx` | Completo |
| M | `Frontend/components/pages/materias-list.tsx` | Parcial; comparte C06, C08, C09 |
| M | `Frontend/components/pages/programa-view.tsx` | Completo |
| M | `Frontend/components/pages/programas-list-coordinador.tsx` | Completo |
| M | `Frontend/components/pages/programas-list-reduced-coordinador.tsx` | Completo |
| M | `Frontend/components/pages/programas-list-reduced.tsx` | Completo |
| M | `Frontend/components/pages/programas-list.tsx` | Completo |
| M | `Frontend/components/pages/usuarios-list.tsx` | Parcial; comparte C06, C08 |
| M | `Frontend/components/ui/cardsStatsAdmin.tsx` | Completo |
| M | `Frontend/components/ui/cardsStatsCoord.tsx` | Completo |
| M | `Frontend/components/ui/cardsStatsDirAdmin.tsx` | Completo |
| M | `Frontend/components/ui/cardsStatsDocente.tsx` | Completo |
| M | `Frontend/components/ui/cardsStatsSecretaria.tsx` | Completo |
| M | `Frontend/components/ui/rejection-info-card.tsx` | Completo |
| M | `Frontend/context/dept-context.tsx` | Completo |
| M | `Frontend/context/role-context.tsx` | Completo |
| M | `Frontend/hooks/use-set-password.ts` | Completo |
| M | `Frontend/lib/schemas/programa.ts` | Parcial; comparte C01 |
| M | `Frontend/lib/schemas/user.ts` | Completo |
| M | `Frontend/lib/utils.ts` | Completo |
| N | `Frontend/__tests__/components/area-coordinador-orval.test.tsx` | Completo |
| N | `Frontend/__tests__/components/cambios-carga-programa.test.ts` | Completo |
| N | `Frontend/__tests__/components/contexto-navegacion.test.tsx` | Completo |
| N | `Frontend/__tests__/components/crear-programa-parametro.test.tsx` | Completo |
| N | `Frontend/__tests__/components/dashboard-area.test.tsx` | Completo |
| N | `Frontend/__tests__/components/dashboard-ccc-carreras.test.tsx` | Completo |
| N | `Frontend/__tests__/components/dashboard-ccc-paginacion.test.tsx` | Completo |
| N | `Frontend/__tests__/components/historial-estados.test.tsx` | Completo |
| N | `Frontend/__tests__/components/indicador-materias-sin-programa.test.tsx` | Completo |
| N | `Frontend/__tests__/components/materias-sin-programa.test.tsx` | Completo |
| N | `Frontend/__tests__/components/mis-carreras.test.tsx` | Completo |
| N | `Frontend/__tests__/components/paneles-pendientes.test.tsx` | Completo |
| N | `Frontend/__tests__/components/programa-acciones.test.tsx` | Completo |
| N | `Frontend/__tests__/components/programa-consulta.test.ts` | Completo |
| N | `Frontend/__tests__/components/programa-formularios.test.tsx` | Completo |
| N | `Frontend/__tests__/components/programa-revision-cache.test.tsx` | Completo |
| N | `Frontend/__tests__/components/programas-list-eliminacion.test.tsx` | Completo |
| N | `Frontend/__tests__/components/rechazo-con-cambios.test.tsx` | Completo |
| N | `Frontend/__tests__/components/stats-secretaria-etapas.test.tsx` | Completo |
| N | `Frontend/app/(dashboard)/programas/[id]/carga/secretaria/page.tsx` | Completo |
| N | `Frontend/app/(dashboard)/programas/[id]/revision/area/page.tsx` | Completo |
| N | `Frontend/app/api/generated/model/asignacionCoordinador.ts` | Completo |
| N | `Frontend/app/api/generated/model/asignarCoordinadorParams.ts` | Completo |
| N | `Frontend/app/api/generated/model/candidatosParams.ts` | Completo |
| N | `Frontend/app/api/generated/model/estadoPrograma.ts` | Completo |
| N | `Frontend/app/api/generated/model/listCarrerasAsignadasParams.ts` | Completo |
| N | `Frontend/app/api/generated/model/listMateriasSinProgramaParams.ts` | Completo |
| N | `Frontend/app/api/generated/model/rol.ts` | Completo |
| N | `Frontend/components/dashboards/coordinador-area-dashboard.tsx` | Completo |
| N | `Frontend/components/dashboards/docente-dashboard.tsx` | Completo |
| N | `Frontend/components/forms/materia-programa-selector.tsx` | Completo |
| N | `Frontend/components/forms/programa-docente-form.tsx` | Completo |
| N | `Frontend/components/forms/programa-secretaria-inicial-form.tsx` | Completo |
| N | `Frontend/components/modals/rechazo-con-cambios-dialog.tsx` | Completo |
| N | `Frontend/components/pages/materias-sin-programa-card.tsx` | Completo |
| N | `Frontend/components/pages/programa-acciones.tsx` | Completo |
| N | `Frontend/components/ui/cardsStatsCoordArea.tsx` | Completo |
| N | `Frontend/components/ui/materias-sin-programa-indicador.tsx` | Completo |
| N | `Frontend/hooks/use-stored-preference.ts` | Completo |
| N | `Frontend/lib/cambios-carga-programa.ts` | Completo |
| N | `Frontend/lib/circuito-programa.ts` | Completo |
| N | `Frontend/lib/etapas-dashboard.ts` | Completo |
| N | `Frontend/lib/invalidacion-consultas.ts` | Parcial; comparte C08 |
| N | `Frontend/lib/programa-bloques-consulta.ts` | Completo |

### C08 — refactor(cache): centralizar invalidaciones de operaciones CRUD

**Dependencias:** C07, porque las invalidaciones de cargos utilizan claves generadas nuevas.

**Contenido:** Completar invalidacion-consultas.ts con invalidarListadoYDetalle y helpers de Área, Carrera/Plan, Departamento, Usuario y Materia; sustituir los bloques locales en altas, ediciones, cargos y borrados CRUD. Incorporar la suite invalidacion-consultas.test.ts.

**Aceptación y límites:** Conservar por operación el alcance de las claves, removeQueries y los puntos de espera/void existentes. Las invalidaciones del nuevo circuito y coordinación de Área ya quedan en C07 para que sus flujos sean completos. No cambiar permisos, navegación ni formularios en este corte.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Frontend/app/(dashboard)/areas/[id]/page.tsx` | Parcial; comparte C06, C07, C09 |
| M | `Frontend/app/(dashboard)/carreras/[id]/page.tsx` | Parcial; comparte C06, C09 |
| M | `Frontend/app/(dashboard)/departamentos/[id]/page.tsx` | Parcial; comparte C06, C09 |
| M | `Frontend/app/(dashboard)/materias/[id]/page.tsx` | Parcial; comparte C06, C09 |
| M | `Frontend/app/(dashboard)/usuarios/[id]/page.tsx` | Parcial; comparte C06, C09 |
| M | `Frontend/components/forms/area-form.tsx` | Parcial; comparte C06 |
| M | `Frontend/components/forms/carrera-form.tsx` | Parcial; comparte C06 |
| M | `Frontend/components/forms/departamento-form.tsx` | Parcial; comparte C06 |
| M | `Frontend/components/forms/materia-form.tsx` | Parcial; comparte C06 |
| M | `Frontend/components/forms/usuario-form.tsx` | Parcial; comparte C06, C07 |
| M | `Frontend/components/pages/areas-list.tsx` | Parcial; comparte C06, C07, C09 |
| M | `Frontend/components/pages/carreras-list.tsx` | Parcial; comparte C06, C07, C09 |
| M | `Frontend/components/pages/departamentos-list.tsx` | Parcial; comparte C06, C07, C09 |
| M | `Frontend/components/pages/materias-list.tsx` | Parcial; comparte C06, C07, C09 |
| M | `Frontend/components/pages/usuarios-list.tsx` | Parcial; comparte C06, C07 |
| N | `Frontend/__tests__/components/invalidacion-consultas.test.ts` | Completo |
| N | `Frontend/lib/invalidacion-consultas.ts` | Parcial; comparte C07 |

### C09 — fix(frontend): estabilizar hooks y corregir errores de lint restantes

**Dependencias:** C07 y C08 para trabajar sobre los consumidores ya adaptados.

**Contenido:** Separación de la espera del departamento respecto del editor de perfil/usuario; reinicios de formulario sin efecto síncrono en las páginas CRUD; hidratación de sidebar; tipado de errores de login y cancelación Axios; const en proxy y entidades escapadas en confirmaciones CRUD. Agregar edicion-usuario-hooks.test.tsx.

**Aceptación y límites:** Los hooks/contextos nuevos y los formularios nuevos ya están corregidos en C07. No reconstruir versiones intermedias con errores conocidos solo para contabilizar los 62 en este commit. Verificar TypeScript, ESLint y suite frontend sobre el commit exacto. Mantener las reglas de lint sin deshabilitarlas.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Frontend/app/(auth)/login/page.tsx` | Parcial; comparte C01, C06 |
| M | `Frontend/app/(dashboard)/areas/[id]/page.tsx` | Parcial; comparte C06, C07, C08 |
| M | `Frontend/app/(dashboard)/carreras/[id]/page.tsx` | Parcial; comparte C06, C08 |
| M | `Frontend/app/(dashboard)/departamentos/[id]/page.tsx` | Parcial; comparte C06, C08 |
| M | `Frontend/app/(dashboard)/materias/[id]/page.tsx` | Parcial; comparte C06, C08 |
| M | `Frontend/app/(dashboard)/mi-perfil/page.tsx` | Parcial; comparte C06 |
| M | `Frontend/app/(dashboard)/usuarios/[id]/page.tsx` | Parcial; comparte C06, C08 |
| M | `Frontend/app/api/custom-instance.ts` | Parcial; comparte C07 |
| M | `Frontend/components/nav/sidebar.tsx` | Parcial; comparte C06, C07 |
| M | `Frontend/components/pages/areas-list.tsx` | Parcial; comparte C06, C07, C08 |
| M | `Frontend/components/pages/carreras-list.tsx` | Parcial; comparte C06, C07, C08 |
| M | `Frontend/components/pages/departamentos-list.tsx` | Parcial; comparte C06, C07, C08 |
| M | `Frontend/components/pages/materias-list.tsx` | Parcial; comparte C06, C07, C08 |
| M | `Frontend/proxy.ts` | Completo |
| N | `Frontend/__tests__/components/edicion-usuario-hooks.test.tsx` | Completo |

### C10 — ci: verificar builds, tipos, lint y pruebas antes de integrar

**Dependencias:** C02, C03 y C07–C09.

**Contenido:** Workflow final, scripts typecheck/lint:ci de package.json, exclusión de estilo del cliente generado, baseline vacío, comparador/script de lint y sus pruebas; README y guía de verificación.

**Aceptación y límites:** Activar el gate después de corregir los errores. No registrar un baseline de 62 errores que ya no existen. En CI se construyen frontend/backend; esta tarea de organización no ejecuta builds ni pruebas. Las verificaciones locales de la conversación no sustituyen la ejecución remota ni la validación de commits parciales.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `.github/workflows/security-pipeline.yml` | Completo |
| M | `Frontend/eslint.config.mjs` | Completo |
| M | `Frontend/package.json` | Parcial; comparte C02 |
| M | `README.md` | Completo |
| N | `Frontend/__tests__/scripts/lint-baseline.test.ts` | Completo |
| N | `Frontend/eslint-baseline.json` | Completo |
| N | `Frontend/scripts/lint-baseline.mjs` | Completo |
| N | `Frontend/scripts/lint-ci.mjs` | Completo |
| N | `docs/Verificacion-local-y-CI.md` | Completo |

### C11 — feat(pdf): ajustar bloque de firmas departamentales

**Dependencias:** C04, que incorpora el renombre de propiedad de la plantilla.

**Contenido:** Únicamente el bloque final de firmas de programa.html: retirar los tres espacios anteriores y dejar el bloque de Decano.

**Aceptación y límites:** Es el cambio actual de firmas, no un PDF simplificado completo. La tabla anterior de firma/aclaración del Docente sigue presente. Revisar esa limitación y el render antes de aceptar este commit; no presentar el resultado como “única firma del Decano”. Hallazgo estático adicional: la plantilla usa ${pc.contenidosMinimos} en el bloque por carrera, pero ProgramaCarreraEntity ya no tiene esa propiedad. El traslado de su presentación al contenido único del programa NO está implementado en los cambios revisados. Resolverlo con autorización funcional separada y verificar el render antes de publicar el conjunto; ningún reordenamiento de commits arregla por sí solo esa referencia.

| Estado | Archivo | Preparación |
|---|---|---|
| M | `Backend/src/main/resources/templates/pdf/programa.html` | Parcial; comparte C04 |

### C12 — test(db): incorporar adaptación heredada y verificador descartable

**Dependencias:** C04 para interpretar el modelo; C05 para las instrucciones locales.

**Contenido:** adaptar_circuito_datos_prueba.sql y docs/sql/pruebas/: fixture heredado, comprobación de adaptación/rechazo y lanzador del contenedor de verificación.

**Aceptación y límites:** Son herramientas de ensayo del esquema heredado. No son una migración integral certificada para producción. El fixture contiene DROP SCHEMA para el contenedor descartable. No se ejecuta ninguno de estos archivos al organizar o commitear. Si se usa el camino conservador, revisar adaptación antes del SQL de renombrado de C04.

| Estado | Archivo | Preparación |
|---|---|---|
| N | `docs/sql/adaptar_circuito_datos_prueba.sql` | Completo |
| N | `docs/sql/pruebas/fixture_legacy.sql` | Completo |
| N | `docs/sql/pruebas/verificar.ps1` | Completo |
| N | `docs/sql/pruebas/verificar_adaptacion.sql` | Completo |
| N | `docs/sql/pruebas/verificar_rechazo.sql` | Completo |

### C13 — chore(db): preparar reinicio controlado del circuito de prueba en Aiven

**Dependencias:** C04; requiere revisión operativa separada antes de cualquier ejecución.

**Contenido:** Solo docs/sql/preparar_circuito_pruebas_aiven.sql, identificado como borrador manual para datos de prueba.

**Aceptación y límites:** El archivo elimina programas, bloques, correlativas de bloques, decisiones, históricos y borradores, preservando los catálogos/usuarios indicados. Tiene bloqueo por defecto mediante confirmación explícita comentada. Es una alternativa de reinicio de prueba: no encadenarlo automáticamente con adaptar_circuito_datos_prueba.sql ni renombrar_estados_programa.sql. Publicar el artefacto no autoriza ejecutarlo ni acredita backup/restauración.

| Estado | Archivo | Preparación |
|---|---|---|
| N | `docs/sql/preparar_circuito_pruebas_aiven.sql` | Completo |

### C14 — docs: consolidar implementación y reglas de trabajo del repositorio

**Dependencias:** Después de los grupos a los que la documentación hace referencia.

**Contenido:** Registro de implementación, guía del circuito, cuestiones pendientes, este plan y reglas de herramientas que se decida versionar.

**Aceptación y límites:** La sección 21/24 del registro de 04/11 contiene una propuesta anterior y referencias ya desactualizadas. Para la preparación actual prevalece este plan fechado; no ejecutar aquel inventario como una lista de git add. Confirmar si AGENTS.md y Frontend/AGENTS.md se quieren compartir en el repositorio; no agregarlos por arrastre. Las notas de cuestiones pendientes incluyen decisiones históricas ya resueltas: tratarlas como registro histórico, no como requisitos vigentes nuevos.

| Estado | Archivo | Preparación |
|---|---|---|
| N | `AGENTS.md` | Completo |
| N | `Frontend/AGENTS.md` | Completo |
| N | `Silabus-cuestiones-pendientes.txt` | Completo |
| N | `docs/Implementacion-circuito-programas.md` | Completo |
| N | `docs/Registro-cambios-implementados-2026-11-04.md` | Completo |
| N | `docs/Plan-commits-develop-2026-11-10.md` | Completo; creado al organizar |

## Cortes concretos de los 26 archivos compartidos

Cada fila especifica el destino de los cambios observados. Si dos modificaciones comparten el mismo hunk de Git, hay que subdividirlo/editar el parche del índice; no seleccionar el hunk entero por conveniencia. No se han generado ni aplicado parches al índice.

| Archivo | Fragmentos y destino |
|---|---|
| `Backend/src/main/resources/templates/pdf/programa.html` | C04: profesorResponsable → docenteResponsable y etiquetas Docente de la cabecera/tabla. C11: solo sustitución del bloque final de firmas. |
| `Frontend/app/(auth)/login/page.tsx` | C01: import de schemas/auth. C06: textos visibles. C09: axios, catch unknown y discriminación del error. |
| `Frontend/app/(dashboard)/areas/[id]/page.tsx` | C06: textos. C07: asignación de coordinación, consulta de candidatos, diálogo, invalidarCoordinacionArea y sus imports. C08: invalidarCambioArea en edición. C09: previousFormSources en reemplazo del efecto que reiniciaba formData. |
| `Frontend/app/(dashboard)/carreras/[id]/page.tsx` | C06: textos. C08: invalidarEdicionCarrera/invalidarCambioPlan en las mutaciones y sus imports. C09: previousFormSources y boolean de onOpenChange. |
| `Frontend/app/(dashboard)/departamentos/[id]/page.tsx` | C06: textos. C08: invalidarEdicionDepartamento y sus imports. C09: previousFormSources y reinicio de responsables/formData. |
| `Frontend/app/(dashboard)/materias/[id]/page.tsx` | C06: textos. C08: invalidarCambioMateria, onSuccess async y sus imports. C09: previousFormSources para materia/areas/departamento. |
| `Frontend/app/(dashboard)/mi-perfil/page.tsx` | C06: textos. C09: MainUserEditor y previousFormSources; mantener la espera del departamento fuera del editor. |
| `Frontend/app/(dashboard)/usuarios/[id]/page.tsx` | C06: textos. C08: invalidarCambioUsuario y sus imports. C09: EditUserEditor con hooks incondicionales y previousFormSources. |
| `Frontend/app/api/custom-instance.ts` | C07: headers X-Departamento-Activo/X-Rol-Activo. C09: Object.assign para cancelación y retirada de @ts-ignore. |
| `Frontend/components/forms/area-form.tsx` | C06: textos, min-w-0 y botones responsive. C08: invalidarCambioArea y query imports. |
| `Frontend/components/forms/carrera-form.tsx` | C06: textos, min-w-0 y botones responsive. C08: invalidarCambioCarrera y query imports. |
| `Frontend/components/forms/departamento-form.tsx` | C06: textos, min-w-0 y botones responsive. C08: invalidarCambioDepartamento y query imports. |
| `Frontend/components/forms/materia-form.tsx` | C06: textos, min-w-0 y botones responsive. C08: invalidarCambioMateria, onSuccess async y query imports. |
| `Frontend/components/forms/usuario-form.tsx` | C06: textos/grillas/botones. C07: imports y usos del enum Rol. C08: invalidarCambioUsuario y limpieza de imports de query keys. |
| `Frontend/components/modals/cargar-programa-dialog.tsx` | C06: título. C07: EstadoPrograma y docenteResponsable. |
| `Frontend/components/modals/programa-anio-existente-dialog.tsx` | C06: título. C07: EstadoPrograma en import/cast. |
| `Frontend/components/modals/role-selector-dialog copy.tsx` | C06: título. C07: enum Rol en imports, tipos, orden y estado. El nombre del archivo se conserva; no se propone otra limpieza. |
| `Frontend/components/nav/sidebar.tsx` | C06: capitalización. C07: Rol, menú de Área y ajustes de navegación. C09: useSyncExternalStore y sus snapshots/suscripción en reemplazo de mounted por efecto. |
| `Frontend/components/pages/areas-list.tsx` | C06: capitalización. C07: Rol, título Mis áreas, dependencia activeRole y copia antes de sort. C08: invalidarCambioArea y query imports. C09: &quot; en confirmación. |
| `Frontend/components/pages/carreras-list.tsx` | C06: capitalización. C07: Rol en imports/condiciones. C08: invalidarCambioCarrera y query imports. C09: &quot; en confirmación. |
| `Frontend/components/pages/departamentos-list.tsx` | C06: capitalización. C07: Rol en imports/condiciones. C08: invalidarCambioDepartamento y query imports. C09: &quot; en confirmación. |
| `Frontend/components/pages/materias-list.tsx` | C06: capitalización. C07: Rol en imports/condiciones. C08: invalidarCambioMateria, onSuccess async y query imports. C09: &quot; en confirmación. |
| `Frontend/components/pages/usuarios-list.tsx` | C06: capitalización. C07: Rol en imports/condiciones y etiquetas de rol. C08: invalidarCambioUsuario y query imports. |
| `Frontend/lib/invalidacion-consultas.ts` | C07: CambioPrograma, invalidarConsultasPrograma, invalidarAsignacionesDepartamento, invalidarCoordinacionArea y sus imports. C08: invalidarListadoYDetalle, interfaces/helpers CRUD restantes y sus imports. El archivo es nuevo, pero se preparan versiones parciales acumulativas. |
| `Frontend/lib/schemas/programa.ts` | C01: retirar exclusivamente ProgramaCarreraFormData. C07: campos/validaciones por actor, docenteResponsableId y Secretaría inicial; conservar programaCarreraSchema utilizado. |
| `Frontend/package.json` | C02: devDependencies ESLint/config. C10: scripts lint:ci y typecheck. El lockfile completo va en C02. |

## Decisiones que no resuelve el orden de commits

- **PDF:** hay una referencia vigente a `pc.contenidosMinimos` en la plantilla, incompatible con la propiedad retirada de `ProgramaCarreraEntity`. El renombre a Docente y el cambio de firmas no corrigen ese problema. No se modificó ni se renderizó la plantilla en esta tarea. Resolver la presentación del contenido mínimo y revisar la firma docente antes de aceptar/publicar la entrega.
- **Dependencias de producción:** C02 debe revisarse como una actualización real de Next/Sharp y transitivas, aunque el rango declarado de Next en package.json no cambie. El lockfile final no representa únicamente la instalación de ESLint.
- **Configuración local:** C05 no debe incluir automáticamente configuración con posibles credenciales reales. Se requiere confirmar una versión publicable de los dos archivos de configuración no abiertos.
- **SQL:** C04 contiene renombrado conservador de estados; C12 conserva adaptación/ensayo del esquema heredado; C13 es una limpieza y adaptación de datos de prueba con borrado de drafts incluido. Son finalidades distintas. El borrado normal de un programa en la aplicación conserva drafts, mientras C13 los elimina deliberadamente como operación manual de prueba.
- **Pruebas antiguas comentadas:** ProgramaControllerIntegrationTest.java, ProgramaControllerTest.java, ProgramaRepositoryTest.java y ProgramaServiceImplTest.java contienen cambios de terminología en código comentado. Su presencia en C04 no acredita cobertura ejecutada.
- **Documentación histórica:** el registro de implementación y las notas pendientes contienen fotografías previas (nombres de helpers/enums, resultados, blockers y particiones) que no deben tratarse como instrucciones actuales sin reconciliarlas. C14 debe describir esa condición al revisar su contenido.
- **Reglas de herramientas:** decidir expresamente el versionado de los dos AGENTS.md dentro de C14. No se eliminó ni se restauró ningún archivo de instrucciones en esta tarea.
- **Estado de aceptación:** ninguna partición fue construida ni probada aisladamente en esta tarea; los grupos son concretos y revisables, pero todavía no están preparados en staging ni certificados como commits verdes.

## Registro para la ejecución posterior

| ID | Autorizado | Diff de índice revisado | Verificación del candidato | SHA creado | Push autorizado/realizado |
|---|---|---|---|---|---|
| C01 | Pendiente | Pendiente | Pendiente | — | No |
| C02 | Pendiente | Pendiente | Pendiente | — | No |
| C03 | Pendiente | Pendiente | Pendiente | — | No |
| C04 | Pendiente | Pendiente | Pendiente | — | No |
| C05 | Pendiente | Pendiente | Pendiente | — | No |
| C06 | Pendiente | Pendiente | Pendiente | — | No |
| C07 | Pendiente | Pendiente | Pendiente | — | No |
| C08 | Pendiente | Pendiente | Pendiente | — | No |
| C09 | Pendiente | Pendiente | Pendiente | — | No |
| C10 | Pendiente | Pendiente | Pendiente | — | No |
| C11 | Pendiente | Pendiente | Pendiente | — | No |
| C12 | Pendiente | Pendiente | Pendiente | — | No |
| C13 | Pendiente | Pendiente | Pendiente | — | No |
| C14 | Pendiente | Pendiente | Pendiente | — | No |

La próxima instrucción puede referirse al ID, por ejemplo: “prepará y commiteá C01”. Antes de ejecutarla se vuelve a comparar el estado real con esta fotografía. Este documento por sí solo no autoriza ningún commit.

# Circuito de programas: primera implementación

Estado: en revisión. Cambios locales en develop, sin commit ni despliegue.

## Alcance

- Administración crea el programa completo en sus campos, sin bloques múltiples.
- Secretaría inicial edita campos administrativos y completa contenidos mínimos únicos y bloques múltiples.
- Al enviar a Docente se exige CCC activa para todas las carreras incluidas.
- Docente envía a PENDIENTE_DE_COORDINACION_AREA si el área tiene coordinador; en caso contrario se abre la ronda de CCC.
- Área consulta, acepta o devuelve. No tiene campos editables ni drafts.
- Cada bloque de carrera/plan tiene una decisión independiente y cerrada al aceptar.
- El primer rechazo cierra la ronda. Las contribuciones se conservan y el reenvío exige decisiones nuevas.
- Secretaría final solo decide después de la aceptación de todos los bloques.

## Historial de estados y decisiones de CCC

El historial visible conserva la secuencia original de estados. La aceptación individual de una CCC no agrega un estado repetido ni una tarjeta de voto. El primer rechazo registra el destino, la justificación y quién rechazó; el reenvío vuelve a abrir la revisión. La aprobación global se registra cuando todos los bloques aceptaron en la ronda actual.

DecisionComisionEntity conserva internamente una decisión por programa, plan y ronda, con resultado explícito: PENDIENTE, APROBADA, RECHAZADA o CANCELADA. Al primer rechazo, las revisiones que todavía estaban pendientes se cancelan sin atribuirles una decisión a sus coordinadores. Las aceptaciones y rechazos anteriores no se borran y no cuentan para rondas nuevas. Se conserva actor, fecha, destino y justificación del rechazo, además de la identificación descriptiva del bloque al abrir la ronda.

Las decisiones pertenecen al programa. Si Secretaría retira un bloque en una corrección, se desvincula ese bloque de las decisiones históricas sin borrarlas. Al eliminar el programa se eliminan también sus decisiones; los drafts siguen independientes.

EstadoHistorico conserva estado, actor, rol, fecha, justificación y una observación opcional para explicar la transición. Se retiraron de esta entidad los campos de evento, ronda, carrera, plan y área. La observación indica si Área aceptó, si se omitió porque no tiene coordinador o si se omitió por desasignación. El actor del salto automático es quien inició la operación; no se registra una aceptación ficticia del coordinador.

No se agregó una vista de votantes ni se expusieron las decisiones individuales en el contrato de consulta del programa. El frontend muestra únicamente la secuencia de estados y la aclaración de Área acordada.

## Asignación de Coordinación de Área

Se reutiliza UserSelectorDialog desde la información del área. Secretaría, Dirección Administrativa y Administrador del Sistema pueden asignar, cambiar o quitar al coordinador.

El rol se obtiene con la asignación. Se conserva si quedan otras áreas coordinadas en ese departamento, también para el administrador. Se notifican asignación y remoción. Reemplazar al coordinador no avanza los programas ni genera correos individuales. Desasignarlo pasa los pendientes a CCC con su aviso habitual. Asignarlo después no retrocede los programas que ya llegaron a CCC.

Mis áreas, Programas, estadísticas y pendientes se limitan a las áreas asignadas del departamento activo. El backend verifica el contexto; el menú no es una barrera de autorización.

## Rechazo y borradores

Se conserva el diálogo de destino y justificación. Antes se agrega una elección de guardar o descartar. Elegir no escribe datos; confirmar el rechazo ejecuta la decisión. Cancelar mantiene el trabajo y el draft.

El backend guarda los cambios permitidos, registra el rechazo y elimina el draft correspondiente dentro de la misma transacción de base de datos. Los drafts se identifican por usuario, rol, materia, año, programa y, para CCC, plan. El ID de programa cero representa un draft anterior a la creación. No existe una relación de borrado en cascada desde el programa a sus drafts.

Los autoguardados tardíos se validan contra la etapa actual para evitar recrear drafts después de un envío. La entrega de correo conserva el mecanismo síncrono existente; no se implementó un outbox ni una garantía transaccional sobre el proveedor de correo.

## Organización

- CircuitoPrograma contiene las reglas puras de etapas y destinos.
- ProgramaWorkflowService coordina las escrituras, decisiones y avisos.
- EmailService centraliza los métodos de envío de notificaciones, incluidos los avisos de programa pendiente de cada etapa. EmailSender conserva la abstracción del proveedor de correo.
- ContextoPrograma valida rol, departamento y asignación.
- ProgramaContextInterceptor aplica el contexto a las operaciones HTTP del circuito.
- AreaServiceImpl.updateCoordinador gestiona asignaciones y roles; candidatosCoordinacion y misAreas concentran las consultas de coordinación en el mismo servicio.
- Las excepciones de validación y conflicto están en util/exception. Se conservan HTTP 400 para validación y estado inválido, HTTP 409 para conflicto y HTTP 403 para falta de permisos.
- ProgramaBorradorService gestiona el aislamiento y autorización de drafts.
- MateriaServiceImpl.updateMateria concentra la actualización, sus controles de acceso y el cambio de área. Delega en el servicio del circuito únicamente los saltos de revisión correspondientes.
- El formulario de Secretaría inicial reutiliza el formulario administrativo en lugar de duplicarlo.

Se conservaron los cambios previos del usuario para mover contenidos mínimos al bloque único; se ajustaron sus mappers y contratos relacionados. Los endpoints nuevos cuentan con un cliente escrito en app/api/programa-workflow.ts. No se arrancó el backend habitual para regenerar Orval.

## Verificación aislada

Se incorporaron pruebas de reglas puras, permisos, gestión de cargos e integración con H2. La configuración application-isolated.properties usa exclusivamente memoria y datos sintéticos. El contexto de integración incluye repositorios y servicios seleccionados, sin seeder, Gemini ni envío real de correo.

También se incorporaron pruebas interactivas del rechazo que verifican la confirmación diferida y la cancelación. El workflow existente incluye la ejecución aislada y la comprobación TypeScript. No se ejecutó GitHub Actions.

Resultado local final:

- Backend: 42 casos seleccionados aprobados. Se ejecutaron 31 casos de reglas, compatibilidad, autorización, MVC, asignación y correo, y 11 casos de integración H2. La suite de integración se repitió después de añadir el control de decisión duplicada y el caso de eliminación conservando drafts.
- Frontend: 8 pruebas aprobadas (3 existentes de login, 2 de confirmación/cancelación de rechazo y 3 de visualización de la trazabilidad).
- TypeScript: comprobación sin emisión aprobada.
- Git diff --check: sin errores de espacios.
- ESLint: no ejecutable porque el paquete no está instalado; no se agregaron dependencias.
- Maven: la última ejecución usó -Dmaven.compiler.useIncrementalCompilation=false después de una inconsistencia de compilación incremental.

Estos controles no equivalen a un E2E de navegador ni verifican equivalencia completa con PostgreSQL. No se ejecutó la suite completa del backend con su configuración habitual.

## Antes de iniciar contra una base existente

No se aplicó ninguna migración ni se inició la aplicación con su configuración habitual. No iniciar esta versión sobre Aiven con actualización automática del esquema sin revisar previamente:

1. Columnas y relación de Coordinación de Área.
2. Cambiar la relación antigua de decisión única por bloque a decisiones por ronda: revisar la restricción única anterior sobre programa_carrera_id, agregar la relación con programa y la clave única programa/plan/ronda, y completar los datos existentes antes de aplicar restricciones. El booleano antiguo aprobado=false no permite distinguir por sí solo rechazo de pendiente. No debe inferirse una decisión o un actor sin evidencia. Revisar también la conservación de los campos históricos anteriores antes de retirarlos de la base. Este trabajo no se ejecutó sobre Aiven y no queda resuelto por ddl-auto=update.
3. Nueva clave de drafts y tratamiento de los borradores antiguos que no distinguen rol, año ni programa.
4. Traslado de contenidos mínimos existentes: si difieren entre bloques, requiere una decisión explícita de conservación.
5. Estados históricos y estados incompletos. La terminología del código y de la API es DOCENTE. El convertidor de estados y los filtros leen los valores históricos terminados en PROFESOR sin modificar la base. Los estados incompletos siguen pendientes de revisión por separado.
6. Configuración del seeder para los roles base del único administrador. No se inspeccionaron valores que pudieran contener credenciales.

## Pendientes posteriores

Actualización de terminología: los campos del contrato pasan a docenteResponsableId y docenteResponsable, el método de carga a docenteCarga y la ruta principal a docente-carga. El frontend y la plantilla PDF usan los mismos nombres. Se mantienen la ruta antigua como alias, el nombre anterior como entrada JSON alternativa y la recuperación de borradores con la clave anterior. La columna física profesor_responsable_id se conserva para no renombrarla sin una migración autorizada. No se cambió el circuito ni el contenido de los correos fuera del reemplazo de terminología.

- Preparar y aprobar la actualización del esquema y el tratamiento de datos anteriores.
- Regeneración reproducible del contrato OpenAPI y cliente con un entorno aislado.
- E2E completo en navegador, revisión visual y responsive.
- Pruebas de concurrencia sobre PostgreSQL.
- Auditoría completa de permisos de usuarios, departamentos, carreras y otros recursos fuera de este primer alcance.
- Diagnóstico de CSRF, sesiones y recuperación de contraseña.
- Comparación visual con vigente, PDF simplificado, firma de Decano y políticas de desactivación, según las decisiones pendientes del documento de requisitos.

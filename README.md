# Sílabus UNS

**Sistema de Gestión de Programas Académicos de la Universidad Nacional del Sur**

Sílabus UNS es una aplicación web desarrollada para centralizar y digitalizar la elaboración, revisión, aprobación, versionado y consulta de los programas académicos de las asignaturas de la Universidad Nacional del Sur.

El sistema reemplaza el intercambio manual de documentos y planillas por un flujo institucional trazable, en el que participan Administración, Secretaría Académica en sus etapas inicial y final, Docentes, Coordinación de Área y Comisiones Curriculares.

> Proyecto desarrollado originalmente por **Santiago Maszong** como Proyecto Final de la carrera de Ingeniería en Sistemas de Información del Departamento de Ciencias e Ingeniería de la Computación de la Universidad Nacional del Sur.

---

## Índice

* [Funcionamiento general](#funcionamiento-general)
* [Roles y permisos](#roles-y-permisos)
* [Ciclo de vida de un programa](#ciclo-de-vida-de-un-programa)
* [Principales funcionalidades](#principales-funcionalidades)
* [Arquitectura](#arquitectura)
* [Stack tecnológico](#stack-tecnológico)
* [Ejecución con Docker](#ejecución-con-docker)
* [Desarrollo local](#desarrollo-local)
* [Configuración](#configuración)
* [Base de datos](#base-de-datos)
* [API](#api)
* [Tests](#tests)
* [Pipeline DevSecOps](#pipeline-devsecops)
* [Despliegue](#despliegue)
* [Mantenimiento](#mantenimiento)

---

# Funcionamiento general

Sílabus UNS administra el programa académico de una materia desde su creación hasta su aprobación definitiva. Se admite un programa por materia y año; la creación de otro con la misma combinación se rechaza.

Cada programa está asociado a una **materia** y puede involucrar una o más **carreras y planes de estudio**. Los contenidos mínimos pertenecen al programa completo. Cada bloque por carrera/plan conserva su ubicación, correlativas y contribución, esta última a cargo exclusivamente de la Coordinación de Comisión Curricular (CCC).

El proceso general es:

```text
Administración
      ↓
Secretaría Académica — carga inicial
      ↓
Docente responsable
      ↓
Coordinación de Área — si el área tiene coordinador
      ↓
Comisiones Curriculares — revisión por bloque y ronda
      ↓
Secretaría Académica — revisión final
      ↓
Programa aprobado
```

Si el área no tiene coordinador, el envío del Docente pasa directamente a Comisiones Curriculares. La omisión de Área queda registrada en el historial. La aprobación de todos los bloques de la ronda vigente permite avanzar a Secretaría final.

Los rechazos devuelven el programa a una etapa de carga autorizada, con justificación. Después de la corrección se recorren nuevamente las etapas posteriores que correspondan. El sistema conserva las transiciones, las decisiones de las comisiones y las notificaciones a los responsables.

La aprobación final produce el estado **`APROBADO`**. Para consultar el programa vigente de una materia se toma el aprobado de año más reciente; las versiones anteriores se conservan. Los aprobados no tienen un circuito de edición posterior implementado.

---

# Roles y permisos

Los permisos dependen del **departamento y rol activos**, de la vinculación habilitada del usuario, de sus asignaciones y de la etapa del programa. Un usuario puede tener varios roles, pero debe seleccionar el correspondiente a la acción; poseer otros roles no habilita a intervenir con un contexto diferente.

| Rol | Función principal |
| --- | --- |
| **Administrador del Sistema** | Administra datos maestros y consulta programas dentro del contexto autorizado. Puede gestionar coordinaciones de Área, eliminar programas y solicitar el PDF de aprobados. |
| **Administración** | Crea el programa y carga materia, Docente responsable, semanas, horas semanales y créditos. Reenvía los programas devueltos a Administración. |
| **Secretaría Académica** | En la etapa inicial revisa y puede ajustar los datos administrativos, completa contenidos mínimos y bloques por carrera/plan, y envía al Docente. En la etapa final aprueba o devuelve el programa. |
| **Docente** | Completa su carga académica en los programas que tiene asignados y puede devolverlos a Administración o Secretaría inicial. |
| **Coordinación de Área** | Revisa los programas de sus áreas asignadas: acepta para enviarlos a CCC o devuelve a una etapa de carga. No modifica los campos del programa. |
| **Coordinación de Comisión Curricular** | Revisa cada bloque de sus carreras/planes asignados, carga su contribución y registra una aceptación o rechazo por ronda. |
| **Dirección Administrativa** | Gestiona los recursos departamentales habilitados, consulta programas y puede gestionar coordinaciones de Área. |

### Ámbito de los roles

Administración, Secretaría Académica y Dirección Administrativa operan sobre el departamento activo. Las acciones de carga deben ejecutarse con el rol específico de la etapa; Administrador del Sistema no sustituye automáticamente a Administración, Docente o revisores.

La **Coordinación de Comisión Curricular** está asociada a carreras del vínculo departamental activo y puede revisar programas de otros departamentos cuando incluyen bloques de esas carreras.

La **Coordinación de Área** consulta sus áreas y programas asignados. Secretaría, Dirección Administrativa y Administrador del Sistema pueden asignar, reemplazar o quitar al coordinador. La asignación actualiza el rol correspondiente; al quitar la última coordinación se retira ese rol.

El rol **Docente** accede a los programas de los que es responsable. La contribución por carrera/plan pertenece exclusivamente a CCC: Secretaría puede consultar y conservar contribuciones existentes, pero no cargarlas ni cambiarlas.

---

# Ciclo de vida de un programa

## 1. Carga administrativa y de Secretaría inicial

Administración crea el programa de la materia para el año actual y selecciona al Docente responsable. Completa semanas, carga horaria semanal y créditos; la carga total se calcula a partir de semanas × horas semanales.

Al enviar, el programa queda en **`PENDIENTE_DE_SECRETARIA_INICIAL`**. Administración puede consultar el resto del contenido, pero los contenidos mínimos y los bloques múltiples se completan en Secretaría inicial.

Secretaría revisa los datos administrativos y completa:

* los contenidos mínimos únicos del programa;
* al menos un bloque de carrera y plan de estudio;
* la ubicación y las correlativas fuertes y débiles de cada bloque.

Cada carrera involucrada debe contar con una CCC activa. Secretaría conserva las contribuciones existentes y no modifica ese campo. Puede devolver el programa a Administración con justificación o enviarlo al Docente, pasando a **`PENDIENTE_DE_DOCENTE`**.

## 2. Carga docente y revisión opcional de Área

El Docente responsable completa carga horaria práctica, fundamentación, objetivos, programa analítico, metodología de enseñanza y actividades de aprendizaje, sistema de evaluación y bibliografía. Consulta los contenidos mínimos y bloques definidos en la etapa anterior.

Los formularios validan los campos requeridos y permiten guardar borradores. La asistencia con Gemini formatea referencias bibliográficas en APA cuando la integración está habilitada.

El envío del Docente tiene dos destinos:

* con coordinador asignado al área: **`PENDIENTE_DE_COORDINACION_AREA`**;
* sin coordinador: **`PENDIENTE_DE_COMISIONES_CURRICULARES`**, registrando la omisión de Área.

Coordinación de Área consulta el programa completo y acepta o devuelve a Administración, Secretaría inicial o Docente. Su aceptación abre la revisión de las comisiones. Si se quita la coordinación sin reemplazo, los programas que esperaban esa revisión pasan a CCC; también se contempla el cambio de una materia a un área sin coordinador.

## 3. Revisión por Comisiones Curriculares

En **`PENDIENTE_DE_COMISIONES_CURRICULARES`**, cada CCC interviene sobre los bloques de carrera/plan que tiene asignados y completa su contribución.

Las decisiones se identifican por **programa, plan y ronda**, con resultado pendiente, aprobada, rechazada o cancelada. Se conserva el actor, la fecha y, cuando corresponde, la justificación y el destino de devolución.

Todas las decisiones de la ronda deben aprobarse para avanzar a **`PENDIENTE_DE_SECRETARIA_FINAL`**. El primer rechazo cierra la ronda y cancela las decisiones que seguían pendientes. Al volver a Comisiones se abre una ronda nueva; las decisiones anteriores y las contribuciones se conservan.

## 4. Revisión por Secretaría Académica

Secretaría realiza la revisión final en **`PENDIENTE_DE_SECRETARIA_FINAL`**. En esta etapa consulta el contenido y puede aprobarlo o devolverlo a Administración, Secretaría inicial o Docente, con justificación.

La aprobación produce **`APROBADO`**. Las devoluciones utilizan **`RECHAZADO_A_ADMINISTRACION`**, **`RECHAZADO_A_SECRETARIA`** o **`RECHAZADO_A_DOCENTE`**, según el destino autorizado.

Si Docente, Secretaría inicial o CCC tienen cambios al rechazar, pueden elegir guardarlos o descartarlos antes de confirmar destino y justificación. Cancelar la confirmación conserva la edición; si no hay cambios, se omite esa primera elección. Las etapas de revisión sin campos editables no ofrecen guardar cambios de contenido.

## 5. Programa vigente

El sistema conserva los programas aprobados y consulta como vigente el de año más reciente de cada materia. Las versiones anteriores, el historial de estados y las decisiones de las comisiones permanecen disponibles según los permisos del usuario.

El endpoint de PDF completo está restringido a Secretaría y Administrador del Sistema para programas aprobados. La plantilla todavía requiere adecuación al traslado de contenidos mínimos al programa y revisión de sus firmas; no hay una variante simplificada por carrera implementada.

La eliminación de un programa requiere confirmación y está limitada a Secretaría o Administrador del Sistema dentro de su contexto autorizado. Elimina el programa y sus registros dependientes, pero conserva los borradores independientes; no habilita su reemplazo automático ante un duplicado.

---

# Principales funcionalidades

### Gestión de programas académicos

* creación de un programa por materia y año con control de duplicados;
* asignación del Docente responsable y carga administrativa diferenciada;
* carga inicial y revisión final de Secretaría Académica;
* contenidos mínimos únicos del programa y bloques por carrera/plan;
* carga académica del Docente y revisión opcional de Coordinación de Área;
* contribución exclusiva de CCC y decisiones persistidas por bloque y ronda;
* rechazo con justificación y elección de guardar o descartar cambios cuando corresponde;
* borradores separados por usuario, materia, año, rol, programa y plan;
* precarga desde el programa vigente anterior, conservando la información de consulta;
* consulta de aprobados, versiones, historial de estados y observaciones de transiciones automáticas;
* eliminación confirmada por los roles autorizados;
* endpoint de PDF completo de programas aprobados, con adecuaciones de plantilla pendientes.

### Gestión institucional

El sistema permite administrar:

* departamentos y sus responsables;
* áreas y asignaciones de Coordinación de Área;
* carreras, comisiones y planes de estudio;
* materias, su área y correlativas;
* usuarios, roles y vínculos activos por departamento.

Las vistas **Mis áreas** y **Mis carreras** utilizan las asignaciones del usuario. La lista de materias sin programa del año actual permite a Administración iniciar la creación con la materia preseleccionada; los demás roles habilitados consultan la materia.

### Notificaciones

Se envían notificaciones por cambios de etapa, devoluciones, asignaciones y remociones de responsabilidades. Se incorporan avisos de carga de Secretaría inicial y de asignación, remoción y revisión de Coordinación de Área.

El transporte está desacoplado mediante `EmailSender`, con Resend como proveedor actual. En el perfil `dev-local` el correo se simula sin envío externo.

### Dashboards

Los perfiles muestran pendientes y estadísticas del año actual dentro de su alcance: departamento, Docente responsable, áreas o carreras asignadas. Los gráficos distinguen Secretaría inicial, Docente, Área, Comisiones y Secretaría final, además de las devoluciones a Administración.

Los paneles departamentales incluyen materias sin programa; CCC y Área disponen de accesos a sus asignaciones. Las operaciones de carga, decisión, asignación y borrado invalidan las consultas relacionadas para actualizar listas, detalles y estadísticas entre roles.

### Asistencia mediante IA

Gemini se utiliza como herramienta auxiliar para el formateo de bibliografía en APA. La elaboración y revisión del programa pueden continuar sin utilizar esta asistencia.

En `dev-local` el formateo con IA está deshabilitado y no se crea el cliente del proveedor externo.

---

# Arquitectura

La aplicación utiliza una arquitectura web cliente-servidor:

```text
┌─────────────────────┐
│      Frontend       │
│ Next.js / React     │
└─────────┬───────────┘
          │
          │ REST / JSON
          │ JWT
          ▼
┌─────────────────────┐
│       Backend       │
│ Spring Boot / Java  │
└─────────┬───────────┘
          │
          │ JPA / Hibernate
          ▼
┌─────────────────────┐
│     PostgreSQL      │
└─────────────────────┘
```

El navegador utiliza rutas de autenticación y un proxy de API de Next.js para comunicarse con el backend REST. El JWT se mantiene en una cookie HttpOnly; el contexto activo se transmite mediante `X-Departamento-Activo` y `X-Rol-Activo`.

Spring Security, el contexto de programa y las validaciones de los servicios comprueban autenticación, vínculo activo, rol, departamento, asignación y etapa. El backend separa reglas del circuito (`CircuitoPrograma`), escrituras transaccionales (`ProgramaWorkflowService`), borradores (`ProgramaBorradorService`) y consultas.

En el frontend se comparten las reglas de navegación, etiquetas de estados, validaciones de formularios e invalidaciones de React Query. Los esquemas activos de Zod están organizados por dominio en `Frontend/lib/schemas/`, incluido `auth.ts`.

---

# Stack tecnológico

Backend y frontend declaran la versión de aplicación **1.3.1**. Las versiones frontend indicadas a continuación son las resueltas en `package-lock.json`; `npm ci` reproduce ese árbol.

| Componente | Tecnología |
| --- | --- |
| Backend | Java 21 / Spring Boot 3.5.15 |
| Persistencia | Spring Data JPA / Hibernate; MapStruct 1.6.3 |
| Base de datos | PostgreSQL; PostgreSQL 17 Alpine para el entorno local de pruebas |
| Migraciones | Flyway disponible y scripts SQL manuales de adaptación, sujetos a revisión |
| Seguridad | Spring Security / JWT en cookie HttpOnly |
| Frontend | Next.js 16.4.5 / React 19.2.0 / TypeScript 5.9.3 |
| UI | Tailwind CSS 4.1.17 / componentes shadcn-ui y Radix UI |
| Formularios | React Hook Form 7.66.1 / Zod 3.25.76 |
| Data fetching | TanStack Query 5.90.11 |
| Cliente REST | Orval 7.21.0 / OpenAPI, con `Rol` y `EstadoPrograma` compartidos |
| Pruebas y lint frontend | Vitest 2.1.9 / Testing Library / ESLint 9.39.5 / eslint-config-next 16.4.5 |
| PDF | Thymeleaf / Flying Saucer / OpenPDF |
| IA | Google Gemini, modelo configurado `gemini-2.5-flash` |
| Email | Interfaz EmailSender / Resend |
| Documentación API | SpringDoc OpenAPI / Swagger |
| Contenedores | Docker / Docker Compose |
| CI / Seguridad | GitHub Actions; Java 21 y Node.js 22 |

Para desarrollo y verificaciones frontend se utiliza Node.js 22, al menos 22.13 para las dependencias actuales de lint. El Dockerfile frontend todavía usa Node.js 20 Alpine; esa base no está alineada con el runtime de CI.

---

# Ejecución con Docker

## Requisitos

* Docker
* Docker Compose
* PostgreSQL accesible
* variables de entorno configuradas

Configurar las variables que necesita `docker-compose.yml` en el entorno o en un archivo `.env` local excluido del repositorio. El archivo `docs/config/pruebas.env.example` se utiliza únicamente para el Compose de pruebas local; no contiene la configuración de una instalación productiva.

Luego ejecutar desde la raíz:

```bash
docker compose up --build
```

Servicios por defecto:

| Servicio   | Dirección                               |
| ---------- | --------------------------------------- |
| Frontend   | `http://localhost:3000`                 |
| Backend    | `http://localhost:8080`                 |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI    | `http://localhost:8080/v3/api-docs`     |

Para detener los servicios:

```bash
docker compose down
```

El entorno de pruebas manuales utiliza `compose.pruebas.yml` y publica solamente PostgreSQL en `127.0.0.1:5433`, separado del Compose principal:

```bash
docker compose --env-file docs/config/pruebas.env.example -f compose.pruebas.yml up -d --wait --pull never
```

Usa una imagen PostgreSQL 17 Alpine ya disponible y un volumen persistente. La preparación del esquema y los datos sintéticos se describe en [Base local de pruebas](docs/Base-local-pruebas.md); iniciar el contenedor no ejecuta por sí solo esa preparación.

---

# Desarrollo local

## Backend

Para las pruebas manuales aisladas, preparar primero PostgreSQL y el esquema local siguiendo [Base local de pruebas](docs/Base-local-pruebas.md). En PowerShell, desde la raíz:

```powershell
.\dev-backend.ps1
```

El lanzador utiliza el perfil `dev-local`, configuración explícita y la base local en el puerto 5433. Publica el backend en `http://127.0.0.1:8081`, valida el esquema existente y mantiene Flyway y la inicialización SQL deshabilitados. El correo se simula y Gemini está deshabilitado.

Tests aislados, desde `Backend`:

```bash
./mvnw -Pci test --no-transfer-progress
```

Build y suite ordinaria en un mismo paso:

```bash
./mvnw -Pci clean verify --no-transfer-progress
```

En Windows, el wrapper equivalente es `mvnw.cmd`. El perfil `ci` utiliza H2 en memoria, mocks para las integraciones de los contextos completos y excluye los lanzadores de datos persistentes del paquete `local`.

## Frontend

Instalar las dependencias desde el lockfile:

```bash
cd Frontend
npm ci
```

Para conectarse al backend local, ejecutar desde la raíz del repositorio en otra terminal PowerShell:

```powershell
.\dev-frontend.ps1
```

El lanzador inicia el frontend en `http://127.0.0.1:3001`, configura el backend en el puerto 8081 y activa la cookie de desarrollo local. `npm run dev` sigue disponible para los entornos que proporcionen su propia configuración.

Desde `Frontend`, comprobar tipos, lint y pruebas:

```bash
npm run typecheck
npm run lint:ci
npm test
```

Build de producción:

```bash
npm run build
```

El layout usa `next/font/google`; el build puede descargar las fuentes Geist.

Regeneración del cliente REST desde el backend local, en PowerShell y dentro de `Frontend`:

```powershell
$env:NEXT_PUBLIC_API_URL = 'http://127.0.0.1:8081'
npm run generate:api
```

Orval consulta `/v3/api-docs` del backend configurado; sin variable utiliza `http://localhost:8081`. El backend debe estar disponible con el contrato de la versión que se está implementando.

---

# Configuración

Las credenciales y configuraciones dependientes del entorno deben proporcionarse mediante variables de entorno.

Variables principales:

```env
# PostgreSQL
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=

# JWT
JWT_SECRET=

# Backend
SERVER_PORT=8080
APP_ALLOWED_ORIGINS=

# IA
GEMINI_API_KEY=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Frontend / proxy Next.js
NEXT_PUBLIC_API_URL=
SILABUS_DEV_LOCAL=false
```

> Nunca almacenar credenciales reales en el repositorio.

Para una instalación institucional, las credenciales y secretos deben ser gestionados por la infraestructura de la UNS.

Los lanzadores locales fijan sus destinos de prueba y no deben confundirse con la configuración de producción. La excepción de cookie para HTTP local requiere simultáneamente `NODE_ENV=development` y `SILABUS_DEV_LOCAL=true`; fuera de esa combinación se conserva la cookie Secure y SameSite=None.

---

# Base de datos

El sistema utiliza PostgreSQL como motor de persistencia. Los contextos automatizados aislados usan H2 en memoria; no verifican por sí solos las diferencias de PostgreSQL ni la concurrencia real.

Flyway está incluido y las migraciones versionadas se ubican en:

```text
Backend/src/main/resources/db/migration/
```

La ejecución de Flyway depende de la configuración del entorno: los perfiles de pruebas `ci` y de desarrollo manual `dev-local` lo mantienen deshabilitado. El lanzador de desarrollo valida el esquema preparado y no aplica migraciones al arrancar.

El modelo actual incorpora coordinación de Área, contenidos mínimos en el programa, decisiones por programa/plan/ronda y una identidad ampliada para los borradores. Los estados persistidos utilizan los nombres `PENDIENTE_DE_...`, `RECHAZADO_A_...` y `APROBADO`. La compatibilidad de lectura con nombres anteriores no sustituye la adaptación de columnas, claves y restricciones necesaria para escribir con el modelo nuevo.

En `docs/sql/` hay artefactos manuales con finalidades distintas:

* `adaptar_circuito_datos_prueba.sql` y su verificador conservan el ensayo del esquema heredado;
* `renombrar_estados_programa.sql` transforma los nombres de estados y sus restricciones sobre un circuito ya adaptado;
* `preparar_circuito_pruebas_aiven.sql` es un borrador de reinicio de datos de prueba: elimina programas, bloques, decisiones, históricos y borradores, y requiere revisión y habilitación explícitas.

Estos archivos no se ejecutan automáticamente ni deben encadenarse como una única migración. Toda adaptación de una base existente requiere revisar su esquema real, respaldos, compatibilidad y resultado en una copia aislada. El reinicio de datos de prueba no equivale al borrado normal de un programa, que conserva sus borradores.

---

# API

El backend expone una API REST documentada mediante OpenAPI.

Con el backend ejecutándose:

```text
Swagger UI
http://localhost:8080/swagger-ui.html

OpenAPI
http://localhost:8080/v3/api-docs
```

Recursos principales:

| Recurso       | Responsabilidad                               |
| ------------- | --------------------------------------------- |
| Autenticación | Login, autenticación y recuperación de acceso |
| Programas     | Cargas por actor, transiciones, decisiones, borradores, historial y PDF de aprobados |
| Materias      | Gestión, cambio de área y consulta de materias sin programa del año actual |
| Carreras      | Gestión de carreras/planes y consulta de asignaciones de CCC |
| Departamentos | Gestión departamental                         |
| Áreas         | Gestión, asignación de coordinación, candidatos y Mis áreas |
| Usuarios      | Gestión de usuarios, roles y asignaciones     |

En el entorno de los lanzadores locales, Swagger y OpenAPI se consultan en el puerto **8081** en lugar de 8080.

Las operaciones del circuito verifican las cabeceras `X-Departamento-Activo` y `X-Rol-Activo`; cuando existe el parámetro `rolActivo`, debe coincidir con el rol seleccionado. Las rutas de carga distinguen `administrativo-carga`, `secretaria-carga` y `docente-carga`. Los borradores incluyen año, programa y plan además de usuario, materia y rol.

El frontend utiliza un cliente TypeScript generado mediante **Orval** en `Frontend/app/api/generated/`. OpenAPI publica `Rol` y `EstadoPrograma` como esquemas compartidos para evitar enums duplicados por endpoint.

Cuando cambia un endpoint, DTO o enum, se regenera el cliente contra el backend correspondiente y se actualizan sus consumidores juntos. Los alias históricos de estados y de carga docente se mantienen como compatibilidad; la API emite la nomenclatura actual.

---

# Tests

## Backend

```bash
cd Backend
./mvnw -Pci clean verify --no-transfer-progress
```

El perfil `ci` ejecuta la suite ordinaria y genera el JAR con configuración aislada. Los contextos completos simulan el seeder y los proveedores de correo e IA; las pruebas JPA usan H2 en memoria y datos sintéticos. Los reportes quedan en `Backend/target/surefire-reports/`.

Las pruebas incorporadas cubren reglas del circuito, compatibilidad de estados, contexto/permisos, rondas y borradores, coordinación de Área, asignaciones, materias sin programa, estadísticas y notificaciones. Los archivos antiguos que conservan pruebas comentadas no agregan cobertura ejecutada.

`LocalDatabaseSeedTest` y `LocalManualFixtureTest` son lanzadores optativos con escrituras persistentes, excluidos del perfil `ci`. Su uso se documenta en la guía local y no forma parte del comando anterior. Las pruebas con PostgreSQL concurrente y los recorridos completos autenticados en navegador siguen pendientes de una etapa específica.

## Frontend

```bash
cd Frontend
npm run typecheck
npm run lint:ci
npm test
```

Se utiliza TypeScript, ESLint y Vitest con Testing Library. Las pruebas cubren formularios por actor, devoluciones, precarga, asignaciones, navegación/contexto, dashboards, eliminación y actualización de caché.

`npm run lint` muestra el análisis completo. `lint:ci` aplica las mismas reglas con un baseline actualmente vacío: cualquier error bloquea el control; las advertencias se informan y siguen pendientes de corrección. Los archivos generados de Orval se comprueban con TypeScript y se excluyen del análisis de estilo.

CI ejecuta además `npm run build`. Estas comprobaciones no sustituyen las pruebas de integración con PostgreSQL, la revisión visual ni las verificaciones de seguridad del pipeline.

---

# Pipeline DevSecOps

El pipeline de GitHub Actions se ejecuta ante pushes y Pull Requests dirigidos a **`develop` y `main`**. Utiliza Java 21 y Node.js 22.

El pipeline contempla:

| Etapa            | Herramienta     | Política                                               |
| ---------------- | --------------- | ------------------------------------------------------ |
| Secret Detection | Gitleaks        | Bloquea ante detección de secretos                     |
| Backend Tests    | Maven / JUnit   | Bloquea ante fallos de la suite aislada o del empaquetado JAR |
| Frontend Tests   | TypeScript / ESLint / Vitest / Next.js | Bloquea ante errores de tipos, lint, pruebas o build |
| SCA Backend      | Trivy           | Bloquea vulnerabilidades CRITICAL                      |
| SCA Frontend     | npm audit       | Bloquea vulnerabilidades HIGH o CRITICAL de producción |
| SAST             | CodeQL          | Análisis estático y publicación de resultados          |
| IaC Scanning     | Trivy + Checkov | Bloquea configuraciones HIGH o CRITICAL                |
| DAST             | OWASP ZAP       | Analiza OpenAPI y bloquea por alertas no aceptadas; depende de los controles anteriores |

Backend ejecuta `mvnw -Pci clean verify` y adjunta los reportes Surefire, incluso ante fallos. Frontend instala con `npm ci`, comprueba tipos y lint, ejecuta Vitest y realiza el build. La auditoría frontend utiliza `npm audit --omit=dev --audit-level=high`.

El baseline de ESLint está vacío. CodeQL publica hallazgos y su job debe completar correctamente, aunque esos hallazgos no bloqueen por severidad en este workflow. El escaneo ZAP actual no implementa un recorrido autenticado completo del circuito; la ejecución del pipeline tampoco certifica por sí sola los permisos institucionales.

La rama `main` se encuentra destinada a contener código validado para despliegue.

El flujo recomendado de contribución es:

```text
Rama de trabajo desde develop
      ↓
Pull Request a develop + pipeline
      ↓
Integración y verificación del conjunto
      ↓
Pull Request a main + pipeline
      ↓
Merge a main
      ↓
Despliegue coordinado de backend, frontend y esquema
```

No se recomienda trabajar directamente sobre `main`.

---

# Despliegue

Backend y frontend disponen de Dockerfiles y de un Compose principal para facilitar su instalación. La base de imagen Node.js 20 del frontend todavía difiere de Node.js 22 utilizado en CI.

La arquitectura de despliegue requiere, como mínimo:

```text
Frontend
   │
   ▼
Backend
   │
   ▼
PostgreSQL
```

Las integraciones externas —correo electrónico e IA— requieren además conectividad hacia sus respectivos proveedores.

## Entorno de desarrollo/prototipo

Durante el desarrollo se utilizaron servicios externos de hosting y base de datos.

Estos servicios no constituyen un requisito arquitectónico del sistema.

## Entorno institucional

Para la instalación definitiva en infraestructura de la Universidad deben configurarse:

* instancia PostgreSQL;
* variables y secretos de producción;
* URLs públicas/internas correspondientes;
* configuración CORS;
* mecanismo de envío de correo institucional;
* persistencia y estrategia de backup de PostgreSQL;
* certificados HTTPS y/o proxy reverso según la infraestructura utilizada.

La aplicación no depende conceptualmente de Render, Vercel o Aiven. La transferencia requiere revisar las URLs configuradas y los enlaces del código, incluidos los correos que todavía apuntan al frontend de prototipo.

---

# Mantenimiento

## Modificaciones del backend

Cuando una modificación implique cambios en el modelo persistente:

1. revisar las entidades, DTO, mappers, consultas y compatibilidad de datos afectados;
2. preparar la adaptación del esquema y registrarla como migración versionada o artefacto manual explícitamente revisado;
3. ensayar la adaptación y la recuperación sobre una base de prueba;
4. ejecutar la verificación aislada con `mvnw -Pci clean verify`;
5. coordinar el contrato frontend/backend y crear el Pull Request hacia `develop`.

## Modificaciones de la API

Cuando se modifica un endpoint o DTO utilizado por el frontend:

1. actualizar endpoints, DTO y esquemas compartidos del backend;
2. iniciar el backend candidato en un entorno de prueba explícito;
3. regenerar el cliente con `npm run generate:api` contra ese contrato;
4. adaptar todos los consumidores de propiedades, roles y estados en la misma unidad de cambio;
5. comprobar tipos, lint y pruebas; conservar los alias históricos que formen parte del contrato de compatibilidad.

## Modificaciones del frontend

Desde `Frontend`, ejecutar:

```bash
npm run typecheck
npm run lint:ci
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

antes de integrar cambios, revisando el resultado de cada paso. El build puede descargar fuentes y `npm audit` consulta el registro npm. Las verificaciones de un commit parcial deben realizarse sobre ese contenido exacto, no solo sobre un árbol con cambios adicionales.

## Flujo Git recomendado

```bash
git checkout develop
git pull --ff-only

git checkout -b feature/nombre-cambio

# realizar cambios y preparar archivos/fragmentos relacionados

git add -p
git diff --cached
git commit -m "feat: descripción del cambio"
git push -u origin feature/nombre-cambio
```

Los archivos nuevos se agregan por ruta explícita. Crear un Pull Request hacia `develop`, esperar los controles y verificar el conjunto; la promoción posterior a `main` se realiza con otro Pull Request. Los commits agrupan cambios coherentes, incluyendo contrato generado y consumidores cuando dependen entre sí.

---

## Consideraciones para transferencia

Antes de poner el sistema en producción institucional se recomienda verificar:

* credenciales y secretos de producción;
* configuración de PostgreSQL;
* revisión y ensayo de la adaptación del esquema y de las migraciones que corresponda aplicar;
* servicio de correo electrónico;
* conectividad con servicios externos;
* configuración CORS;
* URLs del frontend y backend;
* HTTPS;
* backups de base de datos;
* usuarios y roles iniciales;
* ejecución satisfactoria del pipeline y revisión de permisos, concurrencia y flujos autenticados;
* adecuación de la plantilla PDF a contenidos mínimos únicos y firmas acordadas;
* política de actualización y mantenimiento.

---

## Documentación adicional

La documentación funcional, decisiones de diseño, requerimientos, arquitectura y proceso de desarrollo se desarrolla en el [Informe Final del Proyecto](docs/Informe%20Final%20del%20Proyecto%20-%20S%C3%ADlabus-UNS.pdf).

Para el diseño y la implementación técnica, consultar el [Informe Técnico](docs/Informe%20Tecnico%20-%20S%C3%ADlabus-UNS.pdf).

La especificación técnica de los endpoints se encuentra disponible mediante **Swagger/OpenAPI**.

Para el uso del sistema, consultar el [Manual de Usuario](docs/Manual%20de%20usuario%20-%20S%C3%ADlabus-UNS.pdf). Estos informes pueden reflejar versiones anteriores; el circuito descrito en este README corresponde al código actual. La operación manual aislada se detalla en [Base local de pruebas](docs/Base-local-pruebas.md) y la preparación de cambios por grupos en el [Plan de commits](docs/Plan-commits-develop-2026-11-10.md).


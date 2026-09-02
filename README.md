# Sílabus UNS

**Sistema de Gestión de Programas Académicos de la Universidad Nacional del Sur**

Sílabus UNS es una aplicación web desarrollada para centralizar y digitalizar la elaboración, revisión, aprobación, versionado y consulta de los programas académicos de las asignaturas de la Universidad Nacional del Sur.

El sistema reemplaza el intercambio manual de documentos y planillas por un flujo institucional trazable, en el que participan administración, docentes, comisiones curriculares y secretarías académicas.

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

Sílabus UNS administra el programa académico de una materia desde su creación hasta su aprobación definitiva.

Cada programa está asociado a una **materia** y puede involucrar una o más **carreras y planes de estudio**. Esto permite representar materias compartidas entre distintas carreras y someter un mismo programa a las comisiones curriculares correspondientes.

El proceso general es:

```text
Administración
      ↓
   Docente
      ↓
Comisión/es Curricular/es
      ↓
Secretaría Académica
      ↓
 Programa vigente
```

Cada etapa posee permisos y responsabilidades específicas.

Los rechazos devuelven el programa a la etapa que corresponda para realizar las correcciones solicitadas. El sistema registra las transiciones realizadas y notifica por correo electrónico a los usuarios involucrados.

Una vez aprobado por Secretaría Académica, el programa pasa a considerarse **vigente** y puede generarse su documento institucional en formato PDF.

---

# Roles y permisos

Los permisos están determinados por el rol del usuario dentro de cada departamento.

Un mismo usuario puede poseer diferentes responsabilidades dependiendo del departamento al que pertenezca.

| Rol                                     | Función principal                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Administrador del Sistema**           | Administración global del sistema y de sus datos maestros.                                                            |
| **Administración**                      | Gestiona la información administrativa del departamento e inicia la elaboración de los programas.                     |
| **Docente**                             | Completa la información académica de los programas que tiene asignados.                                               |
| **Coordinación de Comisión Curricular** | Revisa los programas correspondientes a las carreras que tiene asignadas y puede aprobarlos o solicitar correcciones. |
| **Secretaría Académica**                | Realiza la revisión institucional final de los programas del departamento y determina su aprobación.                  |
| **Dirección Administrativa**            | Posee las funciones administrativas correspondientes al departamento.                                                 |

### Ámbito de los roles

Los roles de **Administración**, **Secretaría Académica** y **Dirección Administrativa** operan a nivel de departamento.

La **Coordinación de Comisión Curricular**, además, está asociada a una o más carreras concretas.

El rol **Docente** se relaciona con las materias y programas que le fueron asignados.

---

# Ciclo de vida de un programa

## 1. Carga administrativa

Administración crea el programa correspondiente a una materia y completa su información inicial.

Entre otros datos, se determinan:

* materia;
* docente responsable;
* carreras y planes de estudio involucrados;
* información administrativa correspondiente;
* correlatividades y demás información asociada a cada plan.

Una materia puede estar vinculada a más de una carrera o plan de estudios.

Finalizada esta etapa, el programa es enviado al docente responsable.

## 2. Carga docente

El docente completa la información académica del programa, incluyendo los diferentes apartados requeridos institucionalmente.

El formulario posee mecanismos de validación y guardado de borradores para permitir continuar la carga posteriormente.

El sistema también dispone de asistencia mediante IA para el formateo de referencias bibliográficas según normas APA.

Una vez completado, el programa es enviado a revisión.

## 3. Revisión por Comisiones Curriculares

Las comisiones curriculares correspondientes a las carreras involucradas revisan el programa.

Cada comisión puede:

* aprobar el programa;
* solicitar correcciones indicando una justificación.

Cuando un programa involucra múltiples carreras, debe atravesar las revisiones correspondientes antes de continuar a la siguiente etapa.

Los rechazos y aprobaciones quedan registrados en el historial del programa.

## 4. Revisión por Secretaría Académica

Una vez superada la instancia de las comisiones curriculares, Secretaría Académica realiza la revisión final.

Puede:

* aprobar el programa;
* solicitar correcciones.

La aprobación de Secretaría determina que el programa se encuentre vigente.

## 5. Programa vigente

El sistema conserva la versión aprobada del programa y permite generar su representación institucional en **PDF**.

Las versiones anteriores y el historial de estados permanecen disponibles para garantizar trazabilidad.

---

# Principales funcionalidades

### Gestión de programas académicos

* creación y edición de programas;
* asignación de docentes;
* asociación con múltiples carreras y planes;
* carga diferenciada por Administración y Docente;
* revisión por Comisiones Curriculares;
* aprobación final por Secretaría Académica;
* rechazo con justificación;
* generación del PDF institucional;
* consulta de programas vigentes;
* historial de estados y versiones.

### Gestión institucional

El sistema permite administrar:

* departamentos;
* áreas;
* carreras;
* planes de estudio;
* materias;
* usuarios;
* roles y responsabilidades dentro de cada departamento.

### Notificaciones

Se envían notificaciones por correo electrónico ante eventos relevantes del flujo, incluyendo cambios de etapa, solicitudes de corrección y asignaciones de responsabilidades.

### Dashboards

Los distintos perfiles disponen de vistas adaptadas a sus responsabilidades, mostrando información como programas pendientes, rechazados, aprobados y vigentes.

### Asistencia mediante IA

La integración con un proveedor de IA se utiliza como herramienta auxiliar para el formateo de bibliografía.

La lógica principal del sistema y el circuito de aprobación no dependen de esta integración.

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

El frontend consume exclusivamente la API REST expuesta por el backend.

La autenticación y autorización se implementan mediante Spring Security y JWT.

---

# Stack tecnológico

| Componente        | Tecnología                                      |
| ----------------- | ----------------------------------------------- |
| Backend           | Java 21 / Spring Boot 3.5                       |
| Persistencia      | Spring Data JPA / Hibernate                     |
| Base de datos     | PostgreSQL                                      |
| Migraciones       | Flyway                                          |
| Seguridad         | Spring Security / JWT                           |
| Frontend          | Next.js 16 / React 19 / TypeScript              |
| UI                | Tailwind CSS / shadcn-ui                        |
| Formularios       | React Hook Form / Zod                           |
| Data fetching     | TanStack Query                                  |
| Cliente REST      | Orval / OpenAPI                                 |
| PDF               | Thymeleaf / Flying Saucer / OpenPDF             |
| IA                | Google Gemini                                   |
| Email             | Servicio desacoplado mediante interfaz de envío |
| Documentación API | SpringDoc OpenAPI / Swagger                     |
| Contenedores      | Docker / Docker Compose                         |
| CI / Seguridad    | GitHub Actions                                  |

---

# Ejecución con Docker

## Requisitos

* Docker
* Docker Compose
* PostgreSQL accesible
* variables de entorno configuradas

Crear el archivo `.env` correspondiente a partir de la configuración de ejemplo del proyecto.

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

---

# Desarrollo local

## Backend

```bash
cd Backend

./mvnw spring-boot:run
```

Tests:

```bash
./mvnw test
```

Build:

```bash
./mvnw clean package
```

## Frontend

```bash
cd Frontend

npm ci
npm run dev
```

Build:

```bash
npm run build
```

Tests:

```bash
npm test
```

Regeneración del cliente REST a partir del contrato OpenAPI:

```bash
npm run generate:api
```

El backend debe encontrarse disponible para obtener la especificación OpenAPI utilizada durante la generación.

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

# IA
GEMINI_API_KEY=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Frontend
NEXT_PUBLIC_API_URL=
```

> Nunca almacenar credenciales reales en el repositorio.

Para una instalación institucional, las credenciales y secretos deben ser gestionados por la infraestructura de la UNS.

---

# Base de datos

El sistema utiliza PostgreSQL como motor de persistencia.

Las modificaciones estructurales de la base se gestionan mediante **Flyway**.

Las migraciones se encuentran en:

```text
Backend/src/main/resources/db/migration/
```

Al iniciar el backend, Flyway aplica automáticamente las migraciones pendientes según la configuración del entorno.

No se recomienda modificar manualmente el esquema de una instalación productiva sin generar la migración correspondiente.

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
| Programas     | Ciclo de vida de programas académicos         |
| Materias      | Gestión de materias                           |
| Carreras      | Gestión de carreras y planes                  |
| Departamentos | Gestión departamental                         |
| Áreas         | Gestión de áreas                              |
| Usuarios      | Gestión de usuarios, roles y asignaciones     |

El frontend utiliza un cliente TypeScript generado automáticamente desde esta especificación mediante **Orval**.

Cuando se modifica el contrato de la API puede ser necesario regenerar el cliente del frontend.

---

# Tests

## Backend

```bash
cd Backend
./mvnw test
```

Los tests automatizados verifican componentes relevantes de la lógica del backend.

## Frontend

```bash
cd Frontend
npm test
```

El frontend utiliza Vitest para sus pruebas automatizadas.

Los tests forman parte de los controles obligatorios del pipeline antes de integrar cambios en la rama principal.

---

# Pipeline DevSecOps

El repositorio posee un pipeline automatizado mediante GitHub Actions que se ejecuta ante Pull Requests dirigidos a `main` y ante actualizaciones de dicha rama.

El pipeline contempla:

| Etapa            | Herramienta     | Política                                               |
| ---------------- | --------------- | ------------------------------------------------------ |
| Secret Detection | Gitleaks        | Bloquea ante detección de secretos                     |
| Backend Tests    | Maven / JUnit   | Bloquea ante tests fallidos                            |
| Frontend Tests   | Vitest          | Bloquea ante tests fallidos                            |
| SCA Backend      | Trivy           | Bloquea vulnerabilidades CRITICAL                      |
| SCA Frontend     | npm audit       | Bloquea vulnerabilidades HIGH o CRITICAL de producción |
| SAST             | CodeQL          | Análisis estático y publicación de resultados          |
| IaC Scanning     | Trivy + Checkov | Bloquea configuraciones HIGH o CRITICAL                |
| DAST             | OWASP ZAP       | Análisis dinámico de la API                            |

La rama `main` se encuentra destinada a contener código validado para despliegue.

El flujo recomendado de contribución es:

```text
Rama de trabajo
      ↓
Pull Request
      ↓
Pipeline DevSecOps
      ↓
Checks obligatorios
      ↓
Merge a main
      ↓
Despliegue
```

No se recomienda trabajar directamente sobre `main`.

---

# Despliegue

El sistema se encuentra completamente contenedorizado para facilitar su instalación en diferentes infraestructuras.

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

La aplicación no depende conceptualmente de Render, Vercel o Aiven para su funcionamiento.

---

# Mantenimiento

## Modificaciones del backend

Cuando una modificación implique cambios en el modelo persistente:

1. modificar las entidades correspondientes;
2. generar una nueva migración Flyway;
3. verificar la migración sobre una base de prueba;
4. ejecutar los tests;
5. crear un Pull Request.

## Modificaciones de la API

Cuando se modifica un endpoint o DTO utilizado por el frontend:

1. actualizar el backend;
2. ejecutar el backend;
3. regenerar el cliente OpenAPI del frontend;
4. adaptar el frontend si fuera necesario;
5. ejecutar los tests.

## Modificaciones del frontend

Ejecutar como mínimo:

```bash
npm test
npm run build
```

antes de integrar cambios.

## Flujo Git recomendado

```bash
git checkout main
git pull

git checkout -b feature/nombre-cambio

# realizar cambios

git add .
git commit -m "feat: descripción del cambio"
git push -u origin feature/nombre-cambio
```

Luego crear un Pull Request hacia `main` y esperar la finalización de los controles automáticos antes de realizar el merge.

---

## Consideraciones para transferencia

Antes de poner el sistema en producción institucional se recomienda verificar:

* credenciales y secretos de producción;
* configuración de PostgreSQL;
* ejecución correcta de migraciones Flyway;
* servicio de correo electrónico;
* conectividad con servicios externos;
* configuración CORS;
* URLs del frontend y backend;
* HTTPS;
* backups de base de datos;
* usuarios y roles iniciales;
* ejecución satisfactoria del pipeline;
* política de actualización y mantenimiento.

---

## Documentación adicional

La documentación funcional, decisiones de diseño, requerimientos, arquitectura y proceso de desarrollo se encuentran desarrollados con mayor profundidad en el **Informe Final del Proyecto**.

Para documentación de diseño e implementación más técnica en profundidad consultar **Informe Técnico**.

La especificación técnica de los endpoints se encuentra disponible mediante **Swagger/OpenAPI**.

Para el uso del sistema como un usuario final consultar la documentación en el **Manual de Usuario**.


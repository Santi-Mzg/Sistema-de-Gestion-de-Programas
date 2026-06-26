# Sílabus UNS

Proyecto final de Santiago Maszong para la carrera de Ingeniería en Sistemas de Información del Departamento de Ciencias e Ingeniería de la Computación de la Universidad Nacional del Sur.

Sistema de Gestión de Programas Académicos para la Universidad Nacional del Sur.

Digitaliza el ciclo de vida completo del programa universitario: redacción por administrativos y docentes, revisión por comisión y aprobación por secretaría académica.

---

## Índice

- [Descripción](#descripción)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura y roles](#arquitectura-y-roles)
- [Flujo del programa académico](#flujo-del-programa-académico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Inicio rápido con Docker](#inicio-rápido-con-docker)
- [Desarrollo local](#desarrollo-local)
- [Variables de entorno](#variables-de-entorno)
- [API y documentación](#api-y-documentación)
- [Tests](#tests)
- [Pipeline de seguridad](#pipeline-de-seguridad)

---

## Descripción

Sílabus UNS reemplaza el proceso manual (planillas Word/Excel enviadas por correo) por una plataforma web centralizada donde:

- El **administrador** crea programas académicos y los asigna a departamentos y materias.
- El **docente** completa los datos curriculares del programa (objetivos, contenidos, bibliografía, etc.) con asistencia de IA para formateo APA.
- La **comisión** revisa y aprueba o rechaza cada programa relevante a su carrera, con justificación.
- La **comisión** revisa y aprueba o rechaza cada programa de su departamento, con justificación. Y puede generar el resultado final en formato PDF.
- El sistema permite generar el PDF final del programa aprobado y registra el historial completo de estados de cada programa y todas las versiones de cada programa.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Spring Boot 3.5.6 / Java 21 |
| Base de datos | PostgreSQL (Aiven Cloud) |
| Migraciones | Flyway |
| Seguridad | Spring Security + JWT (jjwt 0.12.5) |
| Generación de PDF | Thymeleaf → Flying Saucer → OpenPDF |
| Email | Resend API |
| IA | Google Gemini 2.5 Flash (WebFlux) |
| Documentación API | SpringDoc OpenAPI / Swagger UI |
| Frontend | Next.js 16 / React 19 / TypeScript |
| Estilos | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Formularios | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| Cliente API | Orval (generado desde OpenAPI) |
| Gráficos | Recharts |
| Contenedores | Docker + Docker Compose |
| Deploy backend | Render |
| Deploy frontend | Vercel |

---

## Arquitectura y roles

```
┌─────────────┐     REST/JSON      ┌──────────────────┐
│  Next.js 16 │ ◄────────────────► │  Spring Boot 3.5 │
│  (Vercel)   │   JWT en header    │  (Render)        │
└─────────────┘                    └────────┬─────────┘
                                            │
                                   ┌────────▼─────────┐
                                   │  PostgreSQL       │
                                   │  (Aiven Cloud)   │
                                   └──────────────────┘
```
      
**Roles del sistema:**

| Rol | Responsabilidades |
|-----|------------------|
| `Adminnistrador del Sistema` | Gestión completa: usuarios, departamentos, áreas, materias, carreras y programas |
| `Adminnistrativo` | Gestión completa de: usuarios, materias y carreras del departamento | Crea y carga información inicial de programas |
| `Docente` | Revisión y carga de sus propios programas asignados |
| `Coord. Comisión Curricular` | Gestión completa de: usuarios, departamentos, áreas, materias y carreras del departamento | Revisión, aprobación o rechazo de programas enviados relevantes a sus carreras asignadas |
| `Secretaría` | Gestión completa de: usuarios, departamentos, áreas, materias y carreras del departamento | Revisión, aprobación o rechazo de programas enviados relevantes a su departamento |

---

## Estructura del proyecto

```
Silabus-UNS/
├── Backend/                        Spring Boot
│   ├── src/main/java/.../
│   │   ├── controller/             7 REST controllers (Auth, Area, Carrera,
│   │   │                           Departamento, Materia, Programa, User)
│   │   ├── domain/
│   │   │   ├── entities/           13 entidades JPA
│   │   │   ├── dto/                DTOs de request y response
│   │   │   └── enums/              EstadoPrograma, AccionPrograma, Rol, TokenType
│   │   ├── services/               Lógica de negocio + integraciones
│   │   │   ├── impl/               Implementaciones por agregado
│   │   │   ├── auth/               Autenticación JWT
│   │   │   ├── email/              Envío asíncrono vía Resend
│   │   │   ├── gemini/             Formateo APA con Gemini AI
│   │   │   └── pdf/                Generación PDF con Thymeleaf + Flying Saucer
│   │   ├── repositories/           Spring Data JPA
│   │   ├── mappers/                MapStruct
│   │   ├── security/               JWT filter
│   │   └── util/                   Exception handler, seeder
│   └── src/main/resources/
│       ├── application.properties
│       ├── db/migration/           Flyway SQL
│       └── templates/              Plantillas Thymeleaf para PDF
│
├── Frontend/                       Next.js (App Router)
│   └── app/
│       ├── (auth)/                 Login, forgot-password, set-password
│       └── (dashboard)/
│           ├── areas/              CRUD de áreas
│           ├── carreras/           CRUD de carreras y planes
│           ├── departamentos/      CRUD de departamentos
│           ├── materias/           CRUD de materias
│           ├── programas/          Gestión completa de programas académicos
│           │   └── [id]/
│           │       ├── carga/      Formularios docente / administración
│           │       ├── revision/   Pantallas comisión / secretaría
│           │       └── historial-estados/
│           └── usuarios/           CRUD de usuarios
│
├── .github/workflows/
│   └── security-pipeline.yml       Pipeline CI/CD de seguridad
├── docker-compose.yml
└── .env                            Variables de entorno (no commitear)
```

---

## Requisitos previos

- **Docker** y **Docker Compose** (para inicio rápido)
- O bien: **Java 21**, **Maven 3.9+**, **Node.js 22+** (para desarrollo local)
- Una instancia de **PostgreSQL** accesible

---

## Inicio rápido con Docker

```bash
# 1. Copiar y completar las variables de entorno
cp .env.example .env

# 2. Levantar backend y frontend
docker compose up --build
```

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

## Desarrollo local

### Backend

```bash
cd Backend

# Levantar el servidor de desarrollo
./mvnw spring-boot:run

# Compilar sin tests
./mvnw clean package -DskipTests

# Ejecutar tests
./mvnw test

# Correr el JAR generado
java -jar target/Sistema_de_Gestion_de_Programas-0.9.0-SNAPSHOT.jar
```

### Frontend

```bash
cd Frontend

# Instalar dependencias (primera vez)
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build && npm start

# Regenerar cliente API desde el OpenAPI del backend (correr con backend activo)
npm run generate:api

# Linting
npm run lint

# Tests
npm test
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto a partir del siguiente template:

```env
# Base de datos PostgreSQL
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>?sslmode=require
SPRING_DATASOURCE_USERNAME=<usuario>
SPRING_DATASOURCE_PASSWORD=<contraseña>

# JWT
JWT_SECRET=<string-aleatorio-minimo-32-chars>

# Servidor
SERVER_PORT=8080

# Google Gemini AI
GEMINI_API_KEY=<api-key>

# Resend (email transaccional)
RESEND_API_KEY=<api-key>
RESEND_FROM_EMAIL=noreply@tudominio.com

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> El `.env` está excluido por `.gitignore`. **Nunca commitear credenciales reales.**

---

## API y documentación

Con el backend corriendo, la documentación interactiva está disponible en:

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

Endpoints principales:

| Recurso | Base path |
|---------|-----------|
| Autenticación | `/api/auth` |
| Programas | `/api/departamentos/{deptId}/programas` |
| Materias | `/api/materias` |
| Departamentos | `/api/departamentos` |
| Áreas | `/api/areas` |
| Carreras | `/api/carreras` |
| Usuarios | `/api/users` |


## Tests

```bash
# Backend — tests de integración con H2 en memoria
cd Backend && ./mvnw test

# Frontend — unit tests con Vitest
cd Frontend && npm test
```

Los tests del backend usan un perfil `test` con H2 en memoria: no requieren una base de datos PostgreSQL activa. La configuración vive en `Backend/src/test/resources/application.properties`.

---

## Pipeline de seguridad

El proyecto incluye un pipeline de CI/CD en `.github/workflows/security-pipeline.yml` que se ejecuta en cada push y pull request a `devsecops`:

| Job | Herramienta | Qué detecta |
|-----|-------------|-------------|
| Secret Detection | Gitleaks | Credenciales y secrets en el historial git |
| SCA Backend | OWASP Dependency Check | CVEs en dependencias Maven (umbral CVSS ≥ 7) |
| SCA Frontend | npm audit + audit-ci | Vulnerabilidades high/critical en paquetes npm |
| SAST | Semgrep | Patrones inseguros en código Java y React |
| IaC Scanning | Trivy + Checkov | Misconfigurations en Dockerfiles y docker-compose |
| DAST | OWASP ZAP | Vulnerabilidades en endpoints REST en runtime |

Los reportes de cada job se suben como artifacts en GitHub Actions. Los hallazgos SAST se publican en la pestaña **Security → Code Scanning** del repositorio.

# PostgreSQL local para Sílabus

La base local usa la imagen `postgres:17-alpine` ya disponible en Docker. No descarga imágenes ni se conecta a Aiven.

## Base persistente de desarrollo y pruebas manuales

Desde la raíz del repositorio:

```powershell
docker compose --env-file docs/config/pruebas.env.example -f compose.pruebas.yml up -d --wait --pull never
```

Datos de conexión locales:

- Host: `127.0.0.1`
- Puerto: `5433`
- Base: `silabus_pruebas`
- Usuario: `silabus`
- Autenticación: sin contraseña, habilitada únicamente para este entorno de datos sintéticos y publicada en localhost.
- JDBC: `jdbc:postgresql://127.0.0.1:5433/silabus_pruebas`

El archivo de entorno de ejemplo está intencionalmente vacío: evita que Compose cargue el `.env` habitual del proyecto. El volumen `silabus-pruebas_postgres_data` conserva los datos al detener el servicio. `docker compose --env-file docs/config/pruebas.env.example -f compose.pruebas.yml down` lo detiene sin borrar el volumen. No usar `down -v` si se quieren conservar los datos locales.

La base se crea vacía. Antes de iniciar el backend habitual contra ella, hay que preparar un arranque aislado que no herede conexiones a Aiven, correo o Gemini. No alcanza con cambiar únicamente el nombre de la base en la configuración de producción.

## Cargar el seeder existente sin iniciar el servidor

Con el PostgreSQL local iniciado, desde `Backend`:

```powershell
mvn -o '-Dspring.config.location=classpath:application-isolated.properties' '-Dsilabus.seed.local=true' '-Dtest=LocalDatabaseSeedTest' test
```

`LocalDatabaseSeedTest` utiliza `DatabaseSeeder` sin cambiar su contenido. Importa únicamente el contexto de persistencia, los repositorios y el codificador de contraseñas. La conexión está fijada en código a `127.0.0.1:5433/silabus_pruebas`, y comprueba la base antes de generar el esquema. Crea/actualiza las tablas únicamente allí, no ejecuta Flyway y confirma los datos de la carga.

El lanzador se omite en las ejecuciones normales: requiere explícitamente `silabus.seed.local=true`. No inicia el servidor web ni los servicios de correo o Gemini. No muestra credenciales. Las condiciones del seeder original se conservan: departamentos/carreras se cargan cuando no hay departamentos, y el administrador cuando no hay usuarios.

Resultado local del 2026-11-03: carga completada y persistencia comprobada mediante otra conexión a PostgreSQL. Se registraron 17 departamentos, 74 carreras, 74 planes, un usuario y 17 vínculos de usuario con departamento. Cada vínculo tiene los roles `ADMINISTRACION`, `DOCENTE` y `SYSTEM_ADMIN`. Áreas, materias y programas quedaron vacíos. El primer intento falló por conexión local rechazada; se repitió después de iniciar Docker y comprobar la salud del contenedor.

Esta carga no cambia la conexión del backend habitual. Para desarrollo manual, usar los lanzadores siguientes.

## Backend y frontend locales para pruebas manuales

Con Docker Desktop iniciado, abrir tres terminales PowerShell en la raíz del repositorio.

Primera terminal, base de datos:

```powershell
docker compose --env-file docs/config/pruebas.env.example -f compose.pruebas.yml up -d --wait --pull never
```

Segunda terminal, backend:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\dev-backend.ps1
```

Tercera terminal, frontend:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\dev-frontend.ps1
```

Abrir `http://localhost:3001/login`. El backend escucha en `127.0.0.1:8081`; su salud se consulta en `http://127.0.0.1:8081/actuator/health`. Estos puertos se eligieron para no interferir con los habituales 3000 y 8080. Si están ocupados, detener la instancia local correspondiente antes de repetir; los lanzadores no matan procesos existentes ni buscan puertos alternativos.

El backend carga exclusivamente `application-dev-local.properties` y activa el perfil `dev-local`. Su `DataSource` apunta en código a `127.0.0.1:5433/silabus_pruebas` y verifica el destino antes de entregar la conexión a Hibernate. No utiliza la URL habitual ni requiere credenciales externas. Hibernate valida el esquema, no lo actualiza. Flyway y la inicialización por SQL están deshabilitados. El seeder habitual se ejecuta con sus condiciones originales: si las tablas de departamentos y usuarios ya están pobladas, no vuelve a cargarlas. Las operaciones manuales posteriores sí escriben en esta base persistente.

La clave JWT se genera al arrancar; los tokens locales dejan de ser válidos al reiniciar el backend. No se modifica la autorización de las acciones. La cookie permite HTTP solo cuando el frontend está en desarrollo y el lanzador habilita expresamente `SILABUS_DEV_LOCAL=true`. En producción conserva los atributos anteriores.

El correo se simula con una línea de log sin destinatarios, cuerpos, enlaces ni tokens. No se puede verificar recepción, activar usuarios por invitación ni recuperar contraseñas mediante correo en este modo. El formateo APA devuelve un error de validación comprensible, sin llamar a Gemini. Los proveedores originales se conservan para los otros perfiles.

El frontend recibe `NEXT_PUBLIC_API_URL=http://127.0.0.1:8081` desde el lanzador, por encima de `.env.local`, sin modificar ese archivo. La telemetría de Next se deshabilita en ese proceso. El layout existente todavía declara fuentes de Google; su carga requiere revisión antes de verificar la página sin accesos externos.

Maven se ejecuta sin red (`-o`) y npm usa las dependencias instaladas; estos lanzadores no instalan ni actualizan paquetes. Detener backend y frontend con `Ctrl+C` en sus respectivas terminales. La base conserva sus datos; para detenerla sin borrarlos, usar el comando `down` indicado arriba.

Verificación del 2026-11-03: dos pruebas de selección de proveedores y cuatro de cookies aprobadas. TypeScript sin errores al repetir la comprobación después de la regeneración de tipos de Next; el primer intento coincidió con esa regeneración y encontró archivos faltantes. Backend iniciado con el perfil `dev-local`, esquema validado y salud `UP`. Frontend iniciado en 3001; su proxy `/api-proxy/actuator/health` respondió `UP` desde el backend local. La base mantiene 17 departamentos, un usuario y cero programas. No se inició sesión ni se verificó todavía la página de login o el circuito completo desde el navegador.


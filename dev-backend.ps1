$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'Backend')

Write-Host 'Backend local: http://127.0.0.1:8081 - Base: 127.0.0.1:5433/silabus_pruebas'
Write-Host 'Correo simulado. Gemini deshabilitado. Esquema en modo validate.'
# La ubicación explícita evita cargar application.properties y sus imports.
& mvn -o '-Dmaven.compiler.useIncrementalCompilation=false' '-Dspring-boot.run.jvmArguments=-Dspring.devtools.restart.enabled=false' '-Dspring-boot.run.arguments=--spring.config.location=classpath:application-dev-local.properties --spring.profiles.active=dev-local --server.address=127.0.0.1 --server.port=8081 --spring.jpa.hibernate.ddl-auto=validate --spring.flyway.enabled=false --spring.sql.init.mode=never' spring-boot:run
exit $LASTEXITCODE

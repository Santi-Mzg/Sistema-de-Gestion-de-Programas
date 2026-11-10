param([switch]$DefinirContrasenas)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'Backend')
if (Test-Path Env:SILABUS_FIXTURE_PASSWORD) {
    throw 'La variable reservada del fixture ya está definida. Ejecutar en una terminal nueva.'
}

$argumentosFixture = @('-o', '-Dmaven.compiler.useIncrementalCompilation=false',
    '-Dspring.config.location=classpath:application-isolated.properties',
    '-Dsilabus.fixture.local=true', '-Dtest=LocalManualFixtureTest', 'test')
try {
    if ($DefinirContrasenas) {
        $passwordFixtureSegura = Read-Host 'Nueva contraseña común para las seis cuentas locales de prueba' -AsSecureString
        $punteroFixture = [IntPtr]::Zero
        try {
            $punteroFixture = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordFixtureSegura)
            $env:SILABUS_FIXTURE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($punteroFixture)
            if ([string]::IsNullOrWhiteSpace($env:SILABUS_FIXTURE_PASSWORD)) { throw 'La contraseña no puede estar vacía.' }
        } finally {
            if ($punteroFixture -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($punteroFixture) }
            $passwordFixtureSegura.Dispose()
        }
        $argumentosFixture = @('-Dsilabus.fixture.passwords=true') + $argumentosFixture
    }
    Write-Host 'Carga local DCIC: no modifica al administrador, cargos ni programas ya existentes.'
    & mvn @argumentosFixture
    $resultadoFixture = $LASTEXITCODE
} finally {
    Remove-Item Env:SILABUS_FIXTURE_PASSWORD -ErrorAction SilentlyContinue
}
exit $resultadoFixture

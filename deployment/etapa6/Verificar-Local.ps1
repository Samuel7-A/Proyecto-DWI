[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$names = @('SPRING_PROFILES_ACTIVE','SPRING_DATASOURCE_URL','SPRING_DATASOURCE_DRIVER_CLASS_NAME','SPRING_DATASOURCE_USERNAME','SPRING_DATASOURCE_PASSWORD','SPRING_JPA_HIBERNATE_DDL_AUTO','SPRING_SQL_INIT_MODE','SPRING_APPLICATION_JSON','SUPABASE_DB_URL','SUPABASE_DB_USERNAME','SUPABASE_DB_PASSWORD','JWT_SECRET','CINEVERSE_ALLOWED_ORIGINS','CINEVERSE_API_ORIGIN','JAVA_TOOL_OPTIONS','JDK_JAVA_OPTIONS','_JAVA_OPTIONS','MAVEN_OPTS','MAVEN_ARGS','SPRING_CONFIG_LOCATION','SPRING_CONFIG_ADDITIONAL_LOCATION')
$saved = @{}
foreach ($name in $names) { $saved[$name] = [Environment]::GetEnvironmentVariable($name,'Process'); [Environment]::SetEnvironmentVariable($name,$null,'Process') }
function CheckExit([string]$step) { if ($LASTEXITCODE -ne 0) { throw "$step fallido (exit $LASTEXITCODE)" } }
Push-Location
try {
    $env:SPRING_PROFILES_ACTIVE = 'test'
    $env:SPRING_DATASOURCE_URL = 'jdbc:h2:mem:cineverse-etapa6;DB_CLOSE_DELAY=-1'
    $env:SPRING_DATASOURCE_DRIVER_CLASS_NAME = 'org.h2.Driver'
    $env:SPRING_DATASOURCE_USERNAME = 'sa'
    $env:SPRING_DATASOURCE_PASSWORD = ''
    $env:SPRING_JPA_HIBERNATE_DDL_AUTO = 'create-drop'
    $env:SPRING_SQL_INIT_MODE = 'never'
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $bytes = New-Object byte[] 32; $rng.GetBytes($bytes); $env:JWT_SECRET = [Convert]::ToBase64String($bytes) } finally { $rng.Dispose() }
    Set-Location (Join-Path $repo 'backend')
    & .\mvnw.cmd clean test
    CheckExit 'Backend H2'
    Set-Location (Join-Path $repo 'frontend')
    & npm.cmd ci
    CheckExit 'npm ci'
    & npm.cmd test -- --watch=false
    CheckExit 'Angular tests'
    $env:CINEVERSE_API_ORIGIN = 'https://cineverse-api.example.invalid'
    & npm.cmd run build:render
    CheckExit 'Angular build Render'
    & npm.cmd run build
    CheckExit 'Angular build local'
    Write-Host 'VERIFICACION LOCAL OK: H2 + Angular + build Render simulado.' -ForegroundColor Green
} finally {
    Pop-Location
    foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name,$saved[$name],'Process') }
}

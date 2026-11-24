[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Api,[Parameter(Mandatory=$true)][string]$Web)
$ErrorActionPreference = 'Stop'
foreach ($u in @($Api,$Web)) {
    $p = [Uri]$u
    if (-not $p.IsAbsoluteUri -or $p.Scheme -ne 'https' -or $p.AbsolutePath -ne '/' -or $p.Query -or $p.Fragment -or $p.UserInfo) { throw 'Usa solo el origen HTTPS, sin rutas ni credenciales.' }
}
$Api=$Api.TrimEnd('/'); $Web=$Web.TrimEnd('/')
function Status([string]$url, [string]$method='GET', [hashtable]$headers=@{}) {
    try { $r = Invoke-WebRequest -UseBasicParsing -Uri $url -Method $method -Headers $headers -TimeoutSec 120; return @{ Code=[int]$r.StatusCode; Headers=$r.Headers; Content=$r.Content } }
    catch { if ($_.Exception.Response) { return @{ Code=[int]$_.Exception.Response.StatusCode; Headers=$_.Exception.Response.Headers; Content='' } }; throw }
}
$r=Status "$Api/api/peliculas"; if ($r.Code -ne 200) { throw "Peliculas: $($r.Code)" }; $null=ConvertFrom-Json $r.Content
Write-Host 'PASS: GET peliculas 200 (API y BD)' -ForegroundColor Green
foreach ($path in @('/api/productos','/api/funciones')) { $r=Status "$Api$path"; if($r.Code -ne 200){throw "$path : $($r.Code)"}; Write-Host "PASS: $path 200" }
$r=Status "$Api/api/ordenes"; if($r.Code -ne 401){throw "Ordenes sin token: $($r.Code)"}; Write-Host 'PASS: ordenes protegidas 401'
$h=@{Origin=$Web;'Access-Control-Request-Method'='GET';'Access-Control-Request-Headers'='Authorization'}
$r=Status "$Api/api/peliculas" 'OPTIONS' $h
if($r.Code -notin @(200,204) -or ($r.Headers['Access-Control-Allow-Origin'] -join '') -ne $Web){throw 'CORS del frontend rechazado'}
Write-Host 'PASS: CORS correcto'
$h.Origin='https://otro.example.invalid'; $r=Status "$Api/api/peliculas" 'OPTIONS' $h
if($r.Code -ne 403 -or $r.Headers['Access-Control-Allow-Origin']){throw 'CORS ajeno no rechazado'}
Write-Host 'PASS: CORS ajeno rechazado'
foreach($path in @('/','/cartelera','/login')){ $r=Status "$Web$path"; if($r.Code -ne 200 -or $r.Content -notmatch '<app-root'){throw "SPA $path : $($r.Code)"}; Write-Host "PASS: SPA $path" }
Write-Host 'VERIFICACION PUBLICA DE SOLO LECTURA OK' -ForegroundColor Green

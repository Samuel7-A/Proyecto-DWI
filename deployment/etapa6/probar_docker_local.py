"""Smoke de imagen con BD de Docker aislada; no lee variables ni conecta a Supabase."""
from pathlib import Path
import base64, json, secrets, subprocess, time, urllib.request, urllib.error

ROOT = Path(__file__).resolve().parents[2]
suffix = secrets.token_hex(5)
network = 'cv6-net-' + suffix
pg = 'cv6-pg-' + suffix
api = 'cv6-api-' + suffix
image = 'cineverse-etapa6:' + suffix
password = secrets.token_hex(24)
db = 'cv6_' + suffix
origin = 'https://cineverse-web.example.invalid'

def docker(*args, data=None, check=True, capture=False):
    return subprocess.run(['docker', *args], input=data, check=check, stdout=subprocess.PIPE if capture else None, stderr=subprocess.PIPE if capture else None)

def request(path, method='GET', headers=None):
    req = urllib.request.Request(base + path, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status, res.headers, res.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()

created_net = created_pg = created_api = False
try:
    docker('build', '-t', image, str(ROOT / 'backend'))
    docker('network', 'create', network, capture=True); created_net = True
    docker('run', '-d', '--name', pg, '--network', network, '--network-alias', 'pg', '-e', 'POSTGRES_PASSWORD=' + password, '-e', 'POSTGRES_DB=' + db, 'postgres:17', capture=True); created_pg = True
    for _ in range(60):
        if docker('exec', pg, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres', '-d', db, check=False, capture=True).returncode == 0:
            break
        time.sleep(1)
    else: raise RuntimeError('PostgreSQL local no inició')
    migrations = ROOT / 'database/etapa5/migrations'
    for name in ['ETAPA5_BASELINE_SOLO_BD_VACIA.sql','ETAPA5_02_integridad_PROPUESTA.sql']:
        docker('exec','-i',pg,'psql','-U','postgres','-d',db,'-v','ON_ERROR_STOP=1',data=(migrations/name).read_bytes(),capture=True)
    jwt = base64.b64encode(secrets.token_bytes(32)).decode()
    docker('run','-d','--name',api,'--network',network,'--memory=512m','--memory-swap=512m','--cpus=1','-p','127.0.0.1::10000',
           '-e','PORT=10000','-e','SPRING_PROFILES_ACTIVE=supabase,cloud','-e','SUPABASE_DB_URL=jdbc:postgresql://pg:5432/'+db,
           '-e','SUPABASE_DB_USERNAME=postgres','-e','SUPABASE_DB_PASSWORD='+password,'-e','JWT_SECRET='+jwt,
           '-e','CINEVERSE_ALLOWED_ORIGINS='+origin,image,capture=True); created_api = True
    port = docker('port',api,'10000/tcp',capture=True).stdout.decode().strip().split(':')[-1]
    base = 'http://127.0.0.1:' + port
    for _ in range(120):
        try:
            code, _, body = request('/api/peliculas')
            if code == 200 and isinstance(json.loads(body),list): break
        except (OSError, ValueError): pass
        if docker('inspect','-f','{{.State.Running}}',api,capture=True).stdout.strip() != b'true':
            raise RuntimeError('Backend terminó antes de iniciar')
        time.sleep(2)
    else: raise RuntimeError('No responde el backend local')
    print('PASS: Docker + PostgreSQL 17 + perfil cloud + puerto asignado + Hibernate validate')
    assert request('/api/ordenes')[0] == 401
    print('PASS: endpoint protegido sin JWT devuelve 401')
    headers = {'Origin': origin,'Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'Authorization'}
    code,h,_=request('/api/peliculas','OPTIONS',headers)
    assert code in (200,204) and h.get('Access-Control-Allow-Origin') == origin
    print('PASS: CORS permite el origen exacto')
    headers['Origin']='https://otro.example.invalid'
    code,h,_=request('/api/peliculas','OPTIONS',headers)
    assert code == 403 and not h.get('Access-Control-Allow-Origin')
    print('PASS: CORS rechaza origen ajeno')
    count=docker('exec',pg,'psql','-U','postgres','-d',db,'-Atc','SELECT (SELECT count(*) FROM usuarios)+(SELECT count(*) FROM productos)+(SELECT count(*) FROM funciones)',capture=True).stdout.strip()
    assert count == b'0'
    print('PASS: inicializadores demo desactivados; BD de prueba sin semillas')
    print('RESULTADO DOCKER LOCAL: 5 PASS; Supabase no contactado')
except Exception:
    if created_api: docker('logs','--tail','80',api,check=False)
    raise
finally:
    if created_api: docker('rm','-f',api,check=False,capture=True)
    if created_pg: docker('rm','-f','-v',pg,check=False,capture=True)
    if created_net: docker('network','rm',network,check=False,capture=True)
    docker('image','rm',image,check=False,capture=True)

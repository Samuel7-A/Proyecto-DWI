"""Integracion Spring Boot + PostgreSQL 17 descartable. Nunca usa Supabase real."""
from pathlib import Path
import base64
import os
import re
import secrets
import subprocess
import time

ROOT=Path(__file__).resolve().parents[1]
REPO=ROOT.parents[1]
NAME='cineverse-spring-it-'+secrets.token_hex(6)
DB='cv5_it_'+secrets.token_hex(6)
PASSWORD=secrets.token_hex(24)


def docker(*args, data=None, check=True, timeout=180):
    result=subprocess.run(['docker',*args],input=data,text=True,encoding='utf-8',errors='replace',capture_output=True,timeout=timeout)
    if check and result.returncode:
        raise RuntimeError(result.stderr or result.stdout or 'Docker error')
    return result


def sql(code):
    return docker('exec','-i',NAME,'psql','-X','-U','postgres','-d',DB,'-v','ON_ERROR_STOP=1',data=code)


def main():
    docker('info')
    created=False
    try:
        print('Creando PostgreSQL local:',NAME,flush=True)
        docker('run','-d','--name',NAME,'-p','127.0.0.1::5432','-e','POSTGRES_PASSWORD='+PASSWORD,'-e','POSTGRES_DB='+DB,'postgres:17',timeout=600)
        created=True
        for _ in range(90):
            if docker('exec',NAME,'pg_isready','-U','postgres','-d',DB,check=False).returncode==0:
                try:
                    sql('SELECT 1;')
                    break
                except RuntimeError:
                    pass
            time.sleep(1)
        else:
            raise RuntimeError('PostgreSQL local no iniciado')
        for name in ('ETAPA5_BASELINE_SOLO_BD_VACIA.sql','ETAPA5_02_integridad_PROPUESTA.sql'):
            sql((ROOT/'migrations'/name).read_text(encoding='utf-8'))
            print(name,'OK',flush=True)
        mapping=docker('port',NAME,'5432/tcp').stdout.strip()
        match=re.fullmatch(r'127\.0\.0\.1:(\d+)',mapping)
        if not match:
            raise RuntimeError('Puerto local no esperado; cancelar')
        # Aislar configuracion heredada del proyecto real. No leer ni copiar .env.
        env={k:v for k,v in os.environ.items() if not k.upper().startswith(('SPRING_','SUPABASE_','CV5_','JWT_','PG')) and k.upper() not in ('JAVA_TOOL_OPTIONS','JDK_JAVA_OPTIONS','_JAVA_OPTIONS','MAVEN_OPTS','MAVEN_ARGS')}
        env.update(CV5_PG_PORT=match[1],CV5_PG_DATABASE=DB,CV5_PG_PASSWORD=PASSWORD,
                   SUPABASE_DB_URL='jdbc:postgresql://127.0.0.1:'+match[1]+'/'+DB,
                   SUPABASE_DB_USERNAME='postgres',SUPABASE_DB_PASSWORD=PASSWORD,
                   JWT_SECRET=base64.b64encode(secrets.token_bytes(32)).decode('ascii'))
        args=['-B','-Dtest=PostgresEtapa5IT','-DfailIfNoTests=true','test']
        cmd=['cmd.exe','/d','/c','mvnw.cmd',*args] if os.name=='nt' else ['bash','mvnw',*args]
        result=subprocess.run(cmd,cwd=REPO/'backend',env=env,timeout=900)
        if result.returncode:
            raise RuntimeError('Maven fallo: '+str(result.returncode))
        import xml.etree.ElementTree as ET
        report=REPO/'backend'/'target'/'surefire-reports'/'TEST-com.cineverse.backend.service.PostgresEtapa5IT.xml'
        suite=ET.parse(report).getroot()
        if any(int(suite.get(k,'0')) for k in ('failures','errors','skipped')) or int(suite.get('tests','0'))!=4:
            raise RuntimeError('No se confirmaron las cuatro pruebas esperadas')
        print('RESULTADO SPRING + POSTGRESQL LOCAL: 4 PASS / 0 FAIL',flush=True)
    finally:
        if created:
            result=docker('rm','-f','-v',NAME,check=False)
            if result.returncode:
                print('No se pudo retirar el contenedor temporal:',NAME)

if __name__=='__main__':
    main()

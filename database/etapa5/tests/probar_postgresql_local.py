"""Pruebas PostgreSQL 17 en un contenedor nuevo sin puertos ni credenciales remotas."""
from pathlib import Path
import concurrent.futures as cf
import secrets, subprocess, time

ROOT=Path(__file__).resolve().parents[1]
NAME='cineverse-etapa5-test-'+secrets.token_hex(5)
IMAGE='postgres:17'

def docker(*args, data=None, check=True, timeout=180):
    r=subprocess.run(['docker',*args],input=data,text=True,encoding='utf-8',errors='replace',capture_output=True,timeout=timeout)
    if check and r.returncode:
        raise RuntimeError(r.stderr or r.stdout or f'Error {r.returncode}')
    return r

def sql(code, check=True):
    return docker('exec','-i',NAME,'psql','-X','-U','postgres','-d','cineverse_test','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose',data=code,check=check)

def file(path):
    return sql((ROOT/path).read_text(encoding='utf-8'))

def main():
    docker('info'); print('Creando contenedor aislado:',NAME,flush=True)
    created=False
    try:
        docker('run','-d','--name',NAME,'-e','POSTGRES_PASSWORD='+secrets.token_urlsafe(24),'-e','POSTGRES_DB=cineverse_test',IMAGE,timeout=600); created=True
        for _ in range(90):
            if docker('exec',NAME,'pg_isready','-U','postgres','-d','cineverse_test',check=False).returncode==0:
                if sql('SELECT 1;',check=False).returncode==0: break
            time.sleep(1)
        else: raise RuntimeError('PostgreSQL local no iniciado')
        for path in ['migrations/ETAPA5_BASELINE_SOLO_BD_VACIA.sql','migrations/ETAPA5_02_integridad_PROPUESTA.sql','migrations/ETAPA5_02_integridad_PROPUESTA.sql','tests/ETAPA5_pruebas_postgresql.sql']:
            r=file(path); print(path, 'OK', flush=True)
            if 'pruebas_' in path: print(r.stderr)
        sql("INSERT INTO public.peliculas(titulo,genero,duracion_minutos,clasificacion,fecha_estreno,estado) VALUES('CV concurrente','Drama',120,'APT',current_date,true); INSERT INTO public.salas(nombre,filas,columnas) VALUES('CV concurrente',2,2);")
        insert="INSERT INTO public.funciones(pelicula_id,sala_id,fecha_hora,fecha_hora_fin,precio) SELECT p.id,s.id,'2035-03-01 10:00','2035-03-01 12:00',18 FROM public.peliculas p CROSS JOIN public.salas s WHERE p.titulo='CV concurrente' AND s.nombre='CV concurrente';"
        # Dos conexiones independientes; una mantiene la transaccion abierta.
        with cf.ThreadPoolExecutor(max_workers=2) as ex:
            a=ex.submit(sql,'BEGIN; '+insert+' SELECT pg_sleep(2); COMMIT;',False)
            b=ex.submit(sql,'BEGIN; '+insert+' SELECT pg_sleep(2); COMMIT;',False)
            results=[a.result(),b.result()]
        ok=[r for r in results if r.returncode==0]; rejected=[r for r in results if r.returncode!=0 and '23P01' in r.stderr]
        assert len(ok)==1 and len(rejected)==1, [(r.returncode,r.stderr) for r in results]
        count=sql("SELECT count(*) FROM public.funciones f JOIN public.salas s ON s.id=f.sala_id WHERE s.nombre='CV concurrente';").stdout
        print(count)
        assert any(line.strip()=='1' for line in count.splitlines()), count
        print('PASS: dos conexiones simultaneas, una funcion confirmada y otra rechazada (23P01)')
        print('RESULTADO: 11 pruebas SQL + 1 de concurrencia; migracion repetida correctamente.')
    finally:
        if created:
            r=docker('rm','-f','-v',NAME,check=False)
            if r.returncode: print('No se pudo retirar el contenedor de prueba:',NAME)
if __name__=='__main__': main()

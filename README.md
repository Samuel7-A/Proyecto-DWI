# 🎬 CineVerse

Sistema web académico para la gestión de cartelera de cine, funciones, salas, asientos, productos de dulcería y compra simulada de entradas.

Proyecto del curso **Desarrollo Web Integrado** · Lima, 2026.
CineVerse es un sistema independiente: **no** se integra ni representa a Cineplanet ni a ninguna empresa real, y **no** procesa pagos reales.

> **Estado de este documento:** actualizado el **6 de octubre de 2026** sobre el commit `8359c98`.
> Todo lo marcado como ✅ existe en el código. Todo lo marcado como 🚧 **todavía no existe**: tiene responsable y fecha. Quien termine su parte actualiza su fila en la sección 2.

---

## 1. Qué es CineVerse

Un cliente podrá consultar la cartelera, elegir una función, seleccionar asientos libres, agregar productos de dulcería y generar una orden. Un administrador gestiona películas, salas, funciones y productos.

El proyecto crece por avances:

| Avance | Contenido |
|---|---|
| **APF1** (entregado) | Módulo Películas: API REST + JPA/Hibernate + H2 + frontend temporal + pruebas unitarias |
| **APF2** (entrega: **sábado 10-oct-2026**) | Modelo de datos completo, JPQL, transacciones, Spring Security, roles y JWT. Informe: 2.5, 2.6, Cap. III y 4.1–4.3 |
| APF3 | Frontend definitivo con Angular |
| Proyecto final | Flujo completo de compra, despliegue y documentación final |

---

## 2. Estado actual del Avance 2

### ✅ Ya implementado (en `main`)

| Área | Detalle |
|---|---|
| Entidades JPA (9) | `Pelicula`, `Usuario`, `Sala`, `Asiento`, `Funcion`, `Producto`, `Orden`, `Entrada`, `DetalleProducto` + enum `Rol` |
| Relaciones | 9 `@ManyToOne` LAZY y 4 restricciones únicas (ver sección 5) |
| Repositories (9) | Uno por entidad |
| JPQL (8 consultas) | Cartelera, búsqueda por título, por género, combinada, funciones por película, asientos disponibles, asientos ocupados, órdenes por usuario |
| Películas | CRUD completo + `/cartelera`, `/buscar`, `/genero/{genero}` |
| Autenticación | `POST /api/auth/login` con BCrypt y JWT (jjwt 0.12.6, HS256, 24 h) |
| Autorización | Roles `ADMIN` y `CLIENTE` guardados en BD; reglas para `/api/peliculas` |
| Seguridad | Filtro JWT, CORS configurado, `DataInitializer` (2 usuarios de desarrollo) |
| Transacciones | `@Transactional` en `PeliculaService`; test de rollback |
| Tests | **15 pruebas** automatizadas (resultado registrado por Samuel el 6-oct) |
| Frontend temporal | Inicio, cartelera, detalle, próximamente y panel admin (lectura) |

### 🚧 Pendiente: reparto del Avance 2

| Pieza | Responsable | Estado |
|---|---|---|
| `GlobalExceptionHandler` + excepciones propias | Samuel | 🚧 |
| `POST /api/auth/register` | Samuel | 🚧 |
| Limpiar `JwtAuthenticationFilter` (`System.out.println`) | Samuel | 🚧 |
| Quitar `UserDetailsService` en memoria de `SecurityConfig` | Samuel | 🚧 |
| Reglas de seguridad de los endpoints nuevos | Samuel | 🚧 |
| Mover propiedades de test a `src/test/resources/` | Samuel | 🚧 |
| Swagger/OpenAPI (dependencia + configuración) | Samuel | 🚧 |
| Checkout de orden con transacción | Samuel | 🚧 |
| Módulo Funciones (service, controller, DTOs) | See | 🚧 |
| Tests de las consultas JPQL de películas | See | 🚧 |
| Colección Postman | See | 🚧 |
| Módulo Productos (service, controller, DTOs) | Frank | 🚧 |
| Catálogo público de productos (frontend) | Frank | 🚧 |
| Ajustes del frontend público | Frank | 🚧 |
| Módulo Salas + generación de asientos (transacción) | Crhistian | 🚧 |
| Login del frontend (`login.html`, `auth.js`) | Crhistian | 🚧 |
| Panel admin con JWT y control por rol | Crhistian | 🚧 |
| Informe, diagramas y evidencias | Todos | 🚧 |

---

## 3. Tecnologías (las que realmente usa el proyecto)

| Capa | Tecnología |
|---|---|
| Lenguaje | Java 21 |
| Framework | Spring Boot 4.1.1 (Maven Wrapper) |
| API | Spring Web MVC (REST, JSON) |
| Persistencia | Spring Data JPA + Hibernate |
| Base de datos | **H2 en archivo** (`jdbc:h2:file:./data/cineverse`) |
| Validación | Bean Validation (`spring-boot-starter-validation`) |
| Seguridad | Spring Security + JWT (`jjwt-api/impl/gson` 0.12.6) |
| Pruebas | JUnit 5, Mockito, MockMvc, Spring Security Test |
| Documentación API | 🚧 springdoc-openapi 3.0.x (Swagger UI) |
| Frontend temporal | HTML5, CSS3, JavaScript, Bootstrap 5.3.3 (CDN), Live Server |
| Herramientas | VS Code, Git/GitHub, Postman, consola H2 |

**No se usan en este avance:** Angular, MySQL/PostgreSQL, Lombok, Docker, OAuth2, refresh tokens.
H2 se mantiene como motor de desarrollo; migrar a MySQL/PostgreSQL implicaría cambiar solo URL, driver y dialecto (JPA es portable) y se hará si el docente lo exige.

> Se usa `jjwt-gson` y **no** `jjwt-jackson`, porque Spring Boot 4 usa Jackson 3 y jjwt-jackson depende de Jackson 2.

---

## 4. Arquitectura y estructura del repositorio

```
Frontend temporal (HTML/CSS/JS + Bootstrap, Live Server :5500)
        │  HTTP + JSON   ·   Authorization: Bearer <JWT>
        ▼
CORS → JwtAuthenticationFilter → reglas por rol (SecurityConfig)
        ▼
Controller  →  Service (@Transactional)  →  Repository (JPA + JPQL)
                                               ▼
                                        Hibernate → H2
```

```
Proyecto-DWI/
├── backend/
│   └── src/main/java/com/cineverse/backend/
│       ├── CineverseBackendApplication.java
│       ├── DataInitializer.java        # usuarios de desarrollo
│       ├── controller/                 # AuthController, PeliculaController
│       ├── dto/                        # LoginRequest, LoginResponse
│       ├── entity/                     # 9 entidades + Rol
│       ├── exception/                  # PeliculaNotFoundException
│       ├── repository/                 # 9 repositories (JPQL en 4 de ellos)
│       ├── security/                   # JwtService, JwtAuthenticationFilter, SecurityConfig
│       └── service/                    # AuthService, PeliculaService
├── frontend-temp/{html,css,js}/
└── docs/                               # 🚧 postman/ · diagramas/ · evidencias/
```

Arquitectura por capas: **Controller** (HTTP) → **Service** (reglas y transacciones) → **Repository** (acceso a datos) → **Entity** (tablas).

---

## 5. Modelo de datos

| Entidad | Tabla | Atributos principales | Relaciones |
|---|---|---|---|
| Pelicula | `peliculas` | titulo, sinopsis, genero, duracionMinutos, clasificacion (`APT/+12/+14/+18`), fechaEstreno, imagenUrl, estado | 1→N Funcion |
| Usuario | `usuarios` | nombre, email (**único**), password (BCrypt), rol (`ADMIN/CLIENTE`), activo | 1→N Orden |
| Sala | `salas` | nombre (**único**), filas, columnas | 1→N Asiento, 1→N Funcion |
| Asiento | `asientos` | fila (una letra A–Z), numero | N→1 Sala. **Único (sala, fila, número)** |
| Funcion | `funciones` | fechaHora, fechaHoraFin, precio | N→1 Pelicula, N→1 Sala |
| Producto | `productos` | nombre, categoria (`CANCHITA/BEBIDA/DULCE/COMBO`), precio, activo | 1→N DetalleProducto |
| Orden | `ordenes` | estado (`PENDIENTE/PAGADA/CANCELADA`), total, fechaCreacion | N→1 Usuario; 1→N Entrada; 1→N DetalleProducto |
| Entrada | `entradas` | precioUnitario | N→1 Orden, Funcion, Asiento. **Único (función, asiento)** |
| DetalleProducto | `detalle_productos` | cantidad, precioUnitario | N→1 Orden, N→1 Producto |

- La disponibilidad de un asiento depende de la **función** (RN05): un asiento está ocupado si existe una `Entrada` para esa función.
- La restricción única `(función, asiento)` impide en la base de datos que dos compras ocupen el mismo asiento (RN06).
- `Pago` y `Ticket` aparecen en el diseño general pero **no se implementan en el Avance 2**: el checkout crea la orden directamente en estado `PAGADA` (pago simulado implícito).

---

## 6. Reglas de negocio vigentes

- **RN01** Solo las películas activas (`estado = true`) se muestran en la cartelera pública.
- **RN02–RN04** Una función pertenece a una película y una sala; una sala tiene muchos asientos.
- **RN05** La disponibilidad se calcula por función, no por asiento físico.
- **RN06** Un asiento no se puede vender dos veces para la misma función.
- **RN07–RN09** Los productos son opcionales; una orden tiene uno o más asientos y cero o más productos.
- **RN10** `total = Σ (precio de la función × asientos) + Σ (precio del producto × cantidad)`.
- **RN11** Los pagos son simulados; no se solicita información financiera real.
- **RN15** Roles: `CLIENTE` y `ADMIN`.
- **RN16** Las operaciones administrativas requieren JWT con rol `ADMIN`.

---

## 7. API REST

Base URL: `http://localhost:8080`

### ✅ Disponible hoy

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| POST | `/api/auth/login` | Público | 200 |
| GET | `/api/peliculas` | Público | 200 (devuelve **todas**, incluidas inactivas) |
| GET | `/api/peliculas/{id}` | Público | 200, 404 |
| GET | `/api/peliculas/cartelera` | Público | 200 (solo activas) |
| GET | `/api/peliculas/buscar?titulo=` o `?texto=` | Público | 200, 400 si faltan ambos |
| GET | `/api/peliculas/genero/{genero}` | Público | 200 |
| POST | `/api/peliculas` | ADMIN | 201, 400, 401, 403 |
| PUT | `/api/peliculas/{id}` | ADMIN | 200, 400, 404, 401, 403 |
| DELETE | `/api/peliculas/{id}` | ADMIN | 204, 404, 401, 403 |

### 🚧 En desarrollo (rutas ya acordadas)

| Método | Ruta | Acceso | Responsable |
|---|---|---|---|
| POST | `/api/auth/register` | Público (siempre crea `CLIENTE`) | Samuel |
| GET/POST/PUT/DELETE | `/api/salas`, `/api/salas/{id}` | **Solo ADMIN** | Crhistian |
| GET | `/api/funciones`, `/api/funciones?peliculaId=`, `/api/funciones/{id}` | Público | See |
| GET | `/api/funciones/{id}/asientos/disponibles` · `/ocupados` | Público | See |
| POST/PUT/DELETE | `/api/funciones[/{id}]` | ADMIN | See |
| GET | `/api/productos` (solo activos) | Público | Frank |
| POST/PUT/DELETE | `/api/productos[/{id}]` | ADMIN | Frank |
| POST | `/api/ordenes` | CLIENTE | Samuel |
| GET | `/api/ordenes/mis` | CLIENTE | Samuel |

Documentación interactiva (🚧): `http://localhost:8080/swagger-ui.html`

---

## 8. Seguridad

**Flujo:** `POST /api/auth/login` → el servidor devuelve un JWT → el cliente lo envía en cada petición protegida:

```
Authorization: Bearer <token>
```

El token (HS256, 24 h) lleva el email como `subject` y los claims `rol` y `nombre`. El filtro valida la firma, comprueba que el usuario exista y esté activo, y carga el rol desde la **base de datos**.

### Matriz de permisos

| Recurso | Sin login | CLIENTE | ADMIN |
|---|:---:|:---:|:---:|
| Login, registro | ✔ | — | — |
| Consultar películas, funciones, asientos, productos | ✔ | ✔ | ✔ |
| Crear/editar/eliminar películas | ✘ 401 | ✘ 403 | ✔ |
| Crear/editar/eliminar salas (y consultarlas) | ✘ 401 | ✘ 403 | ✔ |
| Crear/editar/eliminar funciones | ✘ 401 | ✘ 403 | ✔ |
| Crear/editar/eliminar productos | ✘ 401 | ✘ 403 | ✔ |
| Crear orden, ver mis órdenes | ✘ 401 | ✔ | ✘ 403 |

### Usuarios de desarrollo (los crea `DataInitializer` en tu H2 local)

| Email | Contraseña | Rol |
|---|---|---|
| `admin@cineverse.com` | `Admin123!` | ADMIN |
| `cliente@cineverse.com` | `Cliente123!` | CLIENTE |

⚠️ Solo para desarrollo local. No usar en ningún entorno público.

---

## 9. Contratos acordados (frontend ↔ backend)

**Respuesta del login**
```json
{ "token": "...", "tipo": "Bearer", "nombre": "...", "email": "...", "rol": "ADMIN" }
```
El frontend guarda el token en `sessionStorage` y usa `rol` para decidir si muestra el panel.

**Formato de error (🚧 lo implementa `GlobalExceptionHandler`)**
```json
{ "status": 400, "mensaje": "Datos inválidos", "errores": { "campo": "mensaje" } }
```
`errores` solo aparece en los 400 de validación.

**Códigos usados:** 200, 201, 204, 400 (validación), 401 (sin token o token inválido), 403 (rol insuficiente), 404 (no existe), 409 (conflicto: asiento ocupado, nombre o email duplicado).

**Checkout (🚧)**
```json
POST /api/ordenes
{ "funcionId": 1, "asientoIds": [10, 11], "productos": [ { "productoId": 2, "cantidad": 1 } ] }
```
El usuario sale del token. Todo ocurre en **una sola transacción**: valida función y asientos (que pertenezcan a la sala de la función), comprueba que no estén ocupados, calcula el total, crea orden + entradas + detalles. Si algo falla (por ejemplo, un asiento ya ocupado → 409), **no queda nada guardado**.

**Contrato de `Pelicula`** (congelado desde APF1; no cambiar nombres sin avisar al equipo)
`id, titulo, sinopsis, genero, duracionMinutos, clasificacion, fechaEstreno, imagenUrl, estado`

**Reglas de módulo acordadas**
- **Salas:** máximo 26 filas (la fila es una letra A–Z). Al crear una sala se generan asientos `A1…A{columnas}`, `B1…`. Nombre repetido → 409. Si falla algo, no queda la sala a medias.
- **Funciones:** película o sala inexistente → 404. `fechaHoraFin` menor o igual a `fechaHora` → 400.
- **Frontend público:** *Cartelera* = películas activas con estreno de hoy o anterior. *Próximamente* = películas activas con estreno futuro. Las inactivas no se muestran.

---

## 10. Cómo ejecutar

**Requisitos:** JDK 21, Git, VS Code con la extensión Live Server.

```bash
git clone https://github.com/Samuel7-A/Proyecto-DWI.git
cd Proyecto-DWI/backend
```

**Backend**
```bash
# Windows
mvnw.cmd spring-boot:run
# Linux / macOS
./mvnw spring-boot:run
```
API en `http://localhost:8080`.

**Consola H2:** `http://localhost:8080/h2-console` → JDBC URL `jdbc:h2:file:./data/cineverse`, usuario `sa`, contraseña vacía.
La carpeta `backend/data/` es **local** y está en `.gitignore`: cada integrante tiene su propia base, por eso los datos de prueba no se comparten por Git.

**Frontend:** abrir `frontend-temp/html/index.html` con Live Server.
> **Importante:** el CORS del backend solo permite los orígenes `localhost`/`127.0.0.1` en los puertos **5500** (Live Server) y 8080. Si Live Server usa otro puerto, las peticiones serán rechazadas.

---

## 11. Testing

Ejecutar: `mvnw.cmd test` (Windows) · `./mvnw test` (Linux/macOS).

**Pruebas existentes (15)**

| Archivo | Pruebas | Cubre |
|---|:---:|---|
| `PeliculaServiceTest` | 3 | buscar por id (existe / no existe), eliminar |
| `PeliculaControllerTest` | 2 | POST 201 y POST 400 |
| `AsientoRepositoryTest` | 1 | asientos disponibles |
| `EntradaRepositoryTest` | 1 | asientos ocupados |
| `FuncionRepositoryTest` | 1 | funciones por película ordenadas |
| `OrdenRepositoryTest` | 1 | órdenes por usuario |
| `SecurityIntegrationTest` | 4 | login 200, sin token 401, CLIENTE 403, ADMIN 201 |
| `PeliculaTransactionTest` | 1 | rollback |
| `CineverseBackendApplicationTests` | 1 | carga del contexto |

**Pruebas mínimas que debe tener cada módulo nuevo**

| Caso | Esperado |
|---|---|
| Endpoint público sin token | 200 |
| Operación ADMIN con token de ADMIN | 201 / 200 |
| Operación ADMIN con token de CLIENTE | 403 |
| Operación protegida sin token | 401 |
| Datos inválidos | 400 |
| Conflicto (asiento ocupado, nombre duplicado) | 409 |

**Convenciones**
- Los tests de integración usan H2 **en memoria**, nunca la base de archivo.
- Los contextos de test comparten la misma BD en memoria: usa **nombres únicos** (por ejemplo con un sufijo `UUID`) en salas, productos y películas para no chocar con las restricciones únicas de otros tests.
- Antes de avisar que terminaste: `mvnw test` en verde en tu rama.

---

## 12. Frontend temporal

| Archivo | Responsable | Estado |
|---|---|---|
| `index.html`, `cartelera.html`, `detalle.html`, `proximamente.html`, `public.css`, `public.js`, `data.js` | Frank | ✅ funcionando (🚧 ajustes de cartelera/próximamente y escape de HTML) |
| `productos.html` (catálogo de productos) | Frank | 🚧 |
| `admin.html`, `admin.css`, `admin.js` | Crhistian | 🟡 lista películas; crear/editar/borrar **rechazados con 401 hasta integrar el JWT** |
| `login.html`, `auth.js` | Crhistian | 🚧 |

El flujo del cliente (elegir función, asientos, productos y orden) **se demuestra con Swagger/Postman**. No se construyen pantallas de compra en este avance.

---

## 13. Responsabilidades del Avance 2

Cada integrante entrega **código + sección del informe + evidencias + diagrama** (cuando corresponda).

### Samuel — seguridad, errores y checkout
- **Código:** `GlobalExceptionHandler` y excepciones (`RecursoNoEncontradoException` 404, `ConflictoException` 409, `SolicitudInvalidaException` 400, `CredencialesInvalidasException` 401); `POST /api/auth/register`; limpieza del filtro JWT; quitar `UserDetailsService` en memoria; reglas de seguridad nuevas; propiedades de test; Swagger; checkout de orden con transacción; tests de login inválido, registro y checkout/rollback.
- **Informe:** Resumen, 2.2.2–2.2.4, 2.5.1, 2.5.2, 2.5.5, 2.6.1, 2.6.3, 3.6 (**+ diagrama de arquitectura**), 4.3, README final.
- **Evidencias:** Swagger, JWT (token decodificado), 401/403, transacción con rollback (SQL antes/después), H2.

### See — Funciones, JPQL y Postman
- **Código:** `FuncionService`, `FuncionController`, DTOs; CRUD; funciones por película; asientos disponibles y ocupados; validar fecha fin > inicio; tests de las consultas JPQL de películas y del módulo; colección Postman con login (guarda el token), un request por endpoint de todos los módulos y el checkout.
- **Informe:** 2.3.2, 2.3.3, 2.4.2, 2.5.3, 2.5.4, 3.4 (**+ diagrama de clases**), 3.5 (**+ modelo relacional**), 4.2 (incluye Swagger con la captura de Samuel).
- **Evidencias:** funciones por película, asientos disponibles/ocupados, JPQL, Postman, `mvnw test`.

### Frank — Productos y frontend público
- **Código:** `ProductoService`, `ProductoController`, DTOs; CRUD; GET público (solo activos), escritura ADMIN; validaciones y tests; catálogo público `productos.html` que muestra los productos y permite elegir cantidades en pantalla (sin enviar nada al servidor); cartelera consumiendo `/api/peliculas/cartelera`; lógica de Próximamente; escapar contenido antes de usar `innerHTML`.
- **Datos demo:** Canchita clásica (CANCHITA, S/ 10), Gaseosa (BEBIDA, S/ 7), Chocolate (DULCE, S/ 6), Combo clásico (COMBO, S/ 20).
- **Informe:** 1.5, 1.6, 3.1.1, 3.1.2, 3.3 (**+ diagrama del modelo de negocio**).
- **Evidencias:** CRUD de productos, permisos ADMIN/CLIENTE, catálogo y cartelera funcionando.

### Crhistian — Salas, login y panel admin
- **Código:** `SalaService`, `SalaController`, DTOs; CRUD; crear sala + generar asientos en una transacción y su test; `login.html` + `auth.js` (login contra `/api/auth/login`, token en `sessionStorage`); `admin.js` envía `Authorization: Bearer`, bloquea el acceso sin sesión o sin rol ADMIN, maneja 401/403 y muestra los mensajes de validación del backend; opciones de administración según rol (dentro de las páginas admin).
- **Informe:** 1.2, 1.3, 1.4, 2.6.2, 3.2 (**+ diagrama de casos de uso**), 4.1.
- **Evidencias:** login, ADMIN en el panel, CLIENTE rechazado, CRUD de película con JWT, sala creada con sus asientos.

### Flujo final que debemos poder demostrar
- **ADMIN:** Películas → Salas → Funciones → Productos.
- **CLIENTE:** login/registro → consultar películas → consultar función → ver asientos → agregar productos → crear orden → total calculado.
- Dos compras **no** pueden ocupar el mismo asiento de una misma función (409).

---

## 14. Flujo de trabajo con Git

- Cada uno trabaja en **su rama** creada desde `main` actualizado: `feat/funcion` (See), `feat/producto-front` (Frank), `feat/sala-login` (Crhistian). Samuel integra en `main`.
- Commits pequeños y claros: `backend: agregar FuncionService`, `frontend: login con JWT`, `docs: agregar diagrama de clases`.
- Antes de avisar que terminaste: `git pull --rebase origin main` y `mvnw test` en verde. Samuel hace el merge.
- **Nunca `git push --force`.** Si Git rechaza el push, avisa a Samuel.

**Archivos que nadie toca salvo su dueño**

| Archivo / carpeta | Dueño |
|---|---|
| `pom.xml`, `application*.properties`, `SecurityConfig`, `GlobalExceptionHandler`, excepciones compartidas, `README.md`, `DataInitializer` | Samuel |
| `FuncionService/Controller` y DTOs de Función, `docs/postman/` | See |
| `ProductoService/Controller` y DTOs de Producto, páginas y JS públicos | Frank |
| `SalaService/Controller` y DTOs de Sala, `login.html`, `auth.js`, `admin.*` | Crhistian |

Si necesitas un cambio en un archivo ajeno, pídelo a su dueño. En el backend usa las excepciones compartidas de Samuel en lugar de crear las tuyas.

---

## 15. Informe y evidencias

El informe se escribe en el **Google Docs compartido**, siguiendo la estructura oficial del docente. Cada uno redacta las secciones del punto 13. La parte "cómo se aplica en CineVerse" se completa cuando el código ya está en `main`, con capturas reales.

Partes del informe del Avance 1 que **ya no son correctas** y deben reescribirse: Resumen, 1.6 (dice que no hay autenticación y que solo existe Películas), 2.2.4 (tabla de endpoints incompleta), 2.3.2 y 2.3.3 (ahora POST/PUT/DELETE exigen `Authorization: Bearer`) y 2.4.2 (cantidad de tests).

**Carpetas del repositorio**

| Carpeta | Contenido |
|---|---|
| `docs/evidencias/` | Capturas con nombre claro: `sala-crear-201.png`, `orden-asiento-ocupado-409.png` |
| `docs/diagramas/` | Diagramas exportados como imagen (arquitectura, clases, relacional, casos de uso, negocio) |
| `docs/postman/` | Colección Postman exportada |

**Evidencias mínimas:** Swagger, Postman, JWT y roles (200/201, 401, 403), JPQL, transacciones (commit y rollback), validaciones 400, conflictos 409, frontend (login, panel, cartelera, productos).

---

## 16. Cronograma

| Fecha | Objetivo |
|---|---|
| Mar 6 (noche) | Samuel sube la base: excepciones, handler, springdoc, reglas de seguridad, propiedades de test |
| **Mié 7** | Cada uno avanza su módulo en su rama y avisa cualquier bloqueo |
| **Jue 8** | Integración completa y pruebas cruzadas |
| **Vie 9 – 18:00** | **Congelamiento del código.** Después solo se corrigen errores que rompan la demostración; se terminan informe y evidencias |
| **Sáb 10** | **Entrega** |

---

## 17. Problemas conocidos (en corrección)

- Credenciales inválidas en el login lanzan una `RuntimeException` sin manejo → se corrige con `GlobalExceptionHandler`. Comprobar además que los 404 y 400 reales no se conviertan en 401 por el dispatch a `/error`.
- `JwtAuthenticationFilter` imprime datos del usuario con `System.out.println` → se elimina.
- `SecurityConfig` conserva un `UserDetailsService` en memoria sin uso → se elimina.
- Las propiedades de test están en `src/test/java/.../resources/`, donde Maven no las carga; por eso `SecurityIntegrationTest` y `contextLoads` usan la base de archivo → se mueven a `src/test/resources/`.
- Las búsquedas JPQL públicas por título, género y combinada no filtran por `estado = true`; `GET /api/peliculas` devuelve también las inactivas.
- `jwt.secret` está en `application.properties` (secreto de desarrollo) → mover a variable de entorno si hay tiempo.
- `PeliculaController` mantiene un `@CrossOrigin("*")` redundante con la configuración de `SecurityConfig`.

---

## 18. Fuera de alcance del Avance 2

Angular, pantallas de compra (selección de asientos, carrito, pago), entidades `Pago` y `Ticket`, pagos reales, facturación, delivery, fidelización, migración a MySQL/PostgreSQL y despliegue. Una idea nueva no se convierte en requisito sin que los cuatro la conozcan y se actualice este documento.

---

## 19. Equipo

| Integrante | Rol |
|---|---|
| Samuel Jeremy Torres Ayala | Backend: datos, seguridad e integración |
| See Ahn Kaarlo Polo Sanchez | Backend: Funciones, JPQL y pruebas |
| Frank Mariano Marca Alegre | Productos y frontend público |
| Crhistian Vidal Zamora Zamata | Salas, login y frontend administrativo |

Docente: José Antonio Espinal Teves · Curso: Desarrollo Web Integrado · Lima, 2026.

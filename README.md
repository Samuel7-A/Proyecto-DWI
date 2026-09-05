# 🎬 CineVerse

Sistema web integrado para la gestión de cartelera, funciones y compra simulada de entradas de cine con selección de asientos y productos de dulcería.

Proyecto académico desarrollado para el curso **Desarrollo Web Integrado**.

---

# 1. Descripción del proyecto

**CineVerse** es una plataforma web de cine que permitirá a los usuarios consultar películas en cartelera y, progresivamente, completar un flujo integrado de compra compuesto por:

1. Selección de película.
2. Selección de función.
3. Selección de asientos.
4. Selección opcional de productos de dulcería.
5. Visualización del resumen de compra.
6. Simulación del pago.
7. Generación de un ticket digital.

Además, el sistema contará con funcionalidades administrativas para gestionar los principales elementos del negocio, como películas, salas, funciones y productos.

El proyecto toma como referencia general el funcionamiento de plataformas comerciales de cine, pero **CineVerse es un sistema académico independiente y no representa ni se integra con Cineplanet u otra empresa real**.

---

# 2. Objetivo general

Desarrollar un sistema web integrado para la gestión de una plataforma de cine utilizando una API REST desarrollada con Spring Boot, persistencia mediante JPA/Hibernate y H2, un frontend web temporal con HTML, CSS, JavaScript y Bootstrap, y posteriormente un frontend definitivo desarrollado con Angular.

---

# 3. Objetivos específicos

- Diseñar e implementar una API REST utilizando Spring Boot.
- Implementar operaciones CRUD para los recursos principales del sistema.
- Utilizar JPA/Hibernate como capa de persistencia.
- Utilizar H2 como base de datos durante el desarrollo académico.
- Aplicar una arquitectura organizada en capas.
- Implementar pruebas unitarias sobre la lógica del backend.
- Documentar y probar los servicios REST.
- Construir un frontend temporal utilizando HTML, CSS, JavaScript y Bootstrap.
- Integrar el frontend temporal con la API REST.
- Implementar posteriormente autenticación, autorización y roles.
- Reemplazar posteriormente el frontend temporal por Angular.
- Integrar el proceso completo de compra simulada de entradas y productos.
- Generar tickets digitales después de una compra simulada exitosa.
- Desplegar la aplicación en una etapa posterior del curso.

---

# 4. Alcance funcional definitivo

El alcance funcional base del proyecto queda definido en esta versión del documento.

Estas funcionalidades constituyen el **núcleo oficial de CineVerse**.

## Cliente

El cliente podrá:

- Consultar la cartelera.
- Consultar información de una película.
- Consultar las funciones disponibles para una película.
- Seleccionar una función.
- Consultar los asientos correspondientes a una sala.
- Seleccionar uno o varios asientos disponibles.
- Agregar opcionalmente productos de dulcería a su compra.
- Consultar el resumen de la orden.
- Realizar una simulación de pago.
- Obtener un ticket digital cuando el pago simulado sea aprobado.
- Consultar sus compras o tickets cuando el módulo de usuarios esté implementado.

## Administrador

El administrador podrá:

- Gestionar películas.
- Gestionar salas.
- Gestionar funciones.
- Gestionar productos de dulcería.
- Consultar órdenes.
- Consultar pagos simulados.
- Gestionar la información necesaria para la cartelera.

---

# 5. Funcionalidades excluidas

Las siguientes funcionalidades **NO forman parte del alcance oficial**:

- Pagos bancarios reales.
- Integración real con Yape.
- Integración real con Plin.
- Integración con tarjetas bancarias reales.
- Billetera virtual.
- CineWallet.
- CineSeat Delivery.
- Delivery de alimentos.
- Facturación electrónica real.
- Contabilidad.
- Recursos humanos.
- Gestión de empleados.
- Sistema de puntos o fidelización.
- Integración con Cineplanet.
- Integración con otras cadenas de cine.

Si alguna funcionalidad nueva se propone, deberá considerarse opcional y no podrá desplazar las funcionalidades obligatorias.

---

# 6. Proceso principal de compra

Este flujo constituye el **proceso principal e invariable del sistema**.

## P01 — Consultar cartelera

El usuario accede a CineVerse y visualiza las películas disponibles actualmente.

↓

## P02 — Consultar película

El usuario selecciona una película y consulta su información.

↓

## P03 — Seleccionar función

El usuario selecciona una fecha, horario y función disponible.

↓

## P04 — Seleccionar asientos

El sistema muestra los asientos correspondientes a la sala de la función.

El usuario selecciona uno o varios asientos disponibles.

↓

## P05 — Seleccionar dulcería

El usuario puede agregar opcionalmente:

- Canchita / palomitas.
- Bebidas.
- Dulces.
- Combos.

No es obligatorio agregar productos para comprar entradas.

↓

## P06 — Generar resumen de orden

El sistema presenta:

- Película.
- Función.
- Sala.
- Asientos seleccionados.
- Precio de entradas.
- Productos seleccionados.
- Precio de productos.
- Total de la orden.

↓

## P07 — Pago simulado

El usuario selecciona un método de pago ficticio.

Los métodos podrán representar visualmente opciones como:

- Tarjeta.
- Yape.
- Plin.

Ninguna opción realizará operaciones financieras reales.

↓

## P08 — Confirmar orden

Si la simulación del pago es aprobada:

- La orden cambia a estado confirmada.
- Los asientos seleccionados quedan ocupados para esa función.
- Se registra el pago simulado.
- Se genera el ticket digital.

↓

## P09 — Ticket digital

El usuario obtiene un ticket con la información esencial de su compra.

---

# 7. Reglas de negocio oficiales

## RN01

Una película deberá estar activa para mostrarse en la cartelera pública.

## RN02

Una función pertenece a una única película y una única sala.

## RN03

Una sala puede tener múltiples asientos.

## RN04

Un asiento pertenece físicamente a una sala.

## RN05

La disponibilidad de un asiento depende de la **función**, no únicamente del asiento físico.

Por ejemplo, el asiento A5 puede estar ocupado en una función de las 18:00 y disponible en otra función de las 21:00.

## RN06

Un asiento no puede confirmarse dos veces para la misma función.

## RN07

La compra de productos de dulcería es opcional.

## RN08

Una orden puede contener uno o varios asientos.

## RN09

Una orden puede contener cero o varios productos de dulcería.

## RN10

El total de una orden será:

**Total de entradas + total de productos seleccionados.**

## RN11

Los pagos serán exclusivamente simulados.

## RN12

Un ticket solo podrá generarse después de que una simulación de pago sea aprobada.

## RN13

Los métodos de pago mostrados en la interfaz no tendrán conexión con servicios financieros reales.

## RN14

Durante el primer avance no será obligatorio implementar autenticación.

## RN15

Cuando se implemente seguridad existirán, como mínimo, los roles:

- CLIENTE
- ADMIN

## RN16

Las operaciones administrativas estarán protegidas cuando se implemente Spring Security y JWT.

---

# 8. Requerimientos funcionales

## RF01 — Consultar cartelera

El sistema permitirá visualizar las películas activas.

**Estado APF1:** Implementar.

## RF02 — Consultar detalle de película

El sistema permitirá consultar la información de una película.

**Estado APF1:** Implementar.

## RF03 — Registrar película

El sistema permitirá registrar películas.

**Estado APF1:** Implementar.

## RF04 — Actualizar película

El sistema permitirá actualizar películas existentes.

**Estado APF1:** Implementar.

## RF05 — Eliminar película

El sistema permitirá eliminar películas.

**Estado APF1:** Implementar.

## RF06 — Consultar funciones

El sistema permitirá consultar las funciones disponibles de una película.

**Estado:** Posterior.

## RF07 — Gestionar funciones

El administrador podrá registrar, modificar y eliminar funciones.

**Estado:** Posterior.

## RF08 — Gestionar salas

El administrador podrá gestionar las salas.

**Estado:** Posterior.

## RF09 — Consultar asientos

El sistema permitirá visualizar los asientos correspondientes a una función.

**Estado:** Posterior.

## RF10 — Seleccionar asientos

El usuario podrá seleccionar uno o varios asientos disponibles.

**Estado:** Posterior.

## RF11 — Gestionar productos

El administrador podrá gestionar productos de dulcería.

**Estado:** Posterior.

## RF12 — Consultar dulcería

El usuario podrá consultar los productos disponibles.

**Estado:** Posterior.

## RF13 — Agregar productos a la orden

El usuario podrá agregar productos de dulcería a su compra.

**Estado:** Posterior.

## RF14 — Generar orden

El sistema permitirá generar una orden que agrupe entradas y productos.

**Estado:** Posterior.

## RF15 — Calcular total

El sistema calculará automáticamente el total de la compra.

**Estado:** Posterior.

## RF16 — Simular pago

El sistema permitirá realizar una simulación de pago.

**Estado:** Posterior.

## RF17 — Generar ticket

El sistema generará un ticket digital después de una simulación de pago aprobada.

**Estado:** Posterior.

## RF18 — Registrar usuario

El sistema permitirá registrar usuarios cuando se implemente el módulo de seguridad.

**Estado:** Posterior.

## RF19 — Iniciar sesión

El sistema permitirá autenticar usuarios.

**Estado:** Posterior.

## RF20 — Gestionar autorización por roles

El sistema diferenciará las operaciones permitidas para CLIENTE y ADMIN.

**Estado:** Posterior.

---

# 9. Requerimientos no funcionales

## RNF01 — Arquitectura

El backend utilizará una arquitectura organizada por responsabilidades:

- Controller.
- Service.
- Repository.
- Entity.
- DTO.
- Exception.
- Config.

## RNF02 — API REST

La comunicación entre frontend y backend utilizará HTTP y JSON mediante una API REST.

## RNF03 — Persistencia

Los datos del backend serán gestionados mediante JPA/Hibernate.

## RNF04 — Base de datos

Durante el desarrollo se utilizará H2 con almacenamiento persistente en archivo.

## RNF05 — Validación

El backend deberá validar la información recibida antes de almacenarla.

## RNF06 — Manejo de errores

La API deberá responder apropiadamente ante:

- Datos inválidos.
- Recursos inexistentes.
- Operaciones incorrectas.

## RNF07 — Pruebas

La lógica principal del backend deberá contar con pruebas unitarias.

## RNF08 — Diseño adaptable

El frontend deberá ser utilizable tanto en computadoras como en dispositivos móviles.

## RNF09 — Seguridad

En la etapa correspondiente se implementará Spring Security y JWT.

## RNF10 — Separación frontend/backend

El frontend no accederá directamente a la base de datos.

Toda la comunicación de datos deberá pasar por la API REST.

## RNF11 — Control de versiones

Todo cambio oficial deberá almacenarse en Git y GitHub.

## RNF12 — Pagos

El sistema nunca solicitará ni procesará información financiera real.

---

# 10. Tecnologías oficiales del proyecto

## Backend

| Tecnología | Versión acordada |
|---|---|
| Java                           | 21 LTS                                    |
| Spring Boot                    | 4.1.1                                     |
| Maven                          | Maven Wrapper del proyecto (Apache Maven 3.9.16) |
| Spring Web                     | Administrado por Spring Boot 4.1.1        |
| Spring Data JPA                | Administrado por Spring Boot 4.1.1        |
| Hibernate ORM                  | Administrado por Spring Boot 4.1.1        |
| H2 Database                    | 2.4.240                                   |
| Bean Validation                | Administrado por Spring Boot 4.1.1        |
| JUnit                          | Administrado por Spring Boot Starter Test |
| Mockito                        | Administrado por Spring Boot Starter Test |

Las versiones de las dependencias administradas por Spring Boot **no deberán declararse manualmente**.

## Frontend temporal

| Tecnología | Versión |
|---|---|
| HTML                  | HTML5                  |
| CSS                   | CSS3                   |
| JavaScript            | JavaScript moderno     |
| Bootstrap             | 5.3.8                  |
| Servidor local        | Live Server de VS Code |

El frontend temporal no requiere Node.js ni npm.

## Frontend definitivo

Angular será incorporado durante la etapa correspondiente del curso.

La versión exacta de Angular será congelada cuando comience dicha etapa, considerando la versión utilizada por el docente.

## Herramientas

- Visual Studio Code.
- Git.
- GitHub.
- Postman.
- H2 Console.
- Spring Initializr.
- Maven Wrapper.

---

# 11. Dependencias Spring Boot del proyecto

El backend utilizará únicamente las siguientes dependencias durante el APF1:

1. Spring Web.
2. Spring Data JPA.
3. H2 Database.
4. Validation.
5. Spring Boot DevTools.
6. Spring Boot Starter Test.

Starter Test proporciona las herramientas principales para JUnit y Mockito.

## Dependencias que NO se utilizarán todavía

- Spring Security.
- JWT.
- MySQL Driver.
- PostgreSQL Driver.
- Thymeleaf.
- WebFlux.
- OAuth2.
- Lombok.

Spring Security y JWT serán agregados posteriormente cuando corresponda al avance del curso.

## Configuración local de H2 durante APF1

La base de datos H2 se utilizará en modo persistente mediante archivo local. La configuración oficial del backend deberá usar una URL del tipo:

```properties
spring.datasource.url=jdbc:h2:file:./data/cineverse
```

Los archivos físicos generados por H2 dentro de `backend/data/` son locales y **no deberán subirse a GitHub**. El repositorio solo conservará el código y la configuración necesaria para recrear la base de datos.

---

# 12. Arquitectura actual

Durante el APF1:

Usuario ↓ Frontend temporal HTML + CSS + JavaScript + Bootstrap ↓ API REST ↓ Spring Boot ↓ Controller ↓ Service ↓ Repository ↓ JPA / Hibernate ↓ H2

---

# 13. Arquitectura futura

Cuando se introduzca Angular:

Usuario ↓ Angular ↓ HTTP / JSON ↓ Spring Boot REST API ↓ Service ↓ Repository ↓ JPA / Hibernate ↓ Base de datos

El backend construido durante los primeros avances **no será reemplazado por Angular**.

Angular reemplazará únicamente al frontend temporal.

---

# 14. Estructura oficial del repositorio

Para el APF1 se utilizará la siguiente estructura. Los archivos del frontend se separan por responsable para evitar que Frank y Crhistian editen los mismos archivos al mismo tiempo.

```text
Proyecto-DWI/
│
├── backend/
│   └── Spring Boot
│
├── frontend-temp/
│   ├── html/
│   ├── css/
│   └── js/
│
├── docs/
│   ├── postman/
│   ├── diagramas/
│   └── evidencias/
│
└── README.md
```

El informe académico del proyecto será elaborado colaborativamente en un documento compartido de Google Docs.
Cada integrante deberá completar directamente en dicho documento la sección que le corresponde.

Cuando se implemente Angular se agregará `frontend/`. `frontend-temp/` se conservará únicamente como evidencia histórica del primer desarrollo.

---


# 15. Frontend temporal

El frontend temporal estará separado del backend.

Durante el desarrollo:

- Backend Spring Boot: puerto 8080.
- Frontend temporal: servidor Live Server.
- La comunicación será realizada mediante la API REST.
- El backend deberá permitir el origen local del frontend durante el desarrollo.

## Parte pública

La interfaz pública deberá contener como mínimo:

- Página de inicio.
- Cartelera.
- Visualización de películas.
- Información básica de una película.

## Parte administrativa

La interfaz administrativa temporal deberá permitir:

- Listar películas.
- Registrar películas.
- Editar películas.
- Eliminar películas.

No será obligatorio implementar autenticación en el frontend temporal.

---

# 16. Modelo inicial: Película

Para evitar incompatibilidades entre frontend y backend, la estructura oficial de una película durante el APF1 será:

| Campo | Tipo conceptual | Obligatorio |
|---|---|---|
| id                                  | Identificador numérico | Generado |
| titulo                              | Texto                  | Sí       |
| sinopsis                            | Texto                  | No       |
| genero                              | Texto                  | Sí       |
| duracionMinutos                     | Número entero          | Sí       |
| clasificacion                       | Texto controlado       | Sí       |
| fechaEstreno                        | Fecha                  | Sí       |
| imagenUrl                           | Texto/URL              | No       |
| estado                              | Booleano               | Sí       |

## Clasificaciones aceptadas inicialmente

- APT
- +12
- +14
- +18

## Estado de la película en APF1

El campo `estado` será booleano durante el APF1:

- `true` = Activa.
- `false` = Inactiva.

Durante este avance no se agregarán estados adicionales como `EN_CARTELERA`, `PROXIMAMENTE` o `FINALIZADA`. Si en una etapa posterior se necesita un flujo de estados más detallado, deberá actualizarse primero el contrato de datos y comunicarse al equipo.

Estos nombres constituyen el **contrato de datos del APF1**.

Frontend y backend deberán utilizar exactamente los mismos nombres.

No deberán cambiarse unilateralmente.

---

# 17. Contrato REST del APF1

El recurso principal será:

`/api/peliculas`

| Método | Ruta | Función |
|---|---|---|
| GET                   | /api/peliculas      | Listar películas    |
| GET                   | /api/peliculas/{id} | Consultar película  |
| POST                  | /api/peliculas      | Registrar película  |
| PUT                   | /api/peliculas/{id} | Actualizar película |
| DELETE                | /api/peliculas/{id} | Eliminar película   |

## Respuestas HTTP esperadas

- 200 — operación correcta.
- 201 — recurso creado.
- 204 — eliminación correcta sin contenido.
- 400 — datos inválidos.
- 404 — recurso no encontrado.
- 500 — error interno no controlado.

Este contrato deberá definirse antes de conectar el frontend.

Una modificación del contrato deberá ser comunicada a los cuatro integrantes.

---

# 18. Modelo de datos previsto para el proyecto final

El diseño futuro contempla las siguientes entidades:

- Usuario.
- Pelicula.
- Sala.
- Asiento.
- Funcion.
- Producto.
- Orden.
- Entrada.
- DetalleProducto.
- Pago.
- Ticket.

## Relaciones principales

Pelicula 1 → N Funcion

Sala 1 → N Funcion

Sala 1 → N Asiento

Usuario 1 → N Orden

Orden 1 → N Entrada

Entrada N → 1 Funcion

Entrada N → 1 Asiento

Orden 1 → N DetalleProducto

DetalleProducto N → 1 Producto

Orden 1 → 1 Pago

Orden 1 → 1 Ticket

El modelo podrá refinarse durante el diseño de base de datos siempre que no altere los procesos principales definidos anteriormente.

---

# 19. Alcance específico del APF1

Durante el primer avance se implementará **únicamente el primer módulo funcional completo: Películas**.

## Entregables mínimos solicitados por el docente

Para el APF1 se consideran como entregables mínimos:

- Informe académico desarrollado hasta el punto **2.4 Test Driven Development** de la estructura oficial del proyecto.
- Archivo de presentación preparado para aproximadamente **8 minutos**.
- API REST funcionando.
- CRUD básico del recurso Películas.
- Pruebas unitarias.

Aunque el mínimo solicitado permite un CRUD básico sin base de datos, el equipo utilizará **H2 persistente con JPA/Hibernate** como mejora técnica permitida para adelantar la persistencia del proyecto y facilitar la integración posterior.

## Backend

Debe estar implementado:

- Proyecto Spring Boot.
- Arquitectura por capas.
- Entidad `Pelicula`.
- `PeliculaRepository`.
- `PeliculaService`.
- `PeliculaController`.
- API REST.
- CRUD completo de Películas.
- H2 persistente.
- JPA/Hibernate.
- Validaciones básicas.
- Manejo básico de errores.
- Pruebas unitarias.
- Pruebas manuales mediante Postman.

## Frontend temporal

Como avance adicional de integración del proyecto se desarrollará:

- Interfaz pública.
- Cartelera.
- Consulta de películas.
- Interfaz administrativa temporal.
- Registrar película.
- Editar película.
- Eliminar película.
- Integración con la API REST.

## Documentación

El informe académico deberá completarse hasta el punto **2.4** de la estructura oficial proporcionada por el docente:

- Resumen.
- 1.1 Realidad problemática.
- 1.2 Formulación del problema.
- 1.3 Objetivos.
- 1.4 Justificación.
- 1.5 Alcance del proyecto.
- 1.6 Limitaciones.
- 2.1 Desarrollo Web.
  - 2.1.1 Arquitectura Cliente-Servidor.
  - 2.1.2 Aplicaciones Web Modernas.
- 2.2 Framework Spring Boot.
  - 2.2.1 Conceptos básicos.
  - 2.2.2 Arquitectura Spring Boot.
  - 2.2.3 Dependency Injection.
  - 2.2.4 Controladores REST.
- 2.3 API REST.
  - 2.3.1 RESTful Services.
  - 2.3.2 Métodos HTTP.
  - 2.3.3 Pruebas de APIs.
- 2.4 Test Driven Development.
  - 2.4.1 Fundamentos TDD.
  - 2.4.2 Pruebas Unitarias con JUnit.

La persistencia mediante JPA/Hibernate y H2 ya se encuentra implementada como adelanto técnico del proyecto. Su desarrollo teórico detallado corresponde al punto 2.5 de la estructura general y no es obligatorio desarrollarlo todavía en el informe APF1.

## Presentación

Debe existir una presentación preparada para aproximadamente **8 minutos**, con una breve demostración del CRUD REST y las pruebas unitarias.

---

# 20. Trabajo que NO corresponde programar en APF1

Todavía no es necesario implementar:

- Salas.
- Funciones.
- Asientos.
- Productos.
- Dulcería.
- Orden.
- Pago.
- Ticket.
- Usuarios.
- Login.
- JWT.
- Spring Security.
- Angular.

Estos elementos deberán aparecer en el análisis y planificación cuando corresponda, pero no deberán retrasar la entrega funcional del CRUD de películas.

---

# 21. Equipo

| Integrante | Rol principal |
|---|---|
| Samuel                      | Backend 1 — Datos, JPA y H2                    |
| See                         | Backend 2 — API REST y pruebas                 |
| Frank                       | Frontend 1 — Interfaz pública y requerimientos |
| Crhistian                   | Frontend 2 — Administración y documentación    |

---

# 22. Responsabilidades del equipo para el APF1

La prioridad es terminar el APF1 sin duplicar trabajo. Cada integrante tendrá una zona principal de programación y una parte concreta del informe en el Google Docs compartido.

## Samuel — Backend 1

Responsable de **base técnica, datos, persistencia e integración**.

### Tareas de programación APF1

- Crear y comprobar el proyecto Spring Boot dentro de `backend/`.
- Configurar Maven y las dependencias oficiales.
- Configurar H2 persistente.
- Configurar JPA/Hibernate.
- Crear la entidad `Pelicula`.
- Crear `PeliculaRepository`.
- Mantener `application.properties` y la configuración general del backend.
- Verificar que Spring Boot inicie correctamente.
- Verificar que H2 almacene datos y conserve la información después de reiniciar la aplicación.
- Realizar la integración final del proyecto y resolver conflictos técnicos.

### Documentación de Samuel

En el Google Docs compartido:

- **Resumen**.
- **2.2 Framework Spring Boot**.
  - 2.2.1 Conceptos básicos.
  - 2.2.2 Arquitectura Spring Boot.
  - 2.2.3 Dependency Injection.
  - 2.2.4 Controladores REST.
- Revisión técnica general del informe junto con See.

Samuel puede mencionar H2, JPA/Hibernate y la persistencia como parte de la implementación técnica, pero no deberá crear un punto `2.1 Base de Datos`, ya que esa numeración no corresponde a la estructura oficial del docente.

### Archivos o áreas que Samuel administra principalmente

- `backend/pom.xml`
- `backend/src/main/resources/application.properties`
- `backend/src/main/java/com/cineverse/backend/entity/`
- `backend/src/main/java/com/cineverse/backend/repository/`
- configuración general del backend
- `README.md`

Samuel deberá **subir primero la base funcional del backend**. See integrará su trabajo sobre la última versión subida por Samuel.

---

## See — Backend 2

Responsable de **API REST, lógica, pruebas y documentación técnica de servicios**.

### Tareas de programación APF1

- Crear `PeliculaService`.
- Crear `PeliculaController`.
- Implementar GET, GET por ID, POST, PUT y DELETE.
- Integrar Service y Controller con `PeliculaRepository` y H2.
- Manejar respuestas HTTP y película inexistente.
- Crear pruebas unitarias con JUnit y Mockito cuando corresponda.
- Probar los endpoints en Postman.
- Guardar la colección de Postman en `docs/postman/`.

### Documentación de See

En el Google Docs compartido:

- **2.3 API REST**.
  - 2.3.1 RESTful Services.
  - 2.3.2 Métodos HTTP.
  - 2.3.3 Pruebas de APIs.
- **2.4 Test Driven Development**.
  - 2.4.1 Fundamentos TDD.
  - 2.4.2 Pruebas Unitarias con JUnit.
- Revisión técnica general junto con Samuel.

### Archivos o áreas que See administra principalmente

- `backend/src/main/java/com/cineverse/backend/service/`
- `backend/src/main/java/com/cineverse/backend/controller/`
- manejo básico de errores del API
- pruebas del backend
- `docs/postman/`

See no deberá cambiar los campos de `Pelicula`, la configuración de H2 ni el contrato REST sin comunicarlo primero a Samuel y a los integrantes de frontend.

---

## Frank — Frontend 1

Responsable del **frontend público** y de parte del planteamiento y marco teórico web.

### Tareas de programación APF1

- Crear la página de inicio.
- Crear la cartelera.
- Crear las tarjetas de películas.
- Crear la vista básica de información de una película.
- Aplicar Bootstrap y diseño responsive básico.
- Usar datos temporales mientras el backend todavía no esté listo.
- Cuando la API esté disponible, conectar `GET /api/peliculas` y `GET /api/peliculas/{id}`.

### Documentación de Frank

En el Google Docs compartido:

- **1.1 Realidad problemática**.
- **1.5 Alcance del proyecto**.
- **1.6 Limitaciones**.
- **2.1 Desarrollo Web**.
  - 2.1.1 Arquitectura Cliente-Servidor.
  - 2.1.2 Aplicaciones Web Modernas.

### Archivos exclusivos de Frank en el frontend temporal

- `frontend-temp/html/index.html`
- `frontend-temp/css/public.css`
- `frontend-temp/js/public.js`

Frank deberá basar el contenido únicamente en el alcance, procesos y reglas de negocio ya definidos en este README. No deberá inventar funcionalidades nuevas.

---

## Crhistian — Frontend 2

Responsable del **frontend administrativo temporal**, parte del planteamiento del proyecto y apoyo en evidencias/presentación.

### Tareas de programación APF1

- Crear la interfaz de administración de películas.
- Crear listado, formulario de registro y formulario de edición.
- Preparar la acción visual de eliminación.
- Aplicar Bootstrap y validaciones visuales básicas.
- Usar datos temporales mientras el backend todavía no esté listo.
- Cuando la API esté disponible, conectar GET, POST, PUT y DELETE.
- Reunir capturas y evidencias necesarias para la presentación.

### Documentación de Crhistian

En el Google Docs compartido:

- **1.2 Formulación del problema**.
- **1.3 Objetivos**.
- **1.4 Justificación**.
- Apoyo en la organización de la presentación de 8 minutos.

### Archivos exclusivos de Crhistian en el frontend temporal

- `frontend-temp/html/admin.html`
- `frontend-temp/css/admin.css`
- `frontend-temp/js/admin.js`

Crhistian no será responsable de escribir todo el informe. Cada integrante deberá completar directamente la sección que tiene asignada.

---

# 23. Distribución de documentación

El informe académico será elaborado directamente en el **Google Docs compartido del equipo**, siguiendo la estructura oficial proporcionada por el docente. No se crearán archivos Markdown individuales del informe dentro del repositorio.

| Sección oficial | Responsable principal |
|---|---|
| Resumen | Samuel |
| 1.1 Realidad problemática | Frank |
| 1.2 Formulación del problema | Crhistian |
| 1.3 Objetivos | Crhistian |
| 1.4 Justificación | Crhistian |
| 1.5 Alcance del proyecto | Frank |
| 1.6 Limitaciones | Frank |
| 2.1 Desarrollo Web | Frank |
| 2.1.1 Arquitectura Cliente-Servidor | Frank |
| 2.1.2 Aplicaciones Web Modernas | Frank |
| 2.2 Framework Spring Boot | Samuel |
| 2.2.1 Conceptos básicos | Samuel |
| 2.2.2 Arquitectura Spring Boot | Samuel |
| 2.2.3 Dependency Injection | Samuel |
| 2.2.4 Controladores REST | Samuel |
| 2.3 API REST | See |
| 2.3.1 RESTful Services | See |
| 2.3.2 Métodos HTTP | See |
| 2.3.3 Pruebas de APIs | See |
| 2.4 Test Driven Development | See |
| 2.4.1 Fundamentos TDD | See |
| 2.4.2 Pruebas Unitarias con JUnit | See |
| Revisión técnica | Samuel + See |
| Revisión final del informe | Todos |

El **informe requerido para el APF1 finaliza en el punto 2.4**.

La persistencia con JPA/Hibernate y H2 se mantiene implementada como adelanto técnico, pero su explicación teórica detallada corresponde al punto 2.5 de la estructura general del proyecto.

Los archivos dentro de `docs/` se utilizarán únicamente para materiales complementarios:

- `docs/postman/`: colección y evidencias de pruebas de la API.
- `docs/diagramas/`: diagramas exportados utilizados en el informe o presentación.
- `docs/evidencias/`: capturas de funcionamiento, pruebas, persistencia e integración.

Cada integrante deberá escribir directamente su sección en el Google Docs compartido y avisar al grupo cuando haya terminado.

---

# 24. Estrategia Git simplificada para cerrar el APF1

Para este avance **no se utilizarán Pull Requests, ramas `feature`, `develop`, GitFlow ni Issues obligatorios**. El objetivo inmediato es terminar e integrar el proyecto con el menor número posible de pasos.

Se trabajará únicamente sobre la rama:

- `main`

Cada integrante deberá modificar solamente los archivos o áreas que tiene asignados en la sección 22. Así se reducen los conflictos aunque todos utilicen la misma rama.

## Regla principal

**Antes de empezar a trabajar y justo antes de subir cambios, cada integrante debe actualizar su copia del repositorio.**

Nunca se utilizará `force push`.

Si Git rechaza un `push`, el integrante deberá detenerse y avisar a Samuel en lugar de intentar forzar la subida.

---

# 25. Flujo Git mínimo

La primera vez, cada integrante clona el repositorio.

Para cada entrega de trabajo:

```bash
git pull origin main
```

Después modifica únicamente sus archivos asignados y, al terminar:

```bash
git add .
git commit -m "descripcion corta del trabajo"
git pull origin main
git push origin main
```

No habrá revisión formal por Pull Request durante este APF1. La revisión se realizará directamente sobre el código ya subido y durante la integración final.

### Orden especial del backend

1. Samuel sube primero la base de Spring Boot + H2 + JPA + `Pelicula` + Repository.
2. See hace `git pull origin main` después de ese cambio.
3. See agrega Service, Controller, pruebas y Postman.
4. Samuel vuelve a actualizar su copia y verifica la integración completa.

Frank y Crhistian pueden trabajar desde el inicio porque tienen archivos frontend separados.

---

# 26. Convención mínima de commits

No se exige una convención compleja. Los mensajes solo deben indicar claramente qué se hizo.

Ejemplos válidos:

- `backend: configurar H2 y entidad Pelicula`
- `backend: agregar CRUD REST de peliculas`
- `frontend: agregar cartelera publica`
- `frontend: agregar administracion de peliculas`
- `docs: agregar marco teorico Spring Boot`
- `docs: agregar API REST y pruebas unitarias`

Lo importante es que cada integrante realice sus propios commits para dejar evidencia de participación.

---

# 27. Gestión de tareas simplificada

Durante el APF1 no es obligatorio utilizar Issues ni un tablero de GitHub.

La fuente de verdad para saber qué debe hacer cada integrante será:

1. La sección **22. Responsabilidades del equipo para el APF1** de este README.
2. La sección **23. Distribución de documentación**.
3. El grupo de WhatsApp para confirmar que una tarea fue terminada o informar un bloqueo.

Cada integrante deberá avisar al grupo cuando termine su parte y la haya subido al repositorio.

---


# 28. Contrato entre backend y frontend

Antes de conectar una pantalla, ambos equipos deberán conocer:

- Endpoint.
- Método HTTP.
- Campos enviados.
- Campos recibidos.
- Respuestas esperadas.
- Posibles errores.

Para el APF1 el contrato de `Pelicula` definido en este README se considera congelado.

Si el backend necesita modificarlo:

1. Debe comunicarlo al grupo.
2. Debe actualizar este README.
3. Debe actualizar la documentación API.
4. Debe avisar a ambos integrantes frontend.
5. Recién entonces podrá cambiarse el código.

Esto evita que frontend y backend desarrollen contratos diferentes.

---

# 29. Integración APF1

La integración deberá probar el siguiente recorrido completo:

### Caso 1 — Registrar

Frontend administrativo → API POST → Spring Boot → JPA → H2

### Caso 2 — Listar

H2 → Spring Boot → API GET → Frontend público → Cartelera

### Caso 3 — Actualizar

Frontend administrativo → API PUT → Spring Boot → H2 → Frontend actualizado

### Caso 4 — Eliminar

Frontend administrativo → API DELETE → Spring Boot → H2 → Frontend actualizado

---

# 30. Pruebas mínimas del APF1

El backend deberá demostrar como mínimo:

- Crear película.
- Listar películas.
- Buscar película por ID.
- Actualizar película.
- Eliminar película.
- Comportamiento ante película inexistente.

Además deberán probar manualmente los endpoints utilizando Postman.

---

# 31. Definition of Done

Una funcionalidad se considera terminada cuando:

- Compila o carga correctamente.
- No produce errores inesperados en el flujo probado.
- Cumple la tarea asignada en este README.
- Está conectada con la API cuando corresponda.
- Los datos se almacenan correctamente cuando corresponda.
- Tiene pruebas cuando corresponda.
- Fue subida al repositorio mediante un commit del integrante responsable.
- Otro integrante pudo probarla durante la integración.
- La documentación correspondiente fue entregada.
- No rompe el trabajo ya integrado.

No se exige Pull Request para considerar una tarea terminada durante este APF1.

---


# 32. Criterios para considerar terminado el APF1

## Backend

-  Spring Boot inicia correctamente.
-  H2 funciona correctamente.
-  JPA/Hibernate funciona.
-  CRUD de películas completo.
-  GET funciona.
-  GET por ID funciona.
-  POST funciona.
-  PUT funciona.
-  DELETE funciona.
-  Validaciones básicas implementadas.
-  Manejo de recurso inexistente.
-  Pruebas unitarias aprobadas.
-  Colección Postman preparada.

## Frontend

-  Página pública funcional.
-  Cartelera consume la API.
-  Administración lista películas.
-  Administración registra películas.
-  Administración modifica películas.
-  Administración elimina películas.
-  Diseño responsive básico.
-  Bootstrap aplicado.
-  Integración frontend/backend funcional.

## Documentación

- Resumen terminado.
- 1.1 Realidad problemática terminada.
- 1.2 Formulación del problema terminada.
- 1.3 Objetivos terminados.
- 1.4 Justificación terminada.
- 1.5 Alcance del proyecto terminado.
- 1.6 Limitaciones terminadas.
- 2.1 Desarrollo Web terminado.
- 2.2 Framework Spring Boot terminado.
- 2.3 API REST terminado.
- 2.4 Test Driven Development terminado.
- Capturas y evidencias necesarias preparadas.
- Documento revisado por los cuatro integrantes.

## Presentación

-  Presentación terminada.
-  Demo preparada.
-  Todos conocen el funcionamiento del sistema.
-  Todos conocen la arquitectura.
-  Todos pueden explicar la API.
-  Todos conocen el alcance futuro.
-  Tiempo total cercano a 8 minutos.

---

# 33. Roadmap académico

## APF1

Spring Boot + REST + H2 + frontend temporal.

Principal funcionalidad:

**CRUD completo de películas.**

---

## APF2

Evolución del backend.

Incorporar progresivamente:

- Salas.
- Asientos.
- Funciones.
- Productos.
- Usuarios.
- Relaciones JPA.
- JPQL cuando sea necesario.
- Transacciones.
- Spring Security.
- Roles.
- JWT.

---

## APF3

Frontend definitivo.

- Angular.
- Componentes.
- Routing.
- Formularios.
- Validaciones.
- Consumo de API REST.
- Autenticación.
- Autorización.
- Integración con backend.

---

## Proyecto Final

Completar el flujo:

Película → Función → Asientos → Dulcería → Orden → Pago simulado → Ticket digital

Además:

- Integración completa.
- Pruebas.
- Correcciones.
- Seguridad.
- Despliegue.
- Documentación final.

---

# 34. Política de cambios de alcance

El alcance base definido en este README se considera **congelado**.

Una nueva idea no se convierte automáticamente en un requerimiento.

Para modificar el núcleo del proyecto deben cumplirse los siguientes pasos:

1. Proponer el cambio.
2. Explicar qué problema resuelve.
3. Evaluar impacto en backend.
4. Evaluar impacto en frontend.
5. Evaluar impacto en base de datos.
6. Los cuatro integrantes deben conocer el cambio.
7. Actualizar la documentación antes de implementarlo.

La prioridad siempre será terminar correctamente el alcance obligatorio antes de añadir características opcionales.

---

# 35. Plan de cierre urgente del APF1

La presentación será el **miércoles 9 de septiembre de 2026**. El equipo deberá considerar el **lunes 7** como fecha objetivo para tener el código y la documentación prácticamente terminados. El martes 8 se reserva exclusivamente para pruebas, correcciones, evidencias y ensayo.

## Sábado 5 — inicio inmediato

Objetivo: dejar creadas las cuatro partes técnicas principales.

- Samuel: Spring Boot + H2 persistente + JPA/Hibernate + `Pelicula` + `PeliculaRepository`; iniciar Resumen y 2.2.
- See: después de que Samuel suba la base, integrar `Service`, `Controller`, CRUD REST y comenzar 2.3/2.4.
- Frank: avanzar la página pública y comenzar 1.1, 1.5, 1.6 y 2.1.
- Crhistian: avanzar la administración de películas y comenzar 1.2, 1.3 y 1.4.

Samuel deberá subir primero la base funcional del backend para que See trabaje sobre la misma estructura.

## Domingo 6

Objetivo: **integración completa**.

Debe funcionar el recorrido:

`Frontend administrativo → API REST → Spring Boot → JPA/Hibernate → H2 → Frontend público`

También deben quedar listas o muy avanzadas las pruebas unitarias y la colección Postman.

## Lunes 7

Objetivo: cerrar código, completar el informe oficial hasta el punto 2.4, reunir evidencias y terminar la presentación.

No se agregan módulos nuevos.

## Martes 8

Objetivo: solo corregir, probar y ensayar.

Se debe probar como mínimo registrar, listar, buscar, editar y eliminar películas; reiniciar Spring Boot y comprobar persistencia; ejecutar las pruebas unitarias; probar Postman; comprobar el frontend y ensayar la presentación de aproximadamente 8 minutos.

## Miércoles 9

Objetivo: presentación y demo. No se realizan cambios de alcance antes de exponer.

## Regla de emergencia

Hasta después del APF1 quedan congelados: salas, funciones, asientos, dulcería, orden, pago, ticket, usuarios, login, Spring Security, JWT y Angular.

El único módulo que debe quedar completo ahora es **Películas**.

---


# 36. Estado actual

**Fase actual:** APF1.

**Objetivo inmediato:** conseguir una integración vertical completamente funcional:

Frontend temporal → API REST → Spring Boot → JPA/Hibernate → H2

utilizando el módulo **Películas**.

**Modo de trabajo APF1:** una sola rama `main`, sin Pull Requests, con archivos separados por integrante y Samuel como integrador técnico final.

---

# 37. Autores

Proyecto realizado por:

- Samuel
- See
- Frank
- Crhistian

Curso: **Desarrollo Web Integrado**

2026.

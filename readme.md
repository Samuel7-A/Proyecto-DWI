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

* Diseñar e implementar una API REST utilizando Spring Boot.
* Implementar operaciones CRUD para los recursos principales del sistema.
* Utilizar JPA/Hibernate como capa de persistencia.
* Utilizar H2 como base de datos durante el desarrollo académico.
* Aplicar una arquitectura organizada en capas.
* Implementar pruebas unitarias sobre la lógica del backend.
* Documentar y probar los servicios REST.
* Construir un frontend temporal utilizando HTML, CSS, JavaScript y Bootstrap.
* Integrar el frontend temporal con la API REST.
* Implementar posteriormente autenticación, autorización y roles.
* Reemplazar posteriormente el frontend temporal por Angular.
* Integrar el proceso completo de compra simulada de entradas y productos.
* Generar tickets digitales después de una compra simulada exitosa.
* Desplegar la aplicación en una etapa posterior del curso.

---

# 4. Alcance funcional definitivo

El alcance funcional base del proyecto queda definido en esta versión del documento.

Estas funcionalidades constituyen el **núcleo oficial de CineVerse**.

## Cliente

El cliente podrá:

* Consultar la cartelera.
* Consultar información de una película.
* Consultar las funciones disponibles para una película.
* Seleccionar una función.
* Consultar los asientos correspondientes a una sala.
* Seleccionar uno o varios asientos disponibles.
* Agregar opcionalmente productos de dulcería a su compra.
* Consultar el resumen de la orden.
* Realizar una simulación de pago.
* Obtener un ticket digital cuando el pago simulado sea aprobado.
* Consultar sus compras o tickets cuando el módulo de usuarios esté implementado.

## Administrador

El administrador podrá:

* Gestionar películas.
* Gestionar salas.
* Gestionar funciones.
* Gestionar productos de dulcería.
* Consultar órdenes.
* Consultar pagos simulados.
* Gestionar la información necesaria para la cartelera.

---

# 5. Funcionalidades excluidas

Las siguientes funcionalidades **NO forman parte del alcance oficial**:

* Pagos bancarios reales.
* Integración real con Yape.
* Integración real con Plin.
* Integración con tarjetas bancarias reales.
* Billetera virtual.
* CineWallet.
* CineSeat Delivery.
* Delivery de alimentos.
* Facturación electrónica real.
* Contabilidad.
* Recursos humanos.
* Gestión de empleados.
* Sistema de puntos o fidelización.
* Integración con Cineplanet.
* Integración con otras cadenas de cine.

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

* Canchita / palomitas.
* Bebidas.
* Dulces.
* Combos.

No es obligatorio agregar productos para comprar entradas.

↓

## P06 — Generar resumen de orden

El sistema presenta:

* Película.
* Función.
* Sala.
* Asientos seleccionados.
* Precio de entradas.
* Productos seleccionados.
* Precio de productos.
* Total de la orden.

↓

## P07 — Pago simulado

El usuario selecciona un método de pago ficticio.

Los métodos podrán representar visualmente opciones como:

* Tarjeta.
* Yape.
* Plin.

Ninguna opción realizará operaciones financieras reales.

↓

## P08 — Confirmar orden

Si la simulación del pago es aprobada:

* La orden cambia a estado confirmada.
* Los asientos seleccionados quedan ocupados para esa función.
* Se registra el pago simulado.
* Se genera el ticket digital.

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

* CLIENTE
* ADMIN

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

* Controller.
* Service.
* Repository.
* Entity.
* DTO.
* Exception.
* Config.

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

* Datos inválidos.
* Recursos inexistentes.
* Operaciones incorrectas.

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

| Tecnología      | Versión acordada                          |
| --------------- | ----------------------------------------- |
| Java            | 21 LTS                                    |
| Spring Boot     | 3.5.16                                    |
| Maven           | Maven Wrapper del proyecto / Maven 3.6.3+ |
| Spring Web      | Administrado por Spring Boot 3.5.16       |
| Spring Data JPA | Administrado por Spring Boot 3.5.16       |
| Hibernate       | Administrado por Spring Boot 3.5.16       |
| H2 Database     | 2.3.232                                   |
| Bean Validation | Administrado por Spring Boot              |
| JUnit Jupiter   | 5.12.2                                    |
| Mockito         | 5.17.0                                    |

Las versiones de las dependencias administradas por Spring Boot **no deberán declararse manualmente**.

## Frontend temporal

| Tecnología     | Versión                |
| -------------- | ---------------------- |
| HTML           | HTML5                  |
| CSS            | CSS3                   |
| JavaScript     | JavaScript moderno     |
| Bootstrap      | 5.3.8                  |
| Servidor local | Live Server de VS Code |

El frontend temporal no requiere Node.js ni npm.

## Frontend definitivo

Angular será incorporado durante la etapa correspondiente del curso.

La versión exacta de Angular será congelada cuando comience dicha etapa, considerando la versión utilizada por el docente.

## Herramientas

* Visual Studio Code.
* Git.
* GitHub.
* Postman.
* H2 Console.
* Spring Initializr.
* Maven Wrapper.

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

* Spring Security.
* JWT.
* MySQL Driver.
* PostgreSQL Driver.
* Thymeleaf.
* WebFlux.
* OAuth2.
* Lombok.

Spring Security y JWT serán agregados posteriormente cuando corresponda al avance del curso.

---

# 12. Arquitectura actual

Durante el APF1:

Usuario
↓
Frontend temporal
HTML + CSS + JavaScript + Bootstrap
↓
API REST
↓
Spring Boot
↓
Controller
↓
Service
↓
Repository
↓
JPA / Hibernate
↓
H2

---

# 13. Arquitectura futura

Cuando se introduzca Angular:

Usuario
↓
Angular
↓
HTTP / JSON
↓
Spring Boot REST API
↓
Service
↓
Repository
↓
JPA / Hibernate
↓
Base de datos

El backend construido durante los primeros avances **no será reemplazado por Angular**.

Angular reemplazará únicamente al frontend temporal.

---

# 14. Estructura oficial del repositorio

cineverse/
│
├── backend/
│   └── Proyecto Spring Boot
│
├── frontend-temp/
│   ├── html/
│   ├── css/
│   └── js/
│
├── docs/
│   ├── informe/
│   ├── diagramas/
│   ├── postman/
│   ├── evidencias/
│   └── presentacion/
│
└── README.md

Cuando se implemente Angular:

cineverse/
│
├── backend/
├── frontend/
├── frontend-temp/
├── docs/
└── README.md

`frontend-temp` quedará únicamente como evidencia histórica del primer desarrollo y Angular se convertirá en el frontend oficial.

---

# 15. Frontend temporal

El frontend temporal estará separado del backend.

Durante el desarrollo:

* Backend Spring Boot: puerto 8080.
* Frontend temporal: servidor Live Server.
* La comunicación será realizada mediante la API REST.
* El backend deberá permitir el origen local del frontend durante el desarrollo.

## Parte pública

La interfaz pública deberá contener como mínimo:

* Página de inicio.
* Cartelera.
* Visualización de películas.
* Información básica de una película.

## Parte administrativa

La interfaz administrativa temporal deberá permitir:

* Listar películas.
* Registrar películas.
* Editar películas.
* Eliminar películas.

No será obligatorio implementar autenticación en el frontend temporal.

---

# 16. Modelo inicial: Película

Para evitar incompatibilidades entre frontend y backend, la estructura oficial de una película durante el APF1 será:

| Campo           | Tipo conceptual        | Obligatorio |
| --------------- | ---------------------- | ----------- |
| id              | Identificador numérico | Generado    |
| titulo          | Texto                  | Sí          |
| sinopsis        | Texto                  | No          |
| genero          | Texto                  | Sí          |
| duracionMinutos | Número entero          | Sí          |
| clasificacion   | Texto controlado       | Sí          |
| fechaEstreno    | Fecha                  | Sí          |
| imagenUrl       | Texto/URL              | No          |
| estado          | Booleano               | Sí          |

## Clasificaciones aceptadas inicialmente

* APT
* +12
* +14
* +18

Estos nombres constituyen el **contrato de datos del APF1**.

Frontend y backend deberán utilizar exactamente los mismos nombres.

No deberán cambiarse unilateralmente.

---

# 17. Contrato REST del APF1

El recurso principal será:

`/api/peliculas`

| Método | Ruta                | Función             |
| ------ | ------------------- | ------------------- |
| GET    | /api/peliculas      | Listar películas    |
| GET    | /api/peliculas/{id} | Consultar película  |
| POST   | /api/peliculas      | Registrar película  |
| PUT    | /api/peliculas/{id} | Actualizar película |
| DELETE | /api/peliculas/{id} | Eliminar película   |

## Respuestas HTTP esperadas

* 200 — operación correcta.
* 201 — recurso creado.
* 204 — eliminación correcta sin contenido.
* 400 — datos inválidos.
* 404 — recurso no encontrado.
* 500 — error interno no controlado.

Este contrato deberá definirse antes de conectar el frontend.

Una modificación del contrato deberá ser comunicada a los cuatro integrantes.

---

# 18. Modelo de datos previsto para el proyecto final

El diseño futuro contempla las siguientes entidades:

* Usuario.
* Pelicula.
* Sala.
* Asiento.
* Funcion.
* Producto.
* Orden.
* Entrada.
* DetalleProducto.
* Pago.
* Ticket.

## Relaciones principales

Pelicula
1 → N
Funcion

Sala
1 → N
Funcion

Sala
1 → N
Asiento

Usuario
1 → N
Orden

Orden
1 → N
Entrada

Entrada
N → 1
Funcion

Entrada
N → 1
Asiento

Orden
1 → N
DetalleProducto

DetalleProducto
N → 1
Producto

Orden
1 → 1
Pago

Orden
1 → 1
Ticket

El modelo podrá refinarse durante el diseño de base de datos siempre que no altere los procesos principales definidos anteriormente.

---

# 19. Alcance específico del APF1

Durante el primer avance se implementará **únicamente el primer módulo funcional completo: Películas**.

## Backend

Debe estar implementado:

* Proyecto Spring Boot.
* Arquitectura por capas.
* Entidad Pelicula.
* Repository.
* Service.
* Controller.
* API REST.
* CRUD completo.
* H2.
* JPA/Hibernate.
* Validaciones básicas.
* Manejo básico de errores.
* Pruebas unitarias.
* Pruebas mediante Postman.

## Frontend temporal

Debe estar implementado:

* Interfaz pública.
* Cartelera.
* Consulta de películas.
* Interfaz administrativa temporal.
* Registrar película.
* Editar película.
* Eliminar película.
* Integración con la API REST.

## Documentación

Debe completarse:

* 1.1 Contexto y Empresa.
* 1.2 Problema y Objetivos.
* 1.3 Alcance y Requerimientos.
* 2.1 Base de Datos.
* 2.2 Diseño de la API RESTful.
* 2.3 Documentación de la API.
* 2.4 Requerimientos y Diagramas.

## Presentación

Debe existir una presentación preparada para aproximadamente 8 minutos.

---

# 20. Trabajo que NO corresponde programar en APF1

Todavía no es necesario implementar:

* Salas.
* Funciones.
* Asientos.
* Productos.
* Dulcería.
* Orden.
* Pago.
* Ticket.
* Usuarios.
* Login.
* JWT.
* Spring Security.
* Angular.

Estos elementos deberán aparecer en el análisis y planificación cuando corresponda, pero no deberán retrasar la entrega funcional del CRUD de películas.

---

# 21. Equipo

| Integrante | Rol principal                                  |
| ---------- | ---------------------------------------------- |
| Samuel     | Backend 1 — Datos, JPA y H2                    |
| See        | Backend 2 — API REST y pruebas                 |
| Frank      | Frontend 1 — Interfaz pública y requerimientos |
| Crhistian  | Frontend 2 — Administración y documentación    |

---

# 22. Responsabilidades del equipo

## Samuel — Backend 1

Responsable de:

* Crear la base del proyecto Spring Boot.
* Configurar Maven.
* Configurar H2.
* Configurar JPA/Hibernate.
* Crear y mantener las entidades.
* Crear repositories.
* Definir la persistencia.
* Verificar que los datos sean almacenados correctamente.
* Mantener la estructura interna del backend.
* Coordinar la integración general del backend.
* Apoyar la resolución de conflictos técnicos.

### APF1

* Configuración Spring Boot.
* Configuración H2.
* Entidad Pelicula.
* PeliculaRepository.
* Persistencia.
* Diseño técnico de base de datos.
* Apoyo a integración final.

---

## See — Backend 2

Responsable de:

* Implementar Services.
* Implementar Controllers.
* Diseñar y mantener los endpoints REST.
* Implementar las operaciones CRUD.
* Manejar respuestas HTTP.
* Implementar manejo básico de errores.
* Crear pruebas unitarias.
* Mantener la colección Postman.
* Documentar la API.

### APF1

* PeliculaService.
* PeliculaController.
* CRUD REST.
* Pruebas unitarias.
* Pruebas Postman.
* Documentación de endpoints.
* Apoyo a integración con frontend.

---

## Frank — Frontend 1

Responsable del frontend público.

### APF1

* Página de inicio.
* Cartelera.
* Tarjetas de películas.
* Vista de información de una película.
* Consumo del GET de películas.
* Diseño responsive.
* Bootstrap.
* Requerimientos funcionales.
* Requerimientos no funcionales.
* Casos de uso.
* Apoyo en diagramas.

Frank deberá basar los requerimientos **únicamente en los procesos, reglas de negocio y alcance definidos en este README**.

No deberá inventar nuevas funciones para completar el informe.

---

## Crhistian — Frontend 2

Responsable del frontend administrativo temporal.

### APF1

* Interfaz administrativa.
* Listado de películas.
* Formulario de registro.
* Formulario de edición.
* Eliminación.
* Integración con POST, PUT y DELETE.
* Validaciones visuales básicas.
* Apoyo a diagramas.
* Organización del informe.
* Organización de evidencias.
* Organización de la presentación.

Crhistian no será el único responsable del informe.

Cada integrante deberá entregar la documentación correspondiente a su área.

---

# 23. Distribución de documentación

| Sección                        | Responsable principal |
| ------------------------------ | --------------------- |
| 1.1 Contexto y Empresa         | Frank                 |
| 1.2 Problema y Objetivos       | Crhistian             |
| 1.3 Alcance y Requerimientos   | Frank                 |
| 2.1 Base de Datos              | Samuel                |
| 2.2 Diseño API RESTful         | See                   |
| 2.3 Documentación API          | See                   |
| 2.4 Requerimientos y Diagramas | Frank + Crhistian     |
| Revisión técnica               | Samuel + See          |
| Revisión final                 | Todos                 |

---

# 24. Estrategia Git

El proyecto utilizará dos ramas permanentes:

* `main`
* `develop`

## main

Contendrá únicamente versiones estables y verificadas.

No se desarrollará directamente sobre `main`.

## develop

Será la rama de integración.

Las funcionalidades terminadas serán integradas primero en `develop`.

## Ramas de trabajo APF1

* `feature/backend-data-h2`
* `feature/backend-api-tests`
* `feature/frontend-public`
* `feature/frontend-admin`

Cada integrante trabajará principalmente en su rama.

---

# 25. Flujo Git

1. Actualizar `develop`.
2. Trabajar en la rama correspondiente.
3. Realizar commits pequeños y comprensibles.
4. Subir la rama a GitHub.
5. Crear Pull Request hacia `develop`.
6. Otro integrante revisa.
7. Corregir problemas encontrados.
8. Integrar a `develop`.
9. Ejecutar pruebas generales.
10. Cuando el avance esté estable, integrar `develop` en `main`.

Ningún integrante deberá realizar cambios importantes directamente en `main`.

---

# 26. Convención de commits

Se utilizarán prefijos sencillos:

* `feat:` nueva funcionalidad.
* `fix:` corrección.
* `test:` pruebas.
* `docs:` documentación.
* `refactor:` reorganización sin cambiar funcionalidad.
* `chore:` configuración o mantenimiento.

Los mensajes deberán describir claramente el cambio realizado.

---

# 27. Gestión de tareas

Se recomienda utilizar Issues o un tablero de GitHub con las siguientes columnas:

* Backlog.
* Por hacer.
* En progreso.
* En revisión.
* Terminado.

Cada tarea deberá tener:

* Responsable.
* Descripción.
* Criterios de aceptación.
* Rama correspondiente.

Una persona no deberá comenzar una tarea que dependa de otra sin conocer previamente el contrato necesario.

---

# 28. Contrato entre backend y frontend

Antes de conectar una pantalla, ambos equipos deberán conocer:

* Endpoint.
* Método HTTP.
* Campos enviados.
* Campos recibidos.
* Respuestas esperadas.
* Posibles errores.

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

Frontend administrativo
→ API POST
→ Spring Boot
→ JPA
→ H2

### Caso 2 — Listar

H2
→ Spring Boot
→ API GET
→ Frontend público
→ Cartelera

### Caso 3 — Actualizar

Frontend administrativo
→ API PUT
→ Spring Boot
→ H2
→ Frontend actualizado

### Caso 4 — Eliminar

Frontend administrativo
→ API DELETE
→ Spring Boot
→ H2
→ Frontend actualizado

---

# 30. Pruebas mínimas del APF1

El backend deberá demostrar como mínimo:

* Crear película.
* Listar películas.
* Buscar película por ID.
* Actualizar película.
* Eliminar película.
* Comportamiento ante película inexistente.

Además deberán probar manualmente los endpoints utilizando Postman.

---

# 31. Definition of Done

Una funcionalidad solo podrá marcarse como terminada cuando:

* Compila correctamente.
* No produce errores inesperados.
* Cumple el requerimiento asignado.
* La API responde correctamente.
* Los datos se almacenan correctamente cuando corresponde.
* Tiene pruebas cuando corresponde.
* Fue probada por otro integrante.
* Está documentada.
* Tiene Pull Request.
* Fue integrada en `develop`.
* No rompe funcionalidades existentes.

---

# 32. Criterios para considerar terminado el APF1

## Backend

* [ ] Spring Boot inicia correctamente.
* [ ] H2 funciona correctamente.
* [ ] JPA/Hibernate funciona.
* [ ] CRUD de películas completo.
* [ ] GET funciona.
* [ ] GET por ID funciona.
* [ ] POST funciona.
* [ ] PUT funciona.
* [ ] DELETE funciona.
* [ ] Validaciones básicas implementadas.
* [ ] Manejo de recurso inexistente.
* [ ] Pruebas unitarias aprobadas.
* [ ] Colección Postman preparada.

## Frontend

* [ ] Página pública funcional.
* [ ] Cartelera consume la API.
* [ ] Administración lista películas.
* [ ] Administración registra películas.
* [ ] Administración modifica películas.
* [ ] Administración elimina películas.
* [ ] Diseño responsive básico.
* [ ] Bootstrap aplicado.
* [ ] Integración frontend/backend funcional.

## Documentación

* [ ] Punto 1.1 terminado.
* [ ] Punto 1.2 terminado.
* [ ] Punto 1.3 terminado.
* [ ] Punto 2.1 terminado.
* [ ] Punto 2.2 terminado.
* [ ] Punto 2.3 terminado.
* [ ] Punto 2.4 terminado.
* [ ] Diagramas terminados.
* [ ] Capturas y evidencias.
* [ ] Documento revisado por los cuatro.

## Presentación

* [ ] Presentación terminada.
* [ ] Demo preparada.
* [ ] Todos conocen el funcionamiento del sistema.
* [ ] Todos conocen la arquitectura.
* [ ] Todos pueden explicar la API.
* [ ] Todos conocen el alcance futuro.
* [ ] Tiempo total cercano a 8 minutos.

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

* Salas.
* Asientos.
* Funciones.
* Productos.
* Usuarios.
* Relaciones JPA.
* JPQL cuando sea necesario.
* Transacciones.
* Spring Security.
* Roles.
* JWT.

---

## APF3

Frontend definitivo.

* Angular.
* Componentes.
* Routing.
* Formularios.
* Validaciones.
* Consumo de API REST.
* Autenticación.
* Autorización.
* Integración con backend.

---

## Proyecto Final

Completar el flujo:

Película
→ Función
→ Asientos
→ Dulcería
→ Orden
→ Pago simulado
→ Ticket digital

Además:

* Integración completa.
* Pruebas.
* Correcciones.
* Seguridad.
* Despliegue.
* Documentación final.

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

# 35. Estado actual

**Fase actual:** APF1.

**Objetivo inmediato:** conseguir una integración vertical completamente funcional:

Frontend temporal
→ API REST
→ Spring Boot
→ JPA/Hibernate
→ H2

utilizando el módulo **Películas**.

---

# 36. Autores

Proyecto realizado por:

* Samuel
* See
* Frank
* Crhistian

Curso: **Desarrollo Web Integrado**

2026.

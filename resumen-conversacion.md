# Resumen de la conversación y avance del proyecto

Fecha: 2026-10-08

## Objetivo

Crear una aplicación para registrar entrenamientos diarios manualmente usando Angular y Node.js, con Antigravity integrado desde Visual Studio Code. Actualmente incluye autenticación con JWT y control de acceso por roles.

## Tecnologías

- Angular CLI 22.2.1
- Node.js 24.15.0
- npm 11.12.1
- Express 5.2.1
- CORS 2.8.6
- PostgreSQL 18
- pg (node-postgres)
- jsonwebtoken (JWT)
- bcryptjs
- Antigravity / Gemini Pro para asistencia al desarrollo

## Estructura del proyecto

```text
C:\Users\juan1\Cursos\project-ia
├── cliente/       # Frontend Angular
├── servidor/      # Backend Node.js + Express
├── AGENTS.md      # Contexto para Antigravity
└── resumen-conversacion.md
```

```text
servidor/
├── index.js               # Punto de entrada, monta rutas e initDB
├── db.js                  # Pool de conexión a PostgreSQL (ignorado por git)
├── init-db.js             # Crea tablas y siembra usuarios de prueba
├── middleware/auth.js     # JWT, matriz de permisos y control de acceso
└── rutas/
    ├── auth.js            # login, registro, /me, impersonar
    ├── usuarios.js        # gestión de usuarios, toggle temporal, activar
    └── entrenamientos.js  # CRUD con control de permisos
```

```text
cliente/src/app/
├── auth/login/            # Pantalla de inicio de sesión
├── auth/registro/         # Pantalla de registro
├── usuarios/              # Vista de gestión de usuarios (superadmin)

├── entrenamientos/        # lista, formulario, editar
├── guardas/auth.guard.ts  # Guarda de rutas autenticadas
├── interceptores/auth.interceptor.ts  # Adjunta el token JWT
├── modelos/usuario.ts     # Interface Usuario
└── servicios/             # auth.ts, usuario.ts, entrenamiento.ts
```

## Qué se hizo

1. Instalación y verificación de Node.js, npm y Angular CLI.
2. Creación del proyecto Angular en `cliente/`.
3. Creación del backend con Express en `servidor/`.
4. Creación de la API REST básica.
5. Configuración de `HttpClient` en Angular.
6. Creación de los servicios `EntrenamientoService`, `AuthService` y `UsuarioService`.
7. Creación de los componentes `Lista`, `Formulario` y `Editar`.
8. Integración frontend ↔ backend.
9. Creación de `AGENTS.md` para dar contexto del proyecto a Antigravity.
10. Persistencia inicial en archivo JSON (`servidor/datos/entrenamientos.json`).
11. Migración de persistencia a PostgreSQL (base `training_db`).
12. Corrección de nombres de columnas con mayúsculas en consultas SQL (`"duracionMinutos"`).
13. Mejora del diseño con CSS moderno (header, tarjetas, formularios).
14. Autenticación JWT en el servidor con `jsonwebtoken` y contraseñas con `bcryptjs`.
15. Tabla `usuarios` con roles y estado, más columna `oculto` en `entrenamientos`.
16. Interceptor JWT y guardas de rutas en Angular.
17. Pantallas de login, registro y navegación condicional por rol.
18. Vista de gestión de usuarios con toggle de assistant temporal y menú kebab.
19. Restricción de acciones de entrenamientos según el rol del usuario.

## Roles y permisos

| Permiso | Super Admin | Head Coach | Assistant Coach | Student |
|---|---|---|---|---|
| `workout:write` | Sí | Sí | No | No |
| `workout:read_hidden` | Sí | Sí | Sí | No |
| `workout:add_notes` | Sí | Sí | Sí | No |
| `attendance:mark` | Sí | Sí | Sí | No |
| `attendance:view_own` | Sí | Sí | Sí | Sí |
| `user:view` | Sí | Sí | Sí | No |
| `user:manage_students` | Sí | Sí | No | No |
| `user:toggle_temp_assistant` | Sí | Sí | Sí | No |

- Los usuarios de tipo `student` con `temporary_assistant = true` obtienen un **rol efectivo de `assistant_coach`** (sin `workout:write`).
- Las cuentas con `activo = false` no pueden iniciar sesión (bloqueo en el middleware).
- El superadmin puede **impersonar** a otro usuario para ver la app desde su perspectiva.

## Funcionalidades actuales

- Login y registro de usuarios.
- Control de acceso por rol con JWT.
- Listar, crear, editar y eliminar entrenamientos según permiso.
- Entrenamientos ocultos (`oculto`) visibles solo para quienes tienen `workout:read_hidden`.
- Gestión de usuarios: activar/desactivar cuentas y asignar assistant temporal.
- Impersonación de usuarios por parte del superadmin.
- Navegación condicional según el rol del usuario autenticado.

## Modelo de datos

### Tabla `entrenamientos`

```json
{
  "id": 1,
  "fecha": "2026-10-05",
  "tipo": "Fuerza",
  "duracionMinutos": 45,
  "notas": "Entrenamiento inicial",
  "oculto": false
}
```

### Tabla `usuarios`

```json
{
  "id": 1,
  "nombre": "Super Admin",
  "email": "admin@tracker.com",
  "password_hash": "(bcrypt)",
  "rol": "superadmin",
  "activo": true,
  "temporary_assistant": false,
  "created_at": "2026-10-07T12:00:00Z"
}
```

### Usuarios de prueba (contraseña: `123456`)

| Email | Rol | Activo | Assistant temporal |
|---|---|---|---|
| admin@tracker.com | superadmin | Sí | No |
| coach@tracker.com | head_coach | Sí | No |
| asistente@tracker.com | assistant_coach | Sí | No |
| juan@tracker.com | student | Sí | No |
| pedro@tracker.com | student | Sí | Sí |
| inactivo@tracker.com | student | No | No |

## Rutas de la API

### Autenticación (`/api/auth`)

- `POST /api/auth/login` — iniciar sesión (devuelve JWT)
- `POST /api/auth/registro` — registrar usuario
- `GET /api/auth/me` — usuario autenticado
- `POST /api/auth/impersonar/:id` — superadmin impersona a un usuario

### Usuarios (`/api/usuarios`)

- `GET /api/usuarios` — listar usuarios
- `GET /api/usuarios/:id` — obtener un usuario
- `POST /api/usuarios` — crear usuario
- `PATCH /api/usuarios/:id/temporary-assistant` — toggle de assistant temporal
- `PATCH /api/usuarios/:id/activo` — activar/desactivar cuenta

### Entrenamientos (`/api/entrenamientos`)

- `GET /api/entrenamientos` — listar (filtrado por rol)
- `GET /api/entrenamientos/:id` — obtener uno
- `POST /api/entrenamientos` — crear (requiere `workout:write`)
- `PUT /api/entrenamientos/:id` — actualizar
- `DELETE /api/entrenamientos/:id` — eliminar (requiere `workout:write`)

## Estado actual

La app gestiona entrenamientos con autenticación JWT y control de acceso por 4 roles (superadmin, head_coach, assistant_coach, student). Los datos persisten en PostgreSQL (base `training_db`, tablas `entrenamientos` y `usuarios`). El servidor ejecuta `initDB()` al arrancar para asegurar las tablas y usuarios de prueba. Proyecto versionado en git y sincronizado con GitHub: https://github.com/jmiguegarcia/enfocados

## Siguientes pasos posibles

- Implementar asistencia (`attendance:mark` y `attendance:view_own` aún no tienen rutas).
- Implementar bitácora/notas post-sesión (`workout:add_notes`).
- Asignación de rutinas y grupos por entrenador.
- Métricas generales del sistema y auditoría de cuentas para superadmin.
- Añadir filtros, búsqueda y estadísticas en la interfaz.
- Integrar Gemini para sugerencias.
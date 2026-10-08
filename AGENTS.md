# Training Tracker Project

Aplicación para registrar entrenamientos diarios.

## Estructura

- `cliente/`: aplicación Angular (puerto 4200)
- `servidor/`: API Node.js + Express (puerto 3000)

## Comandos

### Frontend (`cliente/`)

```bash
npm start
```

### Backend (`servidor/`)

```bash
npm start
```

## API

- `GET /api/entrenamientos`: lista entrenamientos
- `POST /api/entrenamientos`: crea uno
- `GET /api/entrenamientos/:id`: obtiene uno
- `PUT /api/entrenamientos/:id`: actualiza uno
- `DELETE /api/entrenamientos/:id`: elimina uno

## Modelo de entrenamiento

```json
{
  "id": 1,
  "fecha": "2026-10-05",
  "tipo": "Fuerza",
  "duracionMinutos": 45,
  "notas": "..."
}
```

## Notas

- Angular 22 usa standalone components.
- Los componentes deben usar `inject()` en lugar de constructor injection.
- En Angular 22 se busca usar signals para estado reactivo.

## Flujo de Commits y Git

- Cuando el usuario diga **"estoy listo para hacer commit y push"**, el asistente debe:
  - Analizar los ficheros que están en los cambios (`changes` / git status).
  - Generar un plan de commits para subir los cambios de manera ordenada utilizando **Conventional Commits**.
  - Entregar **únicamente el plan en el chat** con los comandos exactos (`git add` y `git commit -m "..."`).
  - **No ejecutar commits ni pushes directamente**: el usuario realiza los commits manualmente.

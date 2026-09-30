# Neathbound API

This is a deliberately small, free-to-run narrative API. It follows the useful
shape of a storylet backend: player state is evaluated against data-only
requirements, eligible storylets are returned, and branches apply effects to a
persisted state.

## Run

```bash
npm run api
```

The default port is `8787`; override it with `PORT=9000 npm run api`. Set
`NEATHBOUND_DB=/path/to/file.sqlite` to choose the database location.

## Endpoints

- `GET /api/health`
- `POST /api/players` with `{ "name": "..." }`
- `GET /api/players/:id`
- `GET /api/players/:id/storylets`
- `POST /api/players/:id/resolve` with `{ "storyletId", "branchId" }`
- `POST /api/players/:id/travel` with `{ "locationId" }`

## Authoring

Storylets live in `server/content/storylets.json`. Writers can add titles,
descriptions, requirements, challenge qualities, branches, and effects without
touching the runtime. The format is intentionally plain JSON so a future
admin/CMS surface can edit it safely.

# Worker backend

The Worker imports the same QBN engine used by local play. This keeps story
eligibility, challenge resolution and effects in one implementation.

## Local development

1. Install/use the current Wrangler CLI.
2. Apply the local D1 migration:

   ```bash
   npx wrangler@latest d1 migrations apply neathbound --local
   ```

3. Start the Worker:

   ```bash
   npx wrangler@latest dev --local
   ```

The checked-in `wrangler.jsonc` uses a placeholder production
`database_id`. Local D1 works with the preview binding. Before a real deploy,
create a D1 database named `neathbound` and replace the zero UUID with the ID
Cloudflare returns.

## API

All existing-player requests use an anonymous opaque ID in
`X-Neathbound-Player`.

- `POST /api/player` creates a server-generated anonymous player when no ID is supplied.
- `GET /api/player`
- `GET /api/location`
- `GET /api/storylets`
- `GET /api/journal`
- `POST /api/storylets/:storyletId/branches/:branchId/choose`
- `POST /api/reset`

There is deliberately no authentication yet. Anonymous IDs are suitable for an
early public prototype, not valuable player accounts. Authentication can be
added later without moving choice resolution back into the browser.

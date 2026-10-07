# barber-saas-notifications-app

> notifications bounded context: mobile UI (remote)

Part of the **Barber Saas** distributed system — team `barber-saas`, Grupo 2.
Governance and documentation live in [`barber-saas-docs`](https://github.com/code-corhuila/barber-saas-docs).

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `barber-saas-docs`.

---

## BarberSaaS — what this repository is

The **inbox** of BarberSaaS: an **Ionic Angular** domain app (ADR-013) loaded by the Angular shell
(`barber-saas-front`) at `/notifications`, for every signed-in role. It started as a copy of the
reference Angular app, `barber-saas-platform-admin-app`.

| Screen | Calls (`notification-service.yaml` 2.1.0) |
|---|---|
| Inbox: my notifications, most recent first, unread ones set apart, "Todas" / "No leídas", "Ver más" | `GET /api/v1/notifications` (`page`, `limit`, `read`) |
| Opening an unread notification marks it as read | `POST /api/v1/notifications/{id}/read` |
| "N sin leer" (the number for the shell's bell) | `GET /api/v1/notifications?read=false&limit=1` → `meta.total` |

```
federation.config.js            exposes './routes' only; Angular and Ionic shared as singletons
src/app/notifications.routes.ts the route the shell mounts under /notifications (lazy)
src/app/shell-context.ts        the contract with the shell (copied, never imported)
src/app/notifications/         calls, rules (time, counter), types and the inbox screen
src/app/ui/                     the four states of every view and the shared styles
```

Requests use the shell's `HttpClient` with relative `/api/...` URLs: the shell adds the gateway, the
token and `X-Correlation-Id` (norm 5.4.1). This app never calls `provideHttpClient()` and never
stores a token; the service takes the user from the token, so each person sees only their own inbox.

### How to start it

```bash
npm ci
npm start      # builds the remote and serves it at http://localhost:4305
```

Then the shell (`npm start` in `barber-saas-front`) and the platform (`./scripts/up.sh dev` in
`barber-saas-infra-postgres`); sign in with any role and open `/notifications`.

### How it is tested

`npm test` (Vitest, no TestBed): the calls against the contract (paths, `read=false`, the unread
count from `meta.total`, the escaped id) and the rules a person reads ("Ahora", "Hace 5 min",
"Ayer", "3 sin leer"). CI also builds the remote.

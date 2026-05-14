# Contributing

Thanks for taking a look. ResortsGeh is a portfolio project, but contributions and feedback are welcome.

## Local development

```bash
npm install
cp .env.example .env.local
npm run db:reset
npm run dev
```

The app boots at `http://localhost:3000`. See [README](README.md) for details on environment variables and seeded credentials.

## Required checks before opening a PR

```bash
npm run lint
npm run test
npm run build
```

CI runs the same three steps on every push and pull request. Keep them green.

## Code style

- TypeScript strict mode, no `any` unless unavoidable.
- Server actions live under `src/actions/`, route handlers under `src/app/api/`.
- Use the `isDemoModeEnabled()` guard before any mutation so demo deployments stay read-only.
- UI strings go through `next-intl` — add new keys to both `messages/en.json` and `messages/id.json`.
- Keep comments useful. Skip section banners and obvious restatements of the next line.

## Commit messages

Keep them short and descriptive (`fix: handle empty bookings list`, `feat: demo banner`). Squash merges keep main tidy.

## Security

If you spot a security issue, open a private GitHub advisory or email the developer listed on the disclaimer page rather than filing a public issue.

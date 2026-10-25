# NovaChat shared packages

Libraries shared by the NovaChat services, published to GitHub Packages under `@novachat-enterprise-erp`.

| Package | Purpose |
| --- | --- |
| `@novachat-enterprise-erp/cache` | Redis cache helpers |
| `@novachat-enterprise-erp/common` | Logging, HTTP, env and error utilities |
| `@novachat-enterprise-erp/contracts` | Shared zod schemas and types |
| `@novachat-enterprise-erp/events` | Redis event bus |
| `@novachat-enterprise-erp/testing` | Test harness helpers (PGlite, fixtures) |
| `@novachat-enterprise-erp/tsconfig` | Base TypeScript configs |

## Development

```sh
pnpm install
pnpm build
pnpm test
```

## Releasing

Bump the `version` of each changed package and merge to `main`. CI publishes every package whose version is not yet in the registry.

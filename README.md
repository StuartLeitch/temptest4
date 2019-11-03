# Hindawi

* ![Pipeline status](https://gitlab.com/hindawi/phenom/badges/develop/pipeline.svg?style=flat-square)
* [![Coverage report](https://gitlab.com/hindawi/phenom/badges/develop/coverage.svg?style=flat-square)](http://hindawi.gitlab.io/phenom/coverage.html)

## NX

This monorepo is managed with Nx. Visit the [Nx Documentation](https://nx.dev) to learn more.


## Development

```bash
npm start invoicing-graphql    # starts server localy
npm start invoicing-web        # starts frontend dev server localy
```

### Start infrastructure localy

```bash
./scripts/dev.sh up      # start local infrastructure
./scripts/dev.sh donw    # stop local infrastructure
```

This starts a docker compose stack with:

| service | port | URL | comments |
|---------|------|-----|----------|
| postgres | `5432` | `N/A` | postgres server. Credentials: user = pass = database = "postgres" |
| adminer | `8080` | [`localhost:8080`](http://localhost:8080) | UI for managing postgres db |
| SQS | `9325` | [`localhost:9325`](http://localhost:9325) (UI) | AWS SQS running localy |
|     | `9324` | [`localhost:9324`](http://localhost:9324) (SQS endpoint) |  |
| nginx | `8001` | [`localhost:8001/`](http://localhost:8001/) | Web app |
|       |        | [`localhost:8001/adminer`](http://localhost:8001/adminer) | Adminer runs here |
|       |        | [`localhost:8001/api`](http://localhost:8001/api) | API root |
|       |        | [`localhost:8001/graphql`](http://localhost:8001/graphql) | Grahql entrypoint |

**Note:**
The nginx container uses the host network and reverse proxies to:
 * `localhost:4200` for `invoicing-web`
 * `localhost:3000` for `invoicing-graphql`

Makes sure you start those services on the right ports (read configuration section below).

### Configuration management

All configuration variables will be provided to containers via ENVIRONMENT variables.

For local development create a `.env` file in the root of this repository. Use `.env.sample` as a sample file.

If you're adding new ENV variables make sure to update the `.env.sample` to make it easier for the next person.

#### invoicing-web

The frontend app will have it's configuration available at `window._env_`.

The file that provides this is `/assets/env-config.js` which is generated (in **production** environments) at
container startup and uses the container's ENVIRONMENT as a source of values and
this template: [`env-template.js`](https://gitlab.com/hindawi/phenom/blob/develop/apps/invoicing-web/src/env-template.js).

For **local development** create your own `env-config.js` under `apps/invoicing-web/src/assets`.
Use `env-config.sample.js` as a sample file.

Both `.env` and `env-config.js` are in `.gitignore` and should not be versioned.


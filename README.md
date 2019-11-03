# Hindawi

* ![Pipeline status](https://gitlab.com/hindawi/phenom/badges/develop/pipeline.svg?style=flat-square)
* [![Coverage report](https://gitlab.com/hindawi/phenom/badges/develop/coverage.svg?style=flat-square)](http://hindawi.gitlab.io/phenom/coverage.html)

## NX

This monorepo is managed with Nx. Visit the [Nx Documentation](https://nx.dev) to learn more.


## Development

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

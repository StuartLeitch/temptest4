require('dotenv').config();

const {
  FINANCE_IS_PRODUCTION,
  FINANCE_DB_USER,
  FINANCE_DB_PASS,
  FINANCE_DB_DEVELOPMENT_FILENAME,
  FINANCE_DB_STAGING_DB_NAME
} = process.env;

const NODE_ENV = FINANCE_IS_PRODUCTION === 'false' ? 'development' : 'staging';

const knexConfiguration = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: FINANCE_DB_DEVELOPMENT_FILENAME || './dev.sqlite3'
    },
    useNullAsDefault: true
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: FINANCE_DB_STAGING_DB_NAME || 'my_db',
      user: FINANCE_DB_USER || 'username',
      password: FINANCE_DB_PASS || 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: FINANCE_DB_STAGING_DB_NAME || 'my_db',
      user: FINANCE_DB_USER || 'username',
      password: FINANCE_DB_PASS || 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};

const config = knexConfiguration[NODE_ENV];

// export {config};
module.exports = config;

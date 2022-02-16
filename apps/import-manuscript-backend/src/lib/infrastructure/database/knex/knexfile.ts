require('dotenv').config();

const {
  NODE_ENV,
  DB_USER,
  DB_PASS,
  DB_NAME
} = process.env;


const knexConfiguration = {
  development: {
    client: 'postgresql',
    connection: {
      database: DB_NAME || 'importmanuscriptbackend',
      user: DB_USER || 'postgres',
      password: DB_PASS || 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: DB_NAME || 'importmanuscriptbackend',
      user: DB_USER || 'postgres',
      password: DB_PASS || 'postgres'
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
      database: DB_NAME || 'importmanuscriptbackend',
      user: DB_USER || 'postgres',
      password: DB_PASS || 'postgres'
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

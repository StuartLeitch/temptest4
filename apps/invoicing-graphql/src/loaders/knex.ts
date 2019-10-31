// import * as path from 'path';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
// import { createConnection, getConnectionOptions } from 'typeorm';
import Knex from 'knex';

import {environment} from '../environments/environment';

export const knexLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {

    // const connectionOptions = Object.assign(loadedConnectionOptions, {
    //     type: environment.db.type as any, // See createConnection options for valid types
    //     host: environment.db.host,
    //     port: environment.db.port,
    //     username: environment.db.username,
    //     password: environment.db.password,
    //     database: environment.db.database,
    //     synchronize: environment.db.synchronize,
    //     logging: environment.db.logging,
    //     entities: environment.app.dirs.entities,
    //     migrations: environment.app.dirs.migrations,
    // });

    const connection = Knex({
      client: environment.db.type as any,
      version: '11.5',
      connection: {
        host: environment.db.host,
        port: environment.db.port,
        user: environment.db.username,
        password: environment.db.password,
        database: environment.db.database,
      },
      migrations: {
        directory: environment.app.dirs.migrationsDir
      },
      seeds: {
        directory: environment.app.dirs.seedsDir
      },
      pool: {min: 0, max: 10, idleTimeoutMillis: 500},
      useNullAsDefault: true
    });

    await connection.migrate.latest();
    await connection.seed.run();

    if (settings) {
        settings.setData('connection', connection);
        settings.onShutdown(() => connection.destroy());
    }
};

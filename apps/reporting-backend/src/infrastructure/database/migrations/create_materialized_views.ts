import * as Knex from 'knex';
import { differenceInSeconds } from '../../../utils/utils';
import { Logger } from 'libs/shared/src/lib/infrastructure/logging/implementations/LoggerBuilder';
import { LogLevel } from 'libs/shared/src/lib/infrastructure/logging';
import { materializedViewList } from '../../views';

const logger = new Logger(LogLevel.Info, __filename);

export async function up(knex: Knex): Promise<any> {
  for (const view of materializedViewList) {
    logger.info('Migrating view: ' + view.getViewName());
    let queryStart = new Date();

    await knex.raw(view.getCreateQuery());
    for (const indexQuery of view.getPostCreateQueries()) {
      const indexQueryStart = new Date();
      await knex.raw(indexQuery);
      logger.debug(
        `Creating indices ${indexQuery} took ${differenceInSeconds(
          indexQueryStart
        )} seconds`
      );
    }

    logger.info(
      `Creating table and indices ${view.getViewName()} took ${differenceInSeconds(
        queryStart
      )} seconds`
    );
  }
}

export async function down(knex: Knex): Promise<any> {
  return Promise.all(
    [...materializedViewList]
      .reverse()
      .filter((v) => !!v)
      .map((view) => knex.raw(view.getDeleteQuery()))
  );
}

export const name = 'create_materialized_views.ts';

import * as Knex from 'knex';
import {
  PEER_REVIEW_EVENTS,
  REPORTING_TABLES,
} from 'libs/shared/src/lib/modules/reporting/constants';

export async function up(knex: Knex): Promise<any> {
  const peerReviewEvents = PEER_REVIEW_EVENTS.map((pre) => `'${pre}'`).join(
    ','
  );
  return knex.raw(`
        insert into ${REPORTING_TABLES.DEFAULT} select * from ${REPORTING_TABLES.PEER_REVIEW} where type not in (${peerReviewEvents});
        delete from ${REPORTING_TABLES.PEER_REVIEW} where type not in (${peerReviewEvents});
    `);
}

export async function down(knex: Knex): Promise<any> {}

export const name = '20210112142215_move_peer_review_events';

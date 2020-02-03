// CREATE TABLE dump_events (
// 	id uuid NOT NULL DEFAULT uuid_generate_v4(),
// 	"time" timestamp NOT NULL,
// 	"type" varchar NOT NULL,
// 	payload jsonb NULL,
// 	CONSTRAINT dump_events_pkey PRIMARY KEY (id)
// );
import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return Promise.all([
    knex.schema.createTable('dump_events', createEventTable),
    knex.schema.createTable('submission_events', createEventTable),
    knex.schema.createTable('journal_events', createEventTable),
    knex.schema.createTable('user_events', createEventTable),
    knex.schema.createTable('invoice_events', createEventTable)
  ]);
}

export async function down(knex: Knex): Promise<any> {
  return Promise.all([
    knex.schema.dropTable('dump_events'),
    knex.schema.dropTable('submission_events'),
    knex.schema.dropTable('journal_events'),
    knex.schema.dropTable('user_events'),
    knex.schema.dropTable('invoice_events')
  ]);
}

export const name = '20200128172115_create_events_tables.ts';

function createEventTable(table) {
  table.uuid('id').primary();
  table.timestamp('time');
  table.string('type');
  table.jsonb('payload');
  table.index('type'); // btree
}

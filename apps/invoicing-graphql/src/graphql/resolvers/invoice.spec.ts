import {createTestClient} from 'apollo-server-testing';
import gql from 'graphql-tag';
import Knex from 'knex';
import path from 'path';

import {InvoiceStatus} from '../schema/generated';
import {Config} from '../../config';
import {makeServer} from '../server';
import {makeContext} from '../../context';

const migrationsDirPath = path.resolve(
  __dirname,
  '../../../../../libs/shared/src/lib/infrastructure/database/knex/migrations'
);

const config = new Config();
const db = Knex({
  client: 'sqlite3',
  pool: {
    min: 1,
    max: 1
  },
  migrations: {
    directory: migrationsDirPath
  },
  connection: ':memory:',
  useNullAsDefault: true
});

describe('Query.invoice', () => {
  let server: any;
  let context: any;
  let client: any;

  beforeAll(async () => {
    await db.migrate.latest();

    context = makeContext(config, db);
    server = makeServer(context);
    client = createTestClient(server);
  });

  afterAll(async () => db.destroy());

  it('should work', async () => {
    const query = gql`
      query invoice($id: String!) {
        invoice(id: $id) {
          id
          status
        }
      }
    `;

    await db('invoices').insert({
      id: 'invoice-1',
      transactionId: 'transaction-1',
      status: InvoiceStatus.DRAFT
    });

    const res = await client.query({
      query,
      variables: {
        id: 'invoice-1'
      }
    });
    expect(res.data).toMatchSnapshot();
  });
});

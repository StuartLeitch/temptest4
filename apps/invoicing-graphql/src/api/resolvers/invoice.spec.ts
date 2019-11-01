import {createTestClient} from 'apollo-server-testing';
import gql from 'graphql-tag';

import {makeDb, destroyDb} from '../../../../../libs/shared/src/lib/infrastructure/database/knex';

import {makeServer} from '../../app/server';
import {makeContext} from '../../app/context';

describe('Query.invoice', () => {
  let db: any;
  let server: any;
  let context: any;
  let client: any;

  beforeAll(async () => {
    db = await makeDb();
    context = makeContext(db);
    server = makeServer(context);
    client = createTestClient(server);
  });

  afterAll(() => destroyDb(db));

  it('should work', async () => {
    const query = gql`
      query invoice($id: String!) {
        invoice(id: $id) {
          id
          totalAmount
        }
      }
    `;

    await db('invoices').insert({
      id: 'invoice-1',
      transactionId: 'transaction-1',
      status: 'draft'
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

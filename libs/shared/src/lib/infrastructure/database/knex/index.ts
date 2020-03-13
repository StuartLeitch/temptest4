import * as path from 'path';
import Knex from 'knex';
import knexTinyLogger from 'knex-tiny-logger';

export { Knex };

export enum TABLES {
  ADDRESSES = 'addresses',
  ARTICLES = 'articles',
  CATALOG = 'catalog',
  COUPONS = 'coupons',
  INVOICES = 'invoices',
  INVOICE_ITEMS = 'invoice_items',
  INVOICES_WAIVERS = 'invoices_waivers',
  PAYERS = 'payers',
  PAYMENTS = 'payments',
  PAYMENT_METHODS = 'payment_methods',
  TRANSACTIONS = 'transactions',
  WAIVERS = 'waivers',
  EDITORS = 'editors',
  JOURNALS = 'journals',
  INVOICE_ITEMS_TO_COUPONS = 'invoice_items_to_coupons',
  INVOICE_ITEMS_TO_WAIVERS = 'invoice_items_to_waivers',
  PUBLISHERS = 'publishers',
  PUBLISHER_CUSTOM_VALUES = 'publisher_custom_values',
  NOTIFICATIONS_SENT = 'notifications_sent',
  PAUSED_NOTIFICATIONS = 'paused_notifications'
}

interface DbOptions {
  filename: string;
}

const defaultDbOptions: DbOptions = {
  filename: ':memory:'
};

export async function makeDb(
  options: DbOptions = defaultDbOptions
): Promise<Knex> {
  const db = Knex({
    client: 'sqlite3',
    connection: {
      filename: options.filename
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    },
    // pool: {min: 0, max: 10, idleTimeoutMillis: 500},
    useNullAsDefault: true
  });

  await db.migrate.latest();

  return db;
}

export async function destroyDb(db: Knex): Promise<void> {
  db.destroy();
}

export async function clearTable(db: Knex, ...tables: string[]): Promise<Knex> {
  await Promise.all(tables.map(async table => await db(table).truncate()));

  return db;
}

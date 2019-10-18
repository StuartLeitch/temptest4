import * as Knex from 'knex';
import uuid from 'uuid/v4';

import {default as catalog_items} from './catalog_items';

exports.seed = (knex: Knex) => seed(knex);

const seed = async (knex: Knex) => {
  await knex('catalog').del();

  const cis = Object.values(catalog_items) as string[];

  const inserts = cis.reduce((inserts: any[], ci: any) => {
    const {
      journalTitle,
      ISSN,
      APC: {currency, amount}
    } = ci;

    const catalogItem = {
      id: uuid(),
      journalTitle,
      issn: ISSN,
      type: 'APC',
      amount: Number(parseFloat(amount.replace(',', ''))),
      currency
    };
    inserts.push(knex('catalog').insert(catalogItem));
    return inserts;
  }, []);

  await Promise.all<any[]>(inserts);
};

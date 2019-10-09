import {GluegunToolbox} from 'gluegun';
import JSONDB from '../../../../../phenom-finance/packages/apps/payment/src/delivery/cli/src/lowdb';

import {
  // CreateTransactionForAPCFlow,
  TransactionRepoContract,
  // TransactionJsonRepo,
  // InvoiceRepoContract,
  // InvoiceJsonRepo,
  // Article,
  ArticleRepoContract,
  ArticleJsonRepo,
  PriceRepoContract,
  PriceJsonRepo
} from '../../../../../phenom-finance/packages/shared/lib';

let articleRepo: ArticleRepoContract;
let transactionRepo: TransactionRepoContract;
// let invoiceRepo: InvoiceRepoContract
let priceRepo: PriceRepoContract;

/**
 * Create the repos and kick it off
 */
module.exports = async (toolbox: GluegunToolbox) => {
  // const jsondb = JSONDB.getInstance()
  // await jsondb.prepare()
  const db = JSONDB.getDBInstance();

  // transactionRepo = new TransactionJsonRepo(db)
  articleRepo = new ArticleJsonRepo(db);
  // invoiceRepo = new InvoiceJsonRepo(db)
  priceRepo = new PriceJsonRepo(db);

  // attach the flow to the toolbox
  toolbox.transactionRepo = transactionRepo;
  toolbox.articleRepo = articleRepo;
  toolbox.priceRepo = priceRepo;
  // toolbox.createTransactionFlow = createTransactionFlow
};

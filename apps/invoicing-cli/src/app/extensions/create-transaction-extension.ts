import {UniqueEntityID} from './../../../../../../../shared/lib/core/domain/UniqueEntityID';
import {GluegunToolbox} from 'gluegun';
import JSONDB from '../../../../../phenom-finance/packages/apps/payment/src/delivery/cli/src/lowdb';

import {
  // CreateTransactionForAPCFlow,
  // TransactionRepoContract,
  // TransactionJsonRepo,
  // InvoiceRepoContract,
  // InvoiceJsonRepo,
  Article,
  ArticleRepoContract,
  ArticleJsonRepo
  // Price,
  // PriceId,
  // PriceValue
} from '../../../../../phenom-finance/packages/shared/lib';

const CLI_ARTICLE_ID = 'test-article-cli';
// const CLI_PRICE_ID = 'test-price-cli'
// const CLI_PRICE_VALUE = 100

let articleRepo: ArticleRepoContract;
// let transactionRepo: TransactionRepoContract
// let invoiceRepo: InvoiceRepoContract

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

  // creates a new price value and save it
  // const price = Price.create(
  //   {
  //     value: PriceValue.create(CLI_PRICE_VALUE).getValue()
  //   },
  //   new UniqueEntityID(CLI_PRICE_ID)
  // ).getValue()

  const articleAlreadyExists = await articleRepo.findById(CLI_ARTICLE_ID);

  if (!articleAlreadyExists) {
    // * Creates a new article and save it
    const article = Article.create(
      {
        // id: CLI_ARTICLE_ID,
        // associate article with pricing
        // priceId: price.priceId
      },
      new UniqueEntityID(CLI_ARTICLE_ID)
    ).getValue();
    await articleRepo.save(article);
  }

  // const createTransactionFlow = new CreateTransactionForAPCFlow(
  //   transactionRepo,
  //   invoiceRepo,
  //   articleRepo
  // )
  const createTransactionFlow = {};

  // attach the flow to the toolbox
  toolbox.createTransactionFlow = createTransactionFlow;
};

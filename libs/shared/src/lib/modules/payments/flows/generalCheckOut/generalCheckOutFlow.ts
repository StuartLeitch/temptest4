// * Core Domain
import {Flow} from '../../../../core/domain/Flow';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {
  Invoice,
  STATUS as InvoiceStatus
} from '../../../invoices/domain/Invoice';
import {Payment /*, STATUS as PaymentStatus */} from '../../domain/Payment';
// import {TransactionRepoContract} from './../../repos/contracts/transactionRepoContract';
// import {InvoiceRepoContract} from './../../../invoices/repos/contracts/invoiceRepoContract';
// import {ArticleRepoContract} from './../../../articles/repos/contracts/articleRepoContract';
// import {Article} from './../../../articles/domain/Article';
import {ArticleId} from '../../../articles/domain/ArticleId';

interface GeneralCheckoutFlowRequestDTO {
  invoiceId: string;
}

const ARTICLE_PRINTING_COST = 500;

export class GeneralCheckOutFlow
  implements Flow<GeneralCheckoutFlowRequestDTO, Result<Payment>> {
  // private transactionRepo: TransactionRepoContract;
  // private invoiceRepo: InvoiceRepoContract;
  // private articleRepo: ArticleRepoContract;

  constructor() // transactionRepo: TransactionRepoContract,
  // invoiceRepo: InvoiceRepoContract,
  // articleRepo: ArticleRepoContract
  {
    // this.transactionRepo = transactionRepo;
    // this.invoiceRepo = invoiceRepo;
    // this.articleRepo = articleRepo;
  }

  public async execute(
    request: GeneralCheckoutFlowRequestDTO
  ): Promise<Result<Payment>> {
    let {invoiceId} = request;

    // * System displays invoice information
    // * System displays applied discounts

    return null;

    // try {
    //   const articleOrError = await this.getArticle(request);
    //   if (articleOrError.isFailure) {
    //     return Result.fail<Transaction>(articleOrError.error);
    //   }

    //   // * System creates DRAFT transaction
    //   const transactionOrError = Transaction.create({
    //     articleId: ArticleId.create(new UniqueEntityID(articleId)),
    //     splitCount: 0,
    //     status: TransactionStatus.DRAFT
    //   });

    //   if (transactionOrError.isFailure) {
    //     return Result.fail<Transaction>(transactionOrError.error);
    //   }

    //   const transaction = transactionOrError.getValue();

    //   // * System creates DRAFT invoice
    //   const invoiceOrError = Invoice.create({
    //     transactionId: transaction.transactionId,
    //     status: InvoiceStatus.DRAFT,
    //     netAmount: ARTICLE_PRINTING_COST,
    //     dateAdded: new Date()
    //   });
    //   if (invoiceOrError.isFailure) {
    //     return Result.fail<Transaction>(transactionOrError.error);
    //   }
    //   const invoice = invoiceOrError.getValue();

    //   // TODO: Apply Editorial policies (waivers, discounts)
    //   // this.applyWaivers(invoice);

    //   // TODO: Apply Commercial policies (coupons)
    //   // TODO: Push transaction details to Accounting system (Sage/Salesforce)
    //   // TODO: OPTIONAL Publish transaction to OA Switchboard

    //   // This is where all the magic happens
    //   await this.invoiceRepo.save(invoice);
    //   await this.transactionRepo.save(transaction);

    //   return Result.ok<Transaction>(transaction);
    // } catch (err) {
    //   console.log(err);
    //   return Result.fail<Transaction>(err);
    // }
  }
}

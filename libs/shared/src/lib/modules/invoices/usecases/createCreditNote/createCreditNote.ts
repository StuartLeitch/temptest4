// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right, left } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceMap } from '../../mappers/InvoiceMap';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { Transaction } from '../../../transactions/domain/Transaction';

import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
  CreateCreditNoteAuthorizationContext
} from './createCreditNoteAuthorizationContext';
import { CreateCreditNoteRequestDTO } from './createCreditNoteDTO';
import { CreateCreditNoteResponse } from './createCreditNoteResponse';
import { CreateCreditNoteErrors } from './createCreditNoteErrors';

export class CreateCreditNoteUsecase
  implements
    UseCase<
      CreateCreditNoteRequestDTO,
      Promise<CreateCreditNoteResponse>,
      CreateCreditNoteAuthorizationContext
    >,
    AccessControlledUsecase<
      CreateCreditNoteRequestDTO,
      CreateCreditNoteAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract
  ) {
    this.invoiceRepo = invoiceRepo;
    this.invoiceItemRepo = invoiceItemRepo;
    this.transactionRepo = transactionRepo;
  }

  private async getAccessControlContext(
    request: CreateCreditNoteRequestDTO,
    context?: CreateCreditNoteAuthorizationContext
  ): Promise<AccessControlContext> {
    return {};
  }

  @Authorize('create:invoice')
  public async execute(
    request: CreateCreditNoteRequestDTO,
    context?: CreateCreditNoteAuthorizationContext
  ): Promise<CreateCreditNoteResponse> {
    let transaction: Transaction;
    let invoice: Invoice;
    let items: InvoiceItem[];

    // * build the InvoiceId
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    try {
      try {
        // * System identifies transaction by invoice Id
        transaction = await this.transactionRepo.getTransactionByInvoiceId(
          invoiceId
        );
      } catch (err) {
        return left(
          new CreateCreditNoteErrors.TransactionNotFoundError(request.invoiceId)
        );
      }

      try {
        // * System identifies invoice by Id
        invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        return left(
          new CreateCreditNoteErrors.InvoiceNotFoundError(request.invoiceId)
        );
      }

      // * check invoice status
      if (invoice.status === InvoiceStatus.DRAFT) {
        return left(Result.ok<void>());
      }

      // * set the invoice status to FINAL
      invoice.markAsFinal();
      console.log('Original Invoice:');
      console.info(invoice);
      await this.invoiceRepo.update(invoice);

      try {
        items = await this.invoiceItemRepo.getItemsByInvoiceId(invoiceId);
        // for (const item of items) {
        //   const [coupons, waivers] = await Promise.all([
        //     this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
        //     this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId)
        //   ]);
        //   item.coupons = coupons;
        //   item.waivers = waivers;
        // }
      } catch (err) {
        return left(
          // new GetItemsForInvoiceErrors.InvoiceNotFoundError(
          //   invoiceId.id.toString()
          // )
          new Error('Bad Invoice Items!')
        );
      }

      // * actually create the Credit Note
      const clonedRawInvoice = InvoiceMap.toPersistence(invoice);
      delete clonedRawInvoice.id;
      clonedRawInvoice.transactionId = transaction.id;
      clonedRawInvoice.dateCreated = new Date();
      clonedRawInvoice.dateIssued = new Date();
      const creditNote = InvoiceMap.toDomain(clonedRawInvoice);

      if (items.length) {
        items.forEach(async invoiceItem => {
          const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);
          rawInvoiceItem.invoiceId = creditNote.id.toString();
          rawInvoiceItem.price = invoiceItem.price * -1;
          rawInvoiceItem.dateCreated = new Date();
          delete rawInvoiceItem.id;
          const creditNoteInvoiceItem = InvoiceItemMap.toDomain(rawInvoiceItem);
          // creditNote.addInvoiceItem(invoiceItem);

          console.log('Anti Invoice Item:');
          console.info(creditNoteInvoiceItem);
          await this.invoiceItemRepo.save(creditNoteInvoiceItem);
        });
      }

      // * Assign the cancelled invoice reference
      creditNote.cancelledInvoiceReference = invoiceId.id.toString();

      console.log('New Credit Note:');
      console.info(creditNote);
      await this.invoiceRepo.save(creditNote);
      // transaction.addInvoice(creditNote);

      // console.log('ITEMS = ');
      // console.info(creditNote);

      // ? should generate a DRAFT invoice
      // if (request.createDraft) {
      //   const invoiceProps = {
      //     ...clonedRawInvoice,
      //     status: InvoiceStatus.DRAFT
      //   } as any; // TODO: should reference the real invoice props, as in its domain

      //   // * System creates DRAFT invoice
      //   const invoiceOrError = Invoice.create(invoiceProps);

      //   // This is where all the magic happens
      //   const draftInvoice = invoiceOrError.getValue();
      //   if (items.length) {
      //     items.forEach(async invoiceItem => {
      //       invoiceItem.price *= -1;
      //       draftInvoice.addInvoiceItem(invoiceItem);
      //       await this.invoiceItemRepo.save(invoiceItem);
      //     });
      //   }
      //   await this.invoiceRepo.save(draftInvoice);
      // }

      return right(Result.ok<Invoice>(creditNote));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}

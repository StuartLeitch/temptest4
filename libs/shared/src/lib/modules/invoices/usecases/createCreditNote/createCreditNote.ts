// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right, left } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';

import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceMap } from '../../mappers/InvoiceMap';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { Transaction } from '../../../transactions/domain/Transaction';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
  CreateCreditNoteAuthorizationContext,
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
    private transactionRepo: TransactionRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract
  ) {
    this.invoiceRepo = invoiceRepo;
    this.invoiceItemRepo = invoiceItemRepo;
    this.transactionRepo = transactionRepo;
    this.couponRepo = couponRepo;
    this.waiverRepo = waiverRepo;
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

      // console.log('Original Invoice:');
      // console.info(invoice);
      await this.invoiceRepo.update(invoice);

      try {
        items = await this.invoiceItemRepo.getItemsByInvoiceId(invoiceId);
        for (const item of items) {
          const [coupons, waivers] = await Promise.all([
            this.couponRepo.getCouponsByInvoiceItemId(item.invoiceItemId),
            this.waiverRepo.getWaiversByInvoiceItemId(item.invoiceItemId),
          ]);
          coupons.forEach((c) => item.addCoupon(c));
          item.waivers = waivers;
        }
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
      clonedRawInvoice.transactionId = transaction.transactionId.id.toString();
      clonedRawInvoice.dateCreated = new Date();
      clonedRawInvoice.dateIssued = new Date();
      const creditNote = InvoiceMap.toDomain(clonedRawInvoice);

      if (items.length) {
        items.forEach(async (invoiceItem) => {
          const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);
          rawInvoiceItem.invoiceId = creditNote.id.toString();
          rawInvoiceItem.price = invoiceItem.price * -1;
          rawInvoiceItem.dateCreated = new Date();
          delete rawInvoiceItem.id;

          invoiceItem.coupons.getItems().forEach((c) => {
            rawInvoiceItem.price -=
              ((invoiceItem.price * -1) / 100) * c.reduction;
          });

          invoiceItem.waivers.forEach((w) => {
            rawInvoiceItem.price -=
              ((invoiceItem.price * -1) / 100) * w.reduction;
          });

          // const vat = (invoiceItem.price / 100) * rawInvoiceItem?.vat;
          // rawInvoiceItem.price += vat;

          const creditNoteInvoiceItem = InvoiceItemMap.toDomain(rawInvoiceItem);
          // creditNote.addInvoiceItem(invoiceItem);

          // console.log('Anti Invoice Item:');
          // console.info(creditNoteInvoiceItem);
          await this.invoiceItemRepo.save(creditNoteInvoiceItem);
        });
      }

      // * Assign the cancelled invoice reference
      // * This assignment will trigger an INVOICE_CREDITED event
      creditNote.cancelledInvoiceReference = invoiceId.id.toString();
      creditNote.markAsFinal();

      // console.log('New Credit Note:');
      // console.info(creditNote);
      await this.invoiceRepo.save(creditNote);
      // transaction.addInvoice(creditNote);

      // console.log('ITEMS = ');
      // console.info(creditNote);

      // ? should generate a DRAFT invoice
      if (request.createDraft) {
        const invoiceProps = {
          ...clonedRawInvoice,
          status: InvoiceStatus.DRAFT,
          invoiceNumber: null,
          erpReference: null,
          dateIssued: null,
        } as any; // TODO: should reference the real invoice props, as in its domain

        // * System creates DRAFT invoice
        // console.info(invoiceProps);

        // This is where all the magic happens
        let draftInvoice = InvoiceMap.toDomain(invoiceProps);
        let waiverTypes = [];
        if (items.length) {
          items.forEach(async (invoiceItem) => {
            const rawInvoiceItem = InvoiceItemMap.toPersistence(invoiceItem);
            rawInvoiceItem.invoiceId = draftInvoice.id.toString();
            rawInvoiceItem.price = invoiceItem.price;
            rawInvoiceItem.dateCreated = new Date();
            delete rawInvoiceItem.id;

            const draftInvoiceItem = InvoiceItemMap.toDomain(rawInvoiceItem);
            draftInvoice.addInvoiceItem(draftInvoiceItem);

            // console.log('Draft Invoice Item:');
            // console.info(draftInvoiceItem);
            await this.invoiceItemRepo.save(draftInvoiceItem);

            // * save coupons
            invoiceItem.coupons.getItems().forEach(async (c) => {
              await this.couponRepo.assignCouponToInvoiceItem(
                c,
                draftInvoiceItem.invoiceItemId
              );
            });

            waiverTypes = invoiceItem.waivers.reduce((acc, w) => {
              acc.push(w.waiverType);
              return acc;
            }, []);
          });
        }

        // console.log('Draft Invoice:');
        // console.info(draftInvoice);
        await this.invoiceRepo.save(draftInvoice);
        draftInvoice = await this.invoiceRepo.assignInvoiceNumber(
          draftInvoice.invoiceId
        );
        await this.invoiceRepo.update(draftInvoice);

        // * save waivers
        await this.waiverRepo.attachWaiversToInvoice(
          waiverTypes,
          draftInvoice.invoiceId
        );

        draftInvoice.generateCreatedEvent();
        DomainEvents.dispatchEventsForAggregate(draftInvoice.id);
      }

      DomainEvents.dispatchEventsForAggregate(invoice.id);
      DomainEvents.dispatchEventsForAggregate(creditNote.id);

      return right(Result.ok<Invoice>(creditNote));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}

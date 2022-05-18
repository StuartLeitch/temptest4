import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging';
import {
  RegisterPaymentResponse,
  RegisterPaymentRequest,
  ErpServiceContract,
} from '../../../../domain/services/ErpService';

import { CatalogItem } from '../../../journals/domain/CatalogItem';
import { JournalId } from '../../../journals/domain/JournalId';
import { Invoice } from '../../../invoices/domain/Invoice';
import { PaymentStatus } from '../../domain/Payment';
import { PaymentId } from '../../domain/PaymentId';

import { ErpReferenceMap } from '../../../vendors/mapper/ErpReference';

import { InvoiceItemRepoContract } from './../../../invoices/repos/invoiceItemRepo';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';
import { PaymentMethodRepoContract } from './../../repos/paymentMethodRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { ErpReferenceRepoContract } from '../../../vendors/repos';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { PaymentRepoContract } from './../../repos/paymentRepo';
import { CatalogRepoContract } from '../../../journals/repos';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { GetItemsForInvoiceUsecase } from './../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';

import { PublishPaymentToErpResponse as Response } from './publishPaymentToErpResponse';
import type { PublishPaymentToErpDTO as DTO } from './publishPaymentToErpDTO';

export class PublishPaymentToErpUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private paymentRepo: PaymentRepoContract,
    private paymentMethodRepo: PaymentMethodRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private catalogRepo: CatalogRepoContract,
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    super();
  }

  @Authorize('erp:publish')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let invoice: Invoice;
    try {
      const maybePayment = await this.paymentRepo.getPaymentById(
        PaymentId.create(new UniqueEntityID(request.paymentId))
      );

      if (maybePayment.isLeft()) {
        return left(new UnexpectedError(new Error(maybePayment.value.message)));
      }

      const payment = maybePayment.value;

      if (payment.status !== PaymentStatus.COMPLETED) {
        return;
      }

      const maybeInvoicePayments = await this.invoiceRepo.getInvoicePayments(
        payment.invoiceId
      );

      if (maybeInvoicePayments.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeInvoicePayments.value.message))
        );
      }

      const invoicePayments = maybeInvoicePayments.value;

      this.loggerService.info('PublishPaymentToERP payments', invoicePayments);

      const maybeInvoice = await this.invoiceRepo.getInvoiceById(
        payment.invoiceId
      );

      if (maybeInvoice.isLeft()) {
        return left(new UnexpectedError(new Error(maybeInvoice.value.message)));
      }

      const invoice = maybeInvoice.value;

      this.loggerService.info('PublishPaymentToERP invoice', invoice);

      let invoiceItems = invoice?.invoiceItems?.currentItems;

      if (invoiceItems.length === 0) {
        const getItemsUsecase = new GetItemsForInvoiceUsecase(
          this.invoiceItemRepo,
          this.couponRepo,
          this.waiverRepo
        );

        const resp = await getItemsUsecase.execute(
          {
            invoiceId: invoice.invoiceId.id.toString(),
          },
          context
        );
        this.loggerService.info(
          'PublishInvoiceToERP getItemsUsecase response',
          resp
        );
        if (resp.isLeft()) {
          throw new Error(
            `Invoice ${invoice.id.toString()} has no invoice items.`
          );
        }

        invoiceItems = resp.value;
        this.loggerService.info(
          'PublishInvoiceToERP invoice items',
          invoiceItems
        );
      }

      if (invoiceItems.length === 0) {
        throw new Error(`Invoice ${invoice.id} has no invoice items.`);
      }

      invoiceItems.forEach((ii) => invoice.addInvoiceItem(ii));
      this.loggerService.info(
        'PublishInvoiceToERP full invoice items',
        invoiceItems
      );

      // * Check if invoice amount is zero or less - in this case, we don't need to send to ERP
      if (invoice.getInvoiceTotal() <= 0) {
        const maybeNonInvoiceableErpReference = ErpReferenceMap.toDomain({
          entity_id: invoice.invoiceId.id.toString(),
          type: 'invoice',
          vendor: this.erpService.vendorName,
          attribute:
            this.erpService?.referenceMappings?.invoiceConfirmation ||
            'invoice',
          value: 'NON_INVOICEABLE',
        });

        if (maybeNonInvoiceableErpReference.isLeft()) {
          return left(
            new UnexpectedError(
              new Error(maybeNonInvoiceableErpReference.value.message)
            )
          );
        }

        const nonInvoiceableErpReference =
          maybeNonInvoiceableErpReference.value;

        const maybeResult = await this.erpReferenceRepo.save(
          nonInvoiceableErpReference
        );

        if (maybeResult.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeResult.value.message))
          );
        }

        return right(null);
      }

      const maybePaymentMethods =
        await this.paymentMethodRepo.getPaymentMethods();

      if (maybePaymentMethods.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePaymentMethods.value.message))
        );
      }

      const paymentMethods = maybePaymentMethods.value;

      const maybePayer = await this.payerRepo.getPayerByInvoiceId(
        invoice.invoiceId
      );

      if (maybePayer.isLeft()) {
        return left(new UnexpectedError(new Error(maybePayer.value.message)));
      }

      const payer = maybePayer.value;

      if (!payer) {
        throw new Error(`Invoice ${invoice.id} has no payers.`);
      }

      const getManuscriptUsecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const maybeManuscript = await getManuscriptUsecase.execute(
        { invoiceId: invoice.invoiceId.id.toString() },
        context
      );
      if (maybeManuscript.isLeft()) {
        throw new Error(maybeManuscript.value.message);
      }
      const manuscript = maybeManuscript.value[0];
      if (!manuscript) {
        throw new Error(`Invoice ${invoice.id} has no manuscripts associated.`);
      }

      this.loggerService.info('PublishInvoiceToERP manuscript', manuscript);

      let catalog: CatalogItem;
      try {
        const maybeCatalog = await this.catalogRepo.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(manuscript.journalId))
        );

        if (maybeCatalog.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeCatalog.value.message))
          );
        }

        catalog = maybeCatalog.value;

        if (!catalog) {
          throw new Error(`Invoice ${invoice.id} has no catalog associated.`);
        }
        this.loggerService.info('PublishInvoiceToERP catalog', catalog);
      } catch (err) {
        return err;
      }

      try {
        const erpData: RegisterPaymentRequest = {
          invoice,
          payer,
          paymentMethods,
          payment,
          total: invoice.invoiceTotal,
          manuscript: manuscript,
          invoicePayments,
        };

        let erpResponse: RegisterPaymentResponse;
        try {
          erpResponse = await this.erpService.registerPayment(erpData);

          if (erpResponse) {
            this.loggerService.info(
              `Updating invoice ${invoice.id.toString()}: paymentReference -> ${JSON.stringify(
                erpResponse
              )}`
            );
          }
        } catch (err) {
          return left(new UnexpectedError(err, err.toString()));
        }
        this.loggerService.info(
          'PublishPaymentToERP NetSuite response',
          erpResponse
        );

        this.loggerService.info('PublishPaymentToERP final payment', payment);
        await this.paymentRepo.updatePayment(payment);

        if (erpResponse) {
          const erpReference = ErpReferenceMap.toDomain({
            entity_id: payment.paymentId.id.toString(),
            type: 'payment',
            vendor: this.erpService.vendorName,
            attribute:
              this.erpService?.referenceMappings?.paymentConfirmation ||
              'payment',
            value: erpResponse.paymentReference,
          });

          if (erpReference.isLeft()) {
            return left(
              new UnexpectedError(new Error(erpReference.value.message))
            );
          }

          const maybeResult = await this.erpReferenceRepo.save(
            erpReference.value
          );

          if (maybeResult.isLeft()) {
            return left(
              new UnexpectedError(new Error(maybeResult.value.message))
            );
          }
        }
        return right(erpResponse);
      } catch (err) {
        return left(new UnexpectedError(err, err.toString()));
      }
    } catch (err) {
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}

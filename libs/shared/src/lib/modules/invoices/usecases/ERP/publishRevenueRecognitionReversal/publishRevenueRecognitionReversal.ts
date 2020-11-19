import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { right, left } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { JournalId } from '../../../../journals/domain/JournalId';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { ArticleRepoContract } from '../../../../manuscripts/repos';
import { InvoiceRepoContract } from './../../../repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { InvoiceItemRepoContract } from './../../../repos/invoiceItemRepo';

import * as Errors from './publishRevenueRecognitionReversal.errors';
import { GetAddressUseCase } from '../../../../addresses/usecases/getAddress/getAddress';
import { GetInvoiceDetailsUsecase } from '../../getInvoiceDetails/getInvoiceDetails';
import { GetItemsForInvoiceUsecase } from '../../getItemsForInvoice/getItemsForInvoice';
import { GetPublisherCustomValuesUsecase } from '../../../../publishers/usecases/getPublisherCustomValues';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetManuscriptByManuscriptIdUsecase } from './../../../../manuscripts/usecases/getManuscriptByManuscriptId';
import { PublishRevenueRecognitionReversalDTO as DTO } from './publishRevenueRecognitionReversal.dto';
import { PublishRevenueRecognitionReversalResponse as Response } from './publishRevenueRecognitionReversal.response';

export class PublishRevenueRecognitionReversalUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private catalogRepo: CatalogRepoContract,
    private publisherRepo: PublisherRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {}

  private async getAccessControlContext(request: any, context?: any) {
    return {};
  }

  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    const invoiceId = request.invoiceId;
    const getItemsUsecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );

    const getInvoiceDetails = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const getPayerDetails = new GetPayerDetailsByInvoiceIdUsecase(
      this.payerRepo,
      this.loggerService
    );
    const getAddress = new GetAddressUseCase(this.addressRepo);
    const getManuscript = new GetManuscriptByManuscriptIdUsecase(
      this.manuscriptRepo
    );
    const getPublisherCustomValue = new GetPublisherCustomValuesUsecase(
      this.publisherRepo
    );
    try {
      // Get Invoice
      const maybeInvoice = await getInvoiceDetails.execute(
        {
          invoiceId,
        },
        context
      );

      if (maybeInvoice.isLeft()) {
        return left(new Errors.InvoiceNotFoundError(invoiceId));
      }
      const invoice = maybeInvoice.value.getValue();

      //Get Invoice Items
      const maybeItems = await getItemsUsecase.execute(
        {
          invoiceId,
        },
        context
      );

      if (maybeItems.isLeft()) {
        return left(new Errors.InvoiceItemsNotFoundError(invoiceId));
      }

      const invoiceItems = maybeItems.value.getValue();
      if (invoiceItems.length === 0) {
        return left(new Errors.InvoiceItemsNotFoundError(invoiceId));
      }

      invoice.addItems(invoiceItems);

      //Get Payer details
      const maybePayer = await getPayerDetails.execute({ invoiceId }, context);
      if (maybePayer.isLeft()) {
        return left(new Errors.InvoicePayersNotFoundError(invoiceId));
      }
      const payer = maybePayer.value.getValue();
      const addressId = payer.billingAddressId.id.toString();

      //Get Billing address
      const maybeAddress = await getAddress.execute(
        {
          billingAddressId: addressId,
        },
        context
      );
      if (maybeAddress.isLeft()) {
        return left(new Errors.InvoiceAddressNotFoundError(invoiceId));
      }

      // Get Manuscript
      const manuscriptId = invoiceItems[0].manuscriptId.id.toString();
      const maybeManuscript = await getManuscript.execute(
        { manuscriptId },
        context
      );
      if (maybeManuscript.isLeft()) {
        return left(new Errors.InvoiceManuscriptNotFoundError(invoiceId));
      }

      const manuscript = maybeManuscript.value.getValue();
      if (!manuscript.datePublished) {
        return right(null);
      }

      //Get catalog
      const catalog = await this.catalogRepo.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(manuscript.journalId)).getValue()
      );

      if (!catalog) {
        return left(new Errors.InvoiceCatalogNotFoundError(invoiceId));
      }

      //Get publisher custom values
      const maybePublisherCustomValue = await getPublisherCustomValue.execute(
        {
          publisherId: catalog.publisherId.id.toString(),
        },
        context
      );
      if (maybePublisherCustomValue.isLeft()) {
        return left(new Errors.InvoiceCatalogNotFoundError(invoiceId));
      }
      const publisherCustomValues = maybePublisherCustomValue.value.getValue();

      const invoiceTotal = invoice.invoiceNetTotal;

      const erpResponse = await this.erpService.registerRevenueRecognitionReversal(
        {
          publisherCustomValues,
          manuscript,
          invoiceTotal,
          invoice,
          payer,
        }
      );

      this.loggerService.info(
        'ERP field',
        this.erpService.invoiceRevenueRecRefFieldName
      );
      this.loggerService.info('ERP response', erpResponse);

      this.loggerService.info(
        `ERP Revenue Recognized Reversal Invoice ${invoice.id.toString()}: revenueRecognitionReversalReference -> ${JSON.stringify(
          erpResponse
        )}`
      );

      if (erpResponse?.journal?.id) {
        invoice[this.erpService.invoiceRevenueRecRefFieldName] = String(
          erpResponse?.journal?.id
        );
      }

      await this.invoiceRepo.update(invoice);

      return right(erpResponse);
    } catch (err) {
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}

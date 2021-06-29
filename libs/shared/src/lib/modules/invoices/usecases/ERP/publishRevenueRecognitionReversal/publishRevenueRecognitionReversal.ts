import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext as Context,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { JournalId } from '../../../../journals/domain/JournalId';

import { ErpReferenceMap } from './../../../../vendors/mapper/ErpReference';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { LoggerContract } from '../../../../../infrastructure/logging/Logger';
import { InvoiceItemRepoContract } from './../../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { ErpReferenceRepoContract } from '../../../../vendors/repos';
import { ArticleRepoContract } from '../../../../manuscripts/repos';
import { InvoiceRepoContract } from './../../../repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { GetManuscriptByManuscriptIdUsecase } from './../../../../manuscripts/usecases/getManuscriptByManuscriptId';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetPublisherCustomValuesUsecase } from '../../../../publishers/usecases/getPublisherCustomValues';
import { GetAddressUsecase } from '../../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../getInvoiceDetails/getInvoiceDetails';

import { PublishRevenueRecognitionReversalResponse as Response } from './publishRevenueRecognitionReversal.response';
import { PublishRevenueRecognitionReversalDTO as DTO } from './publishRevenueRecognitionReversal.dto';
import * as Errors from './publishRevenueRecognitionReversal.errors';

export class PublishRevenueRecognitionReversalUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
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
    private erpReferenceRepo: ErpReferenceRepoContract,
    private erpService: ErpServiceContract,
    private loggerService: LoggerContract
  ) {
    super();
  }

  public async execute(request: DTO, context?: Context): Promise<Response> {
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
    const getAddress = new GetAddressUsecase(this.addressRepo);
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
      const invoice = maybeInvoice.value;

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

      const invoiceItems = maybeItems.value;
      if (invoiceItems.length === 0) {
        return left(new Errors.InvoiceItemsNotFoundError(invoiceId));
      }

      invoice.addItems(invoiceItems);

      //Get Payer details
      const maybePayer = await getPayerDetails.execute({ invoiceId }, context);
      if (maybePayer.isLeft()) {
        return left(new Errors.InvoicePayersNotFoundError(invoiceId));
      }
      const payer = maybePayer.value;
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

      const manuscript = maybeManuscript.value;
      if (!manuscript.datePublished) {
        return right(null);
      }

      // * Get catalog
      const maybeCatalog = await this.catalogRepo.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(manuscript.journalId))
      );

      if (maybeCatalog.isLeft()) {
        return left(new Errors.InvoiceCatalogNotFoundError(invoiceId));
      }

      const catalog = maybeCatalog.value;

      // * Get publisher custom values
      const maybePublisherCustomValue = await getPublisherCustomValue.execute(
        {
          publisherId: catalog.publisherId.id.toString(),
        },
        context
      );

      if (maybePublisherCustomValue.isLeft()) {
        return left(new Errors.InvoiceCatalogNotFoundError(invoiceId));
      }
      const publisherCustomValues = maybePublisherCustomValue.value;

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

      this.loggerService.info('ERP response', erpResponse);

      this.loggerService.info(
        `ERP Revenue Recognized Reversal Invoice ${invoice.id.toString()}: revenueRecognitionReversalReference -> ${JSON.stringify(
          erpResponse
        )}`
      );

      if (erpResponse?.journal?.id) {
        const erpReference = ErpReferenceMap.toDomain({
          // ? Uncomment this if you want to store the original credited invoice id
          // entity_id: invoice.cancelledInvoiceReference,
          entity_id: invoice.invoiceId.id.toString(),
          type: 'invoice',
          vendor: this.erpService.vendorName,
          attribute:
            this.erpService?.referenceMappings?.revenueRecognitionReversal ||
            'revenueRecognitionReversal',
          value: String(erpResponse?.journal?.id),
        });

        if (erpReference.isLeft()) {
          return left(
            new UnexpectedError(new Error(erpReference.value.message))
          );
        }

        await this.erpReferenceRepo.save(erpReference.value);

        this.loggerService.info(
          `ERP Revenue Recognized Invoice ${invoice.id.toString()}: Saved ERP reference -> ${JSON.stringify(
            erpResponse
          )}`
        );
      }

      await this.invoiceRepo.update(invoice);

      return right(erpResponse);
    } catch (err) {
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}

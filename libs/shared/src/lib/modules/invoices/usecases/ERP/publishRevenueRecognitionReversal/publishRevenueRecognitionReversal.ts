import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { Result, right, left } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { ErpServiceContract } from '../../../../../domain/services/ErpService';
import { AddressRepoContract } from '../../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from './../../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../../payers/repos/payerRepo';
import { PublisherRepoContract } from '../../../../publishers/repos';
import { ArticleRepoContract } from '../../../../manuscripts/repos';
import { InvoiceRepoContract } from './../../../repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../journals/repos';
import { CouponRepoContract } from '../../../../coupons/repos';
import { WaiverRepoContract } from '../../../../waivers/repos';

import { JournalId } from '../../../../journals/domain/JournalId';

import { LoggerContract } from '../../../../../infrastructure/logging/Logger';

import { GetItemsForInvoiceUsecase } from '../../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../getInvoiceDetails/getInvoiceDetails';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetAddressUseCase } from '../../../../addresses/usecases/getAddress/getAddress';
import { GetManuscriptByManuscriptIdUsecase } from './../../../../manuscripts/usecases/getManuscriptByManuscriptId';
import { GetPublisherCustomValuesUsecase } from '../../../../publishers/usecases/getPublisherCustomValues';
import { PublishRevenueRecognitionReversalDTO as DTO } from './publishRevenueRecognitionReversal.dto';
import { PublishRevenueRecognitionReversalResponse as Response } from './publishRevenueRecognitionReversal.response';
import * as Errors from './publishRevenueRecognitionReversal.errors';

export class PublishRevenuRecognitionReversalUsecase
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
        throw new Errors.InvoiceNotFoundError(invoiceId);
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
        throw new Errors.InvoiceItemsNotFoundError(invoiceId);
      }

      const invoiceItems = maybeItems.value.getValue();
      if (invoiceItems.length === 0) {
        throw new Errors.InvoiceItemsNotFoundError(invoiceId);
      }

      invoice.addItems(invoiceItems);

      //Get Payer details
      const maybePayer = await getPayerDetails.execute({ invoiceId }, context);
      if (maybePayer.isLeft()) {
        throw new Errors.InvoicePayersNotFoundError(invoiceId);
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
        throw new Errors.InvoiceAddressNotFoundError(invoiceId);
      }

      // Get Manuscript
      const manuscriptId = invoiceItems[0].manuscriptId.id.toString();
      const maybeManuscript = await getManuscript.execute(
        { manuscriptId },
        context
      );
      if (maybeManuscript.isLeft()) {
        throw new Errors.InvoiceManuscriptNotFoundError(invoiceId);
      }

      const manuscript = maybeManuscript.value.getValue();
      if (!manuscript.datePublished) {
        return right(Result.ok<any>(null));
      }

      //Get catalog
      const catalog = await this.catalogRepo.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(manuscript.journalId)).getValue()
      );

      if (!catalog) {
        throw new Errors.InvoiceCatalogNotFoundError(invoiceId);
      }

      //Get publisher custom values
      const maybePublisherCustomValue = await getPublisherCustomValue.execute(
        {
          publisherId: catalog.publisherId.id.toString(),
        },
        context
      );
      if (maybePublisherCustomValue.isLeft()) {
        throw new Errors.InvoiceCatalogNotFoundError(invoiceId);
      }
      const publisherCustomValues = maybePublisherCustomValue.value.getValue();

      const invoiceItem = invoice.invoiceItems.getItems().shift();
      const { coupons, waivers, price } = invoiceItem;
      let netCharges = price;
      if (coupons?.length) {
        netCharges -= coupons.reduce(
          (acc, coupon) => acc + (coupon.reduction / 100) * price,
          0
        );
      }
      if (waivers?.length) {
        netCharges -= waivers.reduce(
          (acc, waiver) => acc + (waiver.reduction / 100) * price,
          0
        );
      }

      const erpResponse = await this.erpService.registerRevenueRecognitionReversal(
        {
          manuscript,
          invoice,
          payer,
          publisherCustomValues,
          invoiceTotal: netCharges,
        }
      );

      this.loggerService.info(
        'ERP field',
        this.erpService.invoiceRevenueRecRefFieldName
      );
      this.loggerService.info('ERP response', erpResponse);

      this.loggerService.info(
        `ERP Revenue Recognized Reversal Invoice ${invoice.id.toString()}: revenueRecognitionReference -> ${JSON.stringify(
          erpResponse
        )}`
      );

      if (erpResponse?.journal?.id) {
        invoice[this.erpService.invoiceRevenueRecRefFieldName] = String(
          erpResponse?.journal?.id
        );
      }

      await this.invoiceRepo.update(invoice);

      return right(Result.ok<any>(erpResponse));
    } catch (err) {
      console.log(err);
      return left(new UnexpectedError(err, err.toString()));
    }
  }
}

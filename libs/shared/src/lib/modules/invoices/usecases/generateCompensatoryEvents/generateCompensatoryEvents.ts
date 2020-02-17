// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { AddressId } from '../../../addresses/domain/AddressId';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceStatus } from '../../domain/Invoice';
import { Payer } from '../../../payers/domain/Payer';
import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice } from '../../domain/Invoice';

import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import { PublishInvoiceConfirmed } from '../publishInvoiceConfirmed';
import { PublishInvoicePaid } from '../publishInvoicePaid';
import {
  PublishInvoiceCreatedUsecase,
  PublishInvoiceCreatedDTO
} from '../publishInvoiceCreated';

// * Usecase specific
import { GenerateCompensatoryEventsResponse as Response } from './generateCompensatoryEventsResponse';
import { GenerateCompensatoryEventsErrors as Errors } from './generateCompensatoryEventsErrors';
import { GenerateCompensatoryEventsDTO as DTO } from './generateCompensatoryEventsDTO';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';

class GenericError extends AppError.UnexpectedError {}

type Context = AuthorizationContext<Roles>;
export type GenerateCompensatoryEventsContext = Context;

export class GenerateCompensatoryEventsUsecase
  implements
    UseCase<DTO, Promise<Response>, GenerateCompensatoryEventsContext>,
    AccessControlledUsecase<
      DTO,
      GenerateCompensatoryEventsContext,
      AccessControlContext
    > {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private sqsPublish: SQSPublishServiceContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: DTO,
    context?: GenerateCompensatoryEventsContext
  ): Promise<Response> {
    const requestExecution = new AsyncEither<null, DTO>(request)
      .then(this.verifyInput)
      .then(request => this.publishInvoiceCreated(request))
      .then(request => this.publishInvoiceConfirmed(request))
      .then(request => this.publishInvoicePayed(request))
      .map(() => Result.ok<void>(null));

    return requestExecution.execute();
  }

  private async verifyInput(
    request: DTO
  ): Promise<Either<Errors.InvoiceIdRequired, DTO>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequired());
    }

    return right(request);
  }

  private async getInvoiceWithId(invoiceId: string) {
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const context = {
      roles: [Roles.PAYER]
    };
    const maybeResult = await usecase.execute({ invoiceId }, context);
    return maybeResult.map(result => result.getValue());
  }

  private async getInvoiceItemsForInvoiceId(invoiceId: InvoiceId) {
    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    const maybeResult = await usecase.execute({
      invoiceId: invoiceId.id.toString()
    });
    return maybeResult.map(result => result.getValue());
  }

  private async getManuscriptByInvoiceId(invoiceId: InvoiceId) {
    const usecase = new GetManuscriptByInvoiceIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );
    const maybeResult = await usecase.execute({
      invoiceId: invoiceId.id.toString()
    });
    return maybeResult.map(result => result.getValue());
  }

  private async getPayerForInvoiceId(invoiceId: InvoiceId) {
    try {
      const payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
      return right<GenericError, Payer>(payer);
    } catch (err) {
      return left<GenericError, Payer>(new GenericError(err));
    }
  }

  private async getAddressWithId(addressId: AddressId) {
    const usecase = new GetAddressUseCase(this.addressRepo);
    const maybeResult = await usecase.execute({
      billingAddressId: addressId.id.toString()
    });
    return maybeResult.map(result => result.getValue());
  }

  private async getPaymentInfo(invoiceId: InvoiceId) {
    try {
      const payment = await this.invoiceRepo.getInvoicePaymentInfo(invoiceId);
      return right<GenericError, InvoicePaymentInfo>(payment);
    } catch (err) {
      return left<GenericError, InvoicePaymentInfo>(new GenericError(err));
    }
  }

  private async publishInvoiceCreated(request: DTO) {
    const publishUsecase = new PublishInvoiceCreatedUsecase(this.sqsPublish);
    const execution = new AsyncEither<null, null>(null)
      .then(() => this.getInvoiceWithId(request.invoiceId))
      .then(async invoice => {
        const maybeItems = await this.getInvoiceItemsForInvoiceId(
          invoice.invoiceId
        );
        return maybeItems.map(invoiceItems => ({ invoice, invoiceItems }));
      })
      .then(async data => {
        const maybeManuscript = await this.getManuscriptByInvoiceId(
          data.invoice.invoiceId
        );
        return maybeManuscript.map(manuscripts => ({
          manuscript: manuscripts[0],
          ...data
        }));
      })
      .map(data => {
        const { invoice } = data;
        if (!invoice.dateAccepted) {
          return null;
        }
        invoice.props.dateUpdated = invoice.dateAccepted;
        invoice.status = InvoiceStatus.DRAFT;

        return {
          ...data,
          invoice,
          messageTimestamp: invoice.dateAccepted
        };
      })
      .then(async publishRequest => {
        if (!publishRequest) {
          return right<null, null>(null);
        }

        return publishUsecase.execute(publishRequest);
      })
      .map(() => request);
    return execution.execute();
  }

  private async publishInvoiceConfirmed(request: DTO) {
    const publishUsecase = new PublishInvoiceConfirmed(this.sqsPublish);

    const execution = new AsyncEither<null, null>(null)
      .then(() => this.getInvoiceWithId(request.invoiceId))
      .then(async invoice => {
        const maybeResult = await this.getInvoiceItemsForInvoiceId(
          invoice.invoiceId
        );
        return maybeResult.map(invoiceItems => ({ invoice, invoiceItems }));
      })
      .then(async data => {
        const maybeResult = await this.getManuscriptByInvoiceId(
          data.invoice.invoiceId
        );
        return maybeResult.map(manuscripts => ({
          ...data,
          manuscript: manuscripts[0]
        }));
      })
      .then(async data => {
        const maybePayer = await this.getPayerForInvoiceId(
          data.invoice.invoiceId
        );
        return maybePayer.map(payer => ({ ...data, payer }));
      })
      .then(async data => {
        if (!data.payer) {
          return right<
            null,
            {
              invoiceItems: InvoiceItem[];
              manuscript: Manuscript;
              invoice: Invoice;
              address: null;
              payer: Payer;
            }
          >({ ...data, address: null });
        }

        const maybeAddress = await this.getAddressWithId(
          data.payer.billingAddressId
        );
        return maybeAddress.map(address => ({ ...data, address }));
      })
      .map(data => {
        const invoice = data.invoice;
        if (
          invoice.status === InvoiceStatus.PENDING ||
          invoice.status === InvoiceStatus.DRAFT ||
          !invoice.dateAccepted ||
          !invoice.dateIssued
        ) {
          return null;
        }

        invoice.props.dateUpdated = invoice.dateIssued;
        invoice.status = InvoiceStatus.ACTIVE;

        return { ...data, invoice };
      })
      .then(async data => {
        if (!data) {
          return right<null, null>(null);
        }

        try {
          const result = await publishUsecase.execute(
            data.invoice,
            data.invoiceItems,
            data.manuscript,
            data.payer,
            data.address,
            data.invoice.dateIssued
          );
          return right<GenericError, void>(result);
        } catch (err) {
          return left<GenericError, void>(new GenericError(err));
        }
      })
      .map(() => request);

    return execution.execute();
  }

  private async publishInvoicePayed(request: DTO) {
    const publishUsecase = new PublishInvoicePaid(this.sqsPublish);

    const execution = new AsyncEither<null, null>(null)
      .then(() => this.getInvoiceWithId(request.invoiceId))
      .then(async invoice => {
        const maybeItems = await this.getInvoiceItemsForInvoiceId(
          invoice.invoiceId
        );
        return maybeItems.map(invoiceItems => {
          invoiceItems.forEach(item => invoice.addInvoiceItem(item));
          return invoice;
        });
      })
      .then(async invoice => {
        const maybeManuscript = await this.getManuscriptByInvoiceId(
          invoice.invoiceId
        );
        return maybeManuscript.map(manuscripts => ({
          invoice,
          manuscript: manuscripts[0]
        }));
      })
      .then(async data => {
        const maybePaymentInfo = await this.getPaymentInfo(
          data.invoice.invoiceId
        );
        return maybePaymentInfo.map(paymentInfo => ({ ...data, paymentInfo }));
      })
      .map(data => {
        const invoice = data.invoice;
        if (
          invoice.status !== InvoiceStatus.FINAL ||
          !invoice.dateAccepted ||
          !invoice.dateIssued
        ) {
          return null;
        }
        let paymentDate: Date;
        if (!data.paymentInfo) {
          paymentDate = invoice.dateIssued;
        } else {
          paymentDate = new Date(data.paymentInfo.paymentDate);
        }

        invoice.props.dateUpdated = paymentDate;

        return { ...data, invoice, paymentDate };
      })
      .then(async data => {
        if (!data) {
          return right<null, null>(null);
        }

        try {
          const result = await publishUsecase.execute(
            data.invoice,
            data.invoice.invoiceItems.currentItems,
            data.manuscript,
            data.paymentInfo,
            data.paymentDate
          );
          return right<GenericError, void>(result);
        } catch (err) {
          return left<GenericError, void>(new GenericError(err));
        }
      })
      .map(() => request);
    return execution.execute();
  }
}

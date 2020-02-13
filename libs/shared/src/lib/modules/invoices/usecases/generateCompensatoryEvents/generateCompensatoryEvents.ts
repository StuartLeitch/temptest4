// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither } from '../../../../core/logic/AsyncEither';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice, InvoiceStatus } from '../../domain/Invoice';

import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
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
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract
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
      .then(request => this.publishInvoiceCreated(request));

    return null;
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
    const maybeResult = await usecase.execute({ invoiceId });
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
      .then(async ({ invoice, invoiceItems }) => {
        const maybeManuscript = await this.getManuscriptByInvoiceId(
          invoice.invoiceId
        );
        return maybeManuscript.map(manuscripts => ({
          manuscript: manuscripts[0],
          invoice,
          invoiceItems
        }));
      })
      .map(data => {
        const { invoice } = data;
        if (!invoice.dateAccepted || invoice.status === InvoiceStatus.DRAFT) {
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
}

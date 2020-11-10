// * Core Domain
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { Either, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceStatus } from '../../domain/Invoice';
import { Invoice } from '../../domain/Invoice';

import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetPaymentsByInvoiceIdUsecase } from '../../../payments/usecases/getPaymentsByInvoiceId';
import { GetPaymentMethodsUseCase } from '../../../payments/usecases/getPaymentMethods';
import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import { PublishInvoiceDraftCreatedUseCase } from '../publishEvents/publishInvoiceDraftCreated';

// * Usecase specific
import { GenerateDraftCompensatoryEventsInvoiceResponse as Response } from './generateDraftCompensatoryEventsInvoice.response';
import { GenerateDraftCompensatoryEventsInvoiceDTO as DTO } from './generateDraftCompensatoryEventsInvoice.dto';
import * as Errors from './generateDraftCompensatoryEventsInvoice.errors';

type Context = UsecaseAuthorizationContext;

interface WithInvoiceId {
  invoiceId: string;
}

interface WithInvoice {
  invoice: Invoice;
}

interface WithInvoiceItems {
  invoiceItems: InvoiceItem[];
}

interface WithManuscript {
  manuscript: Manuscript;
}

function roundToHour(dateToRound: Date): Date {
  const date = new Date(dateToRound);
  date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
  date.setMinutes(0, 0, 0);
  return date;
}

export class GenerateDraftCompensatoryEventsInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private queueService: SQSPublishServiceContract,
    private logger: LoggerContract
  ) {
    this.sendInvoiceDraftCreated = this.sendInvoiceDraftCreated.bind(this);
    this.attachInvoiceItems = this.attachInvoiceItems.bind(this);
    this.attachManuscript = this.attachManuscript.bind(this);
    this.attachInvoice = this.attachInvoice.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:regenerateEvents')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.attachInvoice(context))
        .then(this.attachInvoiceItems(context))
        .then(this.attachManuscript(context))
        .then(this.sendInvoiceDraftCreated(context));

      const result = await execution.execute();
    } catch (e) {
      return left(
        new UnexpectedError(
          e,
          `While regenerating draft events for invoice with id {${request.invoiceId}}`
        )
      );
    }
    return right(null);
  }

  private async validateRequest<T extends DTO>(
    request: T
  ): Promise<Either<Errors.InvoiceIdRequiredError, T>> {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }

    return right(request);
  }

  private attachInvoice(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
      const { invoiceId } = request;

      const maybeInvoice = await usecase.execute({ invoiceId }, context);
      return maybeInvoice
        .map((result) => result.getValue())
        .map((invoice) => ({ ...request, invoice }));
    };
  }

  private attachInvoiceItems(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetItemsForInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo
      );
      const { invoiceId } = request;

      const maybeItems = await usecase.execute({ invoiceId }, context);
      return maybeItems
        .map((result) => result.getValue())
        .map((items) => ({
          ...request,
          invoiceItems: items,
        }));
    };
  }

  private attachManuscript(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new GetManuscriptByInvoiceIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const { invoiceId } = request;

      const maybeManuscript = await usecase.execute({ invoiceId }, context);
      return maybeManuscript
        .map((result) => result.getValue())
        .chain((manuscripts) => {
          if (manuscripts.length === 0) {
            return left(new Errors.InvoiceHasNoManuscript(invoiceId));
          }

          return right(manuscripts);
        })
        .map((manuscripts) => manuscripts[0])
        .map((manuscript) => ({ ...request, manuscript }));
    };
  }

  private async keepInitialWaivers<T extends WithInvoiceItems & WithInvoice>(
    request: T
  ) {
    const { invoiceItems, invoice } = request;

    const dateCreated = roundToHour(invoice.dateCreated);

    const newItems = invoiceItems.map((item) => {
      // item.props.assignedCoupons = Coupons.create();
      // item.assignedWaivers = item.assignedWaivers.filter(waiver => waiver.)
    });
  }

  private sendInvoiceDraftCreated(context: Context) {
    return async <T extends WithInvoiceItems & WithManuscript & WithInvoice>(
      request: T
    ) => {
      const usecase = new PublishInvoiceDraftCreatedUseCase(this.queueService);
      const { invoiceItems, manuscript, invoice } = request;

      const maybeSent = await usecase.execute(
        {
          invoiceItems,
          manuscript,
          invoice,
          messageTimestamp: invoice.dateCreated,
        },
        context
      );
      return maybeSent.map(() => request);
    };
  }
}

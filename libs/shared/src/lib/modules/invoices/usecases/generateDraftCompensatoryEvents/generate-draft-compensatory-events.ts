import { cloneDeep } from 'lodash';

// * Core Domain
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { Either, right, left } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { CouponAssignedCollection } from '../../../coupons/domain/CouponAssignedCollection';
import { WaiverAssignedCollection } from '../../../waivers/domain/WaiverAssignedCollection';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Invoice } from '../../domain/Invoice';

import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';
import { IsInvoiceDeletedUsecase } from '../isInvoiceDeleted';

import { PublishInvoiceDraftDueAmountUpdatedUseCase } from '../publishEvents/publishInvoiceDraftDueAmountUpdated';
import { PublishInvoiceDraftCreatedUseCase } from '../publishEvents/publishInvoiceDraftCreated';
import { PublishInvoiceDraftDeletedUseCase } from '../publishEvents/publishInvoiceDraftDeleted';

// * Usecase specific
import { GenerateDraftCompensatoryEventsResponse as Response } from './generate-draft-compensatory-events.response';
import { GenerateDraftCompensatoryEventsDTO as DTO } from './generate-draft-compensatory-events.dto';
import * as Errors from './generate-draft-compensatory-events.errors';

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

type DraftEventData = WithInvoiceItems & WithManuscript & WithInvoice;

function roundToHour(dateToRound: Date): Date {
  const date = new Date(dateToRound);
  date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
  date.setMinutes(0, 0, 0);
  return date;
}

export class GenerateDraftCompensatoryEventsUsecase
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
    this.sendDueAmountUpdated = this.sendDueAmountUpdated.bind(this);
    this.sendCreated = this.sendCreated.bind(this);
    this.sendDeleted = this.sendDeleted.bind(this);

    this.shouldSendDeleteEvent = this.shouldSendDeleteEvent.bind(this);

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
      const execution = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.attachInvoice(context))
        .then(this.attachInvoiceItems(context))
        .then(this.attachManuscript(context))
        .map(this.keepInitialWaivers)
        .then(this.sendCreated(context))
        .then(this.attachInvoiceItems(context))
        .then(this.sendDueAmountUpdated(context))
        .advanceOrEnd(this.shouldSendDeleteEvent(context))
        .then(this.sendDeleted(context))
        .execute();

      return execution.map(() => null);
    } catch (e) {
      return left(
        new UnexpectedError(
          e,
          `While regenerating draft events for invoice with id {${request.invoiceId}}`
        )
      );
    }
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

  private keepInitialWaivers<T extends WithInvoiceItems & WithInvoice>(
    request: T
  ) {
    const { invoiceItems, invoice } = request;

    const dateCreated = roundToHour(invoice.dateCreated);

    const newItems = invoiceItems.map((item) => {
      const initialWaivers = item.assignedWaivers.filter((w) => {
        return roundToHour(w.dateAssigned).getTime() === dateCreated.getTime();
      });
      item.props.assignedWaivers = WaiverAssignedCollection.create(
        initialWaivers
      );
      item.props.assignedCoupons = CouponAssignedCollection.create();
      return item;
    });

    return {
      ...request,
      invoiceItems: newItems,
    };
  }

  private sendCreated(context: Context) {
    return async <T extends DraftEventData>(request: T) => {
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

  private sendDueAmountUpdated(context: Context) {
    return async <T extends DraftEventData>(request: T) => {
      const usecase = new PublishInvoiceDraftDueAmountUpdatedUseCase(
        this.queueService
      );
      const { invoiceItems, manuscript, invoice } = request;

      const allW = invoiceItems
        .map((i) =>
          i.assignedWaivers
            .filter((w) =>
              invoice.dateAccepted
                ? w.dateAssigned < invoice.dateAccepted
                : true
            )
            .map((w) => roundToHour(w.dateAssigned))
        )
        .reduce((acc, d) => acc.concat(d));
      const allC = invoiceItems
        .map((i) =>
          i.assignedCoupons
            .filter((c) =>
              invoice.dateAccepted
                ? c.dateAssigned < invoice.dateAccepted
                : true
            )
            .map((c) => roundToHour(c.dateAssigned))
        )
        .reduce((acc, d) => acc.concat(d));
      const allReductionDates = Array.from(
        new Set(allW.concat(allC).concat([roundToHour(invoice.dateCreated)]))
      ).sort((a, b) => {
        if (a < b) return -1;
        else if (a.getTime() === b.getTime()) return 0;
        else return 1;
      });
      allReductionDates.shift();

      const originalItems = cloneDeep(invoiceItems);

      let finalResp = right(null);

      allReductionDates.forEach(async (date) => {
        const it = cloneDeep(originalItems);

        const newItems = it.map((item) => {
          const apCoupons = item.assignedCoupons.filter(
            (w) => roundToHour(w.dateAssigned) <= date
          );
          const apWaivers = item.assignedWaivers.filter(
            (w) => roundToHour(w.dateAssigned) <= date
          );
          item.props.assignedCoupons = CouponAssignedCollection.create(
            apCoupons
          );
          item.props.assignedWaivers = WaiverAssignedCollection.create(
            apWaivers
          );
          return item;
        });

        const maybeSent = await usecase.execute(
          {
            manuscript,
            invoice,
            messageTimestamp: date,
            invoiceItems: newItems,
          },
          context
        );

        finalResp = finalResp.chain(() => maybeSent);
      });

      return finalResp.map(() => request);
    };
  }

  private shouldSendDeleteEvent(context: Context) {
    return async <T extends WithInvoiceId>(request: T) => {
      const usecase = new IsInvoiceDeletedUsecase(
        this.invoiceRepo,
        this.logger
      );
      const { invoiceId } = request;

      const maybeDeleted = await usecase.execute({ invoiceId }, context);

      return maybeDeleted;
    };
  }

  private sendDeleted(context: Context) {
    return async <T extends DraftEventData>(request: T) => {
      const usecase = new PublishInvoiceDraftDeletedUseCase(this.queueService);
      const { invoice, invoiceItems, manuscript } = request;

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

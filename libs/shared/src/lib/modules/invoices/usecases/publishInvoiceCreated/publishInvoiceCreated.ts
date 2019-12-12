// * Core Domain
import { Result, Either, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { chain } from '../../../../core/logic/EitherChain';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

// * Usecase specific
import { PublishInvoiceCreatedResponse } from './publishInvoiceCreatedResponse';
import { PublishInvoiceCreatedErrors } from './publishInvoiceCreatedErrors';
import { PublishInvoiceCreatedDTO } from './publishInvoiceCreatedDTO';

import { InvoiceCreated as InvoiceCreatedMessagePayload } from '@hindawi/phenom-events';
import { InvoiceStatus as PhenomInvoiceStatus } from '@hindawi/phenom-events/src/lib/invoice';

import { InvoiceItem } from '../../domain/InvoiceItem';
import { Invoice } from '../../domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { EventUtils } from 'libs/shared/src/lib/utils/EventUtils';

export type PublishInvoiceCreatedContext = AuthorizationContext<Roles>;

export class PublishInvoiceCreatedUsecase
  implements
    UseCase<
      PublishInvoiceCreatedDTO,
      Promise<PublishInvoiceCreatedResponse>,
      PublishInvoiceCreatedContext
    >,
    AccessControlledUsecase<
      PublishInvoiceCreatedDTO,
      PublishInvoiceCreatedContext,
      AccessControlContext
    > {
  authorizationContext: AuthorizationContext<Roles>;

  constructor(private publishService: SQSPublishServiceContract) {}

  // @Authorize('payer:read')
  public async execute(
    request: PublishInvoiceCreatedDTO,
    context?: PublishInvoiceCreatedContext
  ): Promise<PublishInvoiceCreatedResponse> {
    const messageEither = this.verifyInput(request)
      .map(({ invoiceItems, manuscript, invoice }) => {
        let payload = this.emptyMessagePayload;
        payload = this.payloadWithInvoiceItemsData(
          invoiceItems,
          manuscript,
          payload
        );
        payload = this.payloadWithTotalData(invoiceItems, payload);
        payload = this.payloadWithInvoiceData(invoice, payload);
        return payload;
      })
      .map(this.constructMessageFromPayload);

    const eventSentResult = ((await chain(
      [this.publishMessage.bind(this)],
      messageEither
    )) as unknown) as PublishInvoiceCreatedResponse;

    return eventSentResult;
  }

  private async publishMessage(
    message: InvoiceCreatedMessage
  ): Promise<Either<AppError.UnexpectedError, Result<void>>> {
    try {
      await this.publishService.publishMessage(message);
      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err.toString()));
    }
  }

  private constructMessageFromPayload(
    payload: InvoiceCreatedMessagePayload
  ): InvoiceCreatedMessage {
    return {
      event: 'InvoiceCreated',
      data: payload
    };
  }

  private verifyInput(
    request: PublishInvoiceCreatedDTO
  ): Either<
    PublishInvoiceCreatedErrors.InputNotProvided,
    PublishInvoiceCreatedDTO
  > {
    const { invoiceItems, manuscript, invoice } = request;

    if (!invoiceItems || !manuscript || !invoice) {
      return left(new PublishInvoiceCreatedErrors.InputNotProvided());
    } else {
      return right(request);
    }
  }

  private payloadWithInvoiceItemsData(
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    payload: InvoiceCreatedMessagePayload
  ): InvoiceCreatedMessagePayload {
    return {
      ...payload,
      invoiceItems: invoiceItems.map(invoiceItem => ({
        manuscriptId: invoiceItem.manuscriptId.id.toString(),
        manuscriptCustomId: manuscript.customId,
        vatPercentage: null,
        id: invoiceItem.id.toString(),
        price: invoiceItem.price,
        type: invoiceItem.type as any
      }))
    };
  }

  private payloadWithInvoiceData(
    invoice: Invoice,
    payload: InvoiceCreatedMessagePayload
  ): InvoiceCreatedMessagePayload {
    return {
      ...payload,
      referenceNumber: `${
        invoice.invoiceNumber
      }/${invoice.dateAccepted.getFullYear()}`,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status as PhenomInvoiceStatus,
      invoiceCreatedDate: invoice.dateCreated
    };
  }

  private payloadWithTotalData(
    invoiceItems: InvoiceItem[],
    payload: InvoiceCreatedMessagePayload
  ): InvoiceCreatedMessagePayload {
    return {
      ...payload,
      valueWithoutVAT: invoiceItems.reduce((acc, curr) => acc + curr.price, 0)
    };
  }

  private get emptyMessagePayload(): InvoiceCreatedMessagePayload {
    const payload: InvoiceCreatedMessagePayload = {
      ...EventUtils.createEventObject(),
      invoiceId: null,
      referenceNumber: null,
      invoiceItems: null,
      invoiceStatus: null,
      valueWithoutVAT: null,
      invoiceCreatedDate: null
    };

    return payload;
  }
}

interface InvoiceCreatedMessage {
  event: 'InvoiceCreated';
  data: InvoiceCreatedMessagePayload;
}

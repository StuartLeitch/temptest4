// * Core Domain
import { Result, Either, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { chain } from '../../../../core/logic/EitherChain';
import { map } from '../../../../core/logic/EitherMap';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

// * Usecase specific
import { PublishInvoiceCreatedResponse } from './publishInvoiceCreatedResponse';
import { PublishInvoiceCreatedErrors } from './publishInvoiceCreatedErrors';
import { PublishInvoiceCreatedDTO } from './publishInvoiceCreatedDTO';

import { PayerType } from '../../../payers/domain/Payer';
import { InvoiceItemType, InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceStatus, Invoice } from '../../domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Payer } from '../../../payers/domain/Payer';
import { Address } from '../../../addresses/domain/Address';

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
      .map(({ invoiceItems, invoice, manuscript, address, payer }) => {
        let payload = this.emptyMessagePayload;
        payload = this.payloadWithInvoiceItemsData(
          invoiceItems,
          manuscript,
          payload
        );
        payload = this.payloadWithTotalData(invoiceItems, payload);
        payload = this.payloadWithInvoiceData(invoice, payload);
        payload = this.payloadWithAddressData(address, payload);
        payload = this.payloadWithPayerData(payer, payload);
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
      event: 'invoiceConfirmed',
      data: payload
    };
  }

  private verifyInput(
    request: PublishInvoiceCreatedDTO
  ): Either<
    PublishInvoiceCreatedErrors.InputNotProvided,
    PublishInvoiceCreatedDTO
  > {
    const { invoiceItems, manuscript, address, invoice, payer } = request;

    if (!invoiceItems || !manuscript || !address || !invoice || !payer) {
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
        vatPercentage: invoiceItem.vat,
        id: invoiceItem.id.toString(),
        price: invoiceItem.price,
        type: invoiceItem.type
      }))
    };
  }

  private payloadWithInvoiceData(
    invoice: Invoice,
    payload: InvoiceCreatedMessagePayload
  ): InvoiceCreatedMessagePayload {
    return {
      ...payload,
      transactionId: invoice.transactionId.id.toString(),
      invoiceIssueDate: invoice.dateIssued,
      referenceNumber: `${invoice.invoiceNumber}/${invoice.dateAccepted.getFullYear()}`,
      invoiceId: invoice.id.toString(),
      invoiceStatus: invoice.status
    };
  }

  private payloadWithPayerData(
    payer: Payer,
    payload: InvoiceCreatedMessagePayload
  ): InvoiceCreatedMessagePayload {
    return {
      ...payload,
      payerEmail: payer.email.value.toString(),
      payerName: payer.name.value.toString(),
      vatRegistrationNumber: payer.VATId,
      payerType: payer.type
    };
  }

  private payloadWithAddressData(
    address: Address,
    payload: InvoiceCreatedMessagePayload
  ): InvoiceCreatedMessagePayload {
    return {
      ...payload,
      address: `${address.addressLine1}, ${address.city}, ${address.country}`,
      country: address.country
    };
  }

  private payloadWithTotalData(
    invoiceItems: InvoiceItem[],
    payload: InvoiceCreatedMessagePayload
  ): InvoiceCreatedMessagePayload {
    return {
      ...payload,
      valueWithoutVAT: invoiceItems.reduce((acc, curr) => acc + curr.price, 0),
      valueWithVAT: invoiceItems.reduce(
        (acc, curr) => acc + curr.price * (1 + curr.vat / 100),
        0
      ),
      VAT: invoiceItems.reduce(
        (acc, item) => acc + item.price * (item.vat / 100),
        0
      )
    };
  }

  private get emptyMessagePayload(): InvoiceCreatedMessagePayload {
    const payload: InvoiceCreatedMessagePayload = {
      invoiceId: null,
      invoiceIssueDate: null,
      referenceNumber: null,
      invoiceItems: [],
      transactionId: null,
      invoiceStatus: null,
      payerName: null,
      payerEmail: null,
      payerType: null,
      vatRegistrationNumber: null,
      address: null,
      country: null,
      valueWithoutVAT: null,
      valueWithVAT: null,
      VAT: null,
      couponId: null,
      dateApplied: null
    };

    return payload;
  }
}

interface InvoiceCreatedMessagePayload {
  invoiceId: string;
  referenceNumber: string;
  invoiceIssueDate: Date;
  invoiceItems: {
    id: string;
    manuscriptCustomId: string;
    manuscriptId: string;
    type: InvoiceItemType;
    price: number;
    vatPercentage: number;
  }[];
  transactionId: string;
  invoiceStatus: InvoiceStatus;
  payerName: string;
  payerEmail: string;
  payerType: PayerType;
  vatRegistrationNumber: string;
  address: string;
  country: string;
  valueWithoutVAT: number;
  valueWithVAT: number;
  VAT: number;
  couponId: string;
  dateApplied: Date;
}

interface InvoiceCreatedMessage {
  event: 'invoiceConfirmed';
  data: InvoiceCreatedMessagePayload;
}

/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

import { WaiverAssignedCollection } from '../../../waivers/domain/WaiverAssignedCollection';
import { CouponAssignedCollection } from '../../../coupons/domain/CouponAssignedCollection';
import { InvoiceStatus } from '../../domain/Invoice';
import { Invoice } from '../../domain/Invoice';

import { PaymentMethodRepoContract } from '../../../payments/repos/paymentMethodRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { PaymentRepoContract } from '../../../payments/repos/paymentRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetPayerDetailsByInvoiceIdUsecase } from '../../../payers/usecases/getPayerDetailsByInvoiceId';
import { GetPaymentsByInvoiceIdUsecase } from '../../../payments/usecases/getPaymentsByInvoiceId';
import { GetPaymentMethodsUseCase } from '../../../payments/usecases/getPaymentMethods';
import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import {
  PublishInvoiceConfirmedUsecase,
  PublishInvoiceConfirmedDTO,
} from '../publishEvents/publishInvoiceConfirmed';
import {
  PublishInvoiceCreditedUsecase,
  PublishInvoiceCreditedDTO,
} from '../publishEvents/publishInvoiceCredited';
import {
  PublishInvoiceFinalizedUsecase,
  PublishInvoiceFinalizedDTO,
} from '../publishEvents/publishInvoiceFinalized';
import {
  PublishInvoicePaidUsecase,
  PublishInvoicePaidDTO,
} from '../publishEvents/publishInvoicePaid';
import {
  PublishInvoiceCreatedUsecase,
  PublishInvoiceCreatedDTO,
} from '../publishEvents/publishInvoiceCreated';

// * Usecase specific
import { GenerateCompensatoryEventsResponse as Response } from './generateCompensatoryEventsResponse';
import { GenerateCompensatoryEventsDTO as DTO } from './generateCompensatoryEventsDTO';
import * as Errors from './generateCompensatoryEventsErrors';

import {
  InvoiceConfirmedData,
  InvoiceFinalizedData,
  InvoiceCreditedData,
  InvoiceCreatedData,
  WithBillingAddress,
  InvoicePayedData,
  WithInvoiceItems,
  WithInvoiceId,
  WithPayments,
  WithInvoice,
  WithPayer,
} from './actionTypes';

function originalInvoiceId(invoice: Invoice): string {
  if (invoice.cancelledInvoiceReference) {
    return invoice.cancelledInvoiceReference.toString();
  } else {
    return invoice.id.toString();
  }
}

export class GenerateCompensatoryEventsUsecase
  implements
    UseCase<DTO, Promise<Response>, UsecaseAuthorizationContext>,
    AccessControlledUsecase<
      DTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  private pass: any;

  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private sqsPublish: SQSPublishServiceContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private loggerService: LoggerContract
  ) {
    this.pass = null;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: DTO,
    context?: UsecaseAuthorizationContext
  ): Promise<any> {
    this.pass = {
      request,
      context,
      data: {}
    };

    try {
      // const publishPayload = this.verifyInput();

      // await this.publishInvoiceCreated();
      // this.publishInvoiceConfirmed();
      // this.publishInvoicePayed();
      await this.publishInvoiceCredited();
      await this.publishInvoiceFinalized()

      return Result.ok<void>(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async verifyInput(): Promise<Errors.InvoiceIdRequiredError | DTO> {
    const { request } = this.pass;
    if (!request.invoiceId) {
      return new Errors.InvoiceIdRequiredError();
    }
  }

  private async publishInvoiceCreated() {
    // await this.attachInvoice();
    // await this.shouldSendCreated();
    // await this.attachInvoiceItems();
    // await this.attachManuscript();

    // await this.updateInvoiceStatus('DRAFT', 'dateAccepted');
    // await this.removeCouponsAndWaivers();
    // await this.sendCreatedEvent();
  }

  private async publishInvoiceConfirmed() {
    // this.attachInvoice()
    // await this.shouldSendConfirmed)
    // await this.attachInvoiceItems(context)
    // await this.attachManuscript(context)
    // await this.attachPayer(context)
    // await this.attachAddress(context)
    // await this.updateInvoiceStatus('ACTIVE', 'dateIssued')
    // await this.sendConfirmedEvent(context)
  }

  private async publishInvoicePayed() {
    // this.attachInvoice()
    // this.shouldSendPayed()
    // this.attachInvoiceItems()
    // this.attachManuscript()
    // this.attachPayer()
    // this.attachAddress()
    // this.attachPayments()
    // this.havePaymentsBeenMade()
    // this.attachPaymentMethods()
    // this.attachPaymentDate()
    // this.sendPayedEvent()
  }

  private async publishInvoiceFinalized() {
    await this.attachInvoice();

    const shouldFinalize = await this.shouldSendFinalize();

    if (shouldFinalize) {
      await this.attachManuscript();
      await this.attachInvoiceItems();
      await this.attachPayer();
      await this.attachAddress();
      await this.attachPayments();
      await this.attachPaymentMethods();

      await this.sendFinalizedEvent()
    }
  }

  private async publishInvoiceCredited() {
    await this.attachInvoice();

    const shouldSendCredited = await this.shouldSendCredited();

    if (shouldSendCredited) {
      await this.attachInvoiceItems()
      await this.attachManuscript()
      await this.attachPayer()
      await this.attachAddress()
      await this.attachPayments()
      await this.attachPaymentMethods()

      this.pass.data.invoice.status = InvoiceStatus[status];
      // await this.updateInvoiceStatus('DRAFT', 'dateCreated')
      await this.sendCreditedEvent()
    }
  }

  private async attachInvoice() {
    const { request, context } = this.pass;

    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const result = await usecase.execute({ invoiceId : request.invoiceId }, context);
    if (result.isLeft()) {
      this.pass.invoice = null;
    }

    this.pass.data.invoice = result.value.getValue();
  }

  private async attachInvoiceItems() {
    const { request, context, data } = this.pass;

    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );

    const result = await  usecase.execute({ invoiceId: request.invoiceId }, context);
    if (result.isLeft()) {
      data.invoiceItems = null;
    }

    data.invoiceItems = result.value.getValue();
  }

  private async attachManuscript() {
    const { request, context, data } = this.pass;

    const usecase = new GetManuscriptByInvoiceIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );

    const result = await usecase.execute({ invoiceId: request.invoiceId }, context);
    if (result.isLeft()) {
      data.manuscript = null;
    }

    data.manuscript = result.value.getValue()[0];
  }

  private async attachPayer() {
    const { request, context, data } = this.pass;

    const usecase = new GetPayerDetailsByInvoiceIdUsecase(
      this.payerRepo,
      this.loggerService
    );

    const result = await usecase.execute({ invoiceId: request.invoiceId }, context);
    if (result.isLeft()) {
      data.payer = null;
    }

    data.payer = result.value.getValue();
  }

  private async attachAddress() {
    const { request, context, data } = this.pass;

    const usecase = new GetAddressUseCase(this.addressRepo);

    if (!request.payer) {
      this.pass.data.billingAddress = null;
    }

    const result = await usecase.execute({ billingAddressId: data.payer.billingAddressId.id.toString() }, context);
    if (result.isLeft()) {
      this.pass.data.billingAddress = null;
    }

    this.pass.data.billingAddress = result.value.getValue();
  }

  private async attachPayments() {
    const { request, context, data } = this.pass;

    const usecase = new GetPaymentsByInvoiceIdUsecase(
      this.invoiceRepo,
      this.paymentRepo
    );

    const result = await usecase.execute({ invoiceId: request.invoiceId }, context);
    if (result.isLeft()) {
      this.pass.data.payments = null;
    }

    this.pass.data.payments = result.value.getValue();
  }

  private async attachPaymentMethods() {
    const { request, context, data } = this.pass;

    const usecase = new GetPaymentMethodsUseCase(
      this.paymentMethodRepo,
      this.loggerService
    );

    const result = await usecase.execute(null, context);
    if (result.isLeft()) {
      this.pass.data.paymentMethods = null;
    }

    this.pass.data.paymentMethods = result.value.getValue();
  }

  private async shouldSendCreated<T extends WithInvoice>({
    invoice,
  }: T): Promise<boolean> {
    if (invoice.cancelledInvoiceReference) {
      return false;
    }

    if (!invoice.dateAccepted) {
      return false;
    }

    return true;
  }

  private async shouldSendConfirmed<T extends WithInvoice>({
    invoice,
  }: T): Promise<boolean> {
    if (invoice.cancelledInvoiceReference) {
      return false;
    }

    if (
      invoice.status === InvoiceStatus.PENDING ||
      invoice.status === InvoiceStatus.DRAFT ||
      !invoice.dateAccepted ||
      !invoice.dateIssued
    ) {
      return false;
    }
    return true;
  }

  private async shouldSendPayed<T extends WithInvoice>({
    invoice,
  }: T): Promise<boolean> {
    if (invoice.cancelledInvoiceReference) {
      return false;
    }

    if (
      invoice.status !== InvoiceStatus.FINAL ||
      !invoice.dateAccepted ||
      !invoice.dateIssued
    ) {
      return false;
    }

    return true;
  }

  private async shouldSendFinalize(): Promise<boolean> {
    const { invoice } = this.pass.data;

    if (
      invoice.status !== InvoiceStatus.FINAL ||
      !invoice.dateAccepted ||
      !invoice.dateIssued
    ) {
      return false;
    }
    return true;
  }

  private async shouldSendCredited(): Promise<boolean> {
    const { invoice } = this.pass.data;
    if (!invoice.cancelledInvoiceReference) {
      return false;
    }

    return true;
  }

  private async havePaymentsBeenMade<T extends WithPayer & WithPayments>({
    payments,
    payer,
  }: T): Promise<boolean> {
    if (!payer) {
      return false;
    }

    if (!payments || payments.length === 0) {
      return false;
    }

    return true;
  }

  private attachPaymentDate(context: UsecaseAuthorizationContext) {
    return <T extends WithInvoice & WithPayments>(request: T) => {
      const { payments, invoice } = request;
      let paymentDate: Date;

      if (payments.length === 0) {
        paymentDate = invoice.dateIssued;
      } else {
        paymentDate = payments.reduce(
          (acc, payment) => (acc < payment.datePaid ? payment.datePaid : acc),
          new Date(0)
        );
      }

      return {
        ...request,
        paymentDate,
      };
    };
  }

  private removeCouponsAndWaivers<T extends WithInvoiceItems>(request: T) {
    const invoiceItems = request.invoiceItems.map((item) => {
      item.props.assignedWaivers = WaiverAssignedCollection.create();
      item.props.assignedCoupons = CouponAssignedCollection.create();
      return item;
    });
    return {
      ...request,
      invoiceItems,
    };
  }

  private async sendCreatedEvent() {
    // const publishUsecase = new PublishInvoiceCreatedUsecase(this.sqsPublish);
    // const data: PublishInvoiceCreatedDTO = {
    //   ...request,
    //   messageTimestamp: request.invoice.dateAccepted,
    // };
    // return publishUsecase.execute(data, context);
  }

  private async sendConfirmedEvent() {
    // const publishUsecase = new PublishInvoiceConfirmedUsecase(
    //   this.sqsPublish
    // );
    // const data: PublishInvoiceConfirmedDTO = {
    //   ...request,
    //   messageTimestamp: request.invoice.dateIssued,
    // };
    // return publishUsecase.execute(data, context);
  }

  private sendPayedEvent() {
    // const publishUsecase = new PublishInvoicePaidUsecase(this.sqsPublish);
    // const data: PublishInvoicePaidDTO = {
    //   ...request,
    //   messageTimestamp: request.paymentDate,
    // };
    // return publishUsecase.execute(data, context);
    };

  private async sendFinalizedEvent() {
    const { request, context, data } = this.pass;

    const publishUsecase = new PublishInvoiceFinalizedUsecase(
      this.sqsPublish
    );
    data.messageTimestamp = data.invoice.dateMovedToFinal;

    await publishUsecase.execute(data, context);
  }

  private async sendCreditedEvent() {
    const { request, context, data } = this.pass;

    const publishUsecase = new PublishInvoiceCreditedUsecase(this.sqsPublish);
    data.messageTimestamp = request.invoice.dateIssued;
    data.creditNote = request.invoice;

    await publishUsecase.execute(data, context);
  }

  private updateInvoiceStatus(
    status: keyof typeof InvoiceStatus,
  ) {
    // const { invoice } = request;
    // invoice.status = InvoiceStatus[status];
    // return {
    //   ...request,
    //   invoice,
    // };
  }
}

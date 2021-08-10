// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { SanctionedCountryPolicy } from '../../../../domain/reductions/policies/SanctionedCountryPolicy';
import { PoliciesRegister } from '../../../../domain/reductions/policies/PoliciesRegister';
import { VATService } from '../../../../domain/services/VATService';

import { Payer, PayerType } from '../../../payers/domain/Payer';
import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { Address } from '../../../addresses/domain/Address';
import {
  TransactionStatus,
  Transaction,
} from '../../../transactions/domain/Transaction';

import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { TransactionRepoContract } from '../../../transactions/repos';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { CreateAddressUsecase } from '../../../addresses/usecases/createAddress/createAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { ApplyVatToInvoiceUsecase } from '../applyVatToInvoice';
import {
  ChangeInvoiceStatusErrors,
  ChangeInvoiceStatus,
} from '../changeInvoiceStatus';
import {
  CreatePayerRequestDTO,
  CreatePayerUsecase,
} from '../../../payers/usecases/createPayer';

// * Usecase specific

import { ConfirmInvoiceResponse as Response } from './confirmInvoiceResponse';
import type { ConfirmInvoiceDTO as DTO, PayerInput } from './confirmInvoiceDTO';
import * as Errors from './confirmInvoiceErrors';

interface PayerDataDomain {
  address: Address;
  invoice: Invoice;
  payer: Payer;
}

export class ConfirmInvoiceUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  receiverEmail: string;
  senderEmail: string;

  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private loggerService: LoggerContract,
    private emailService: EmailService,
    private vatService: VATService
  ) {
    super();

    this.isFromSanctionedCountry = this.isFromSanctionedCountry.bind(this);
    this.getTransactionDetails = this.getTransactionDetails.bind(this);
    this.markInvoiceAsPending = this.markInvoiceAsPending.bind(this);
    this.shouldConfirmInvoice = this.shouldConfirmInvoice.bind(this);
    this.assignInvoiceNumber = this.assignInvoiceNumber.bind(this);
    this.markInvoiceAsActive = this.markInvoiceAsActive.bind(this);
    this.updateInvoiceStatus = this.updateInvoiceStatus.bind(this);
    this.markInvoiceAsFinal = this.markInvoiceAsFinal.bind(this);
    this.applyVatToInvoice = this.applyVatToInvoice.bind(this);
    this.getInvoiceDetails = this.getInvoiceDetails.bind(this);
    this.getInvoiceItems = this.getInvoiceItems.bind(this);
    this.dispatchEvents = this.dispatchEvents.bind(this);
    this.createAddress = this.createAddress.bind(this);
    this.savePayerData = this.savePayerData.bind(this);
    this.createPayer = this.createPayer.bind(this);
    this.checkVatId = this.checkVatId.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
  }

  @Authorize('invoice:confirm')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const {
      payer: payerInput,
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender,
    } = request;
    this.receiverEmail = sanctionedCountryNotificationReceiver;
    this.senderEmail = sanctionedCountryNotificationSender;

    try {
      await this.checkVatId(payerInput);

      const maybePayer = await new AsyncEither(payerInput)
        .then(this.savePayerData(context))
        .then(this.updateInvoiceStatus(context))
        .then(this.assignInvoiceNumber(context))
        .then(this.applyVatToInvoice(context))
        .map(this.dispatchEvents)
        .map((data) => data.payer)
        .execute();

      return maybePayer;
    } catch (err) {
      return left(
        new UnexpectedError(
          err,
          `While confirming invoice with id ${request.payer.invoiceId} an error ocurred`
        )
      );
    }
  }

  private isFromSanctionedCountry({ country }: Address): boolean {
    const sanctionedCountryPolicy = new SanctionedCountryPolicy();
    const policiesRegister = new PoliciesRegister();
    policiesRegister.registerPolicy(sanctionedCountryPolicy);

    const reductions = policiesRegister.applyPolicy(
      sanctionedCountryPolicy.getType(),
      [country]
    );

    return reductions?.getReduction()?.props.reduction < 0;
  }

  private assignInvoiceNumber(context: Context) {
    return async (
      payerData: PayerDataDomain
    ): Promise<
      Either<Errors.InvoiceNumberAssignationError, PayerDataDomain>
    > => {
      const { invoice } = payerData;

      try {
        if (invoice.status === InvoiceStatus.ACTIVE) {
          const lastInvoiceNumber = await this.invoiceRepo.getCurrentInvoiceNumber();
          invoice.assignInvoiceNumber(lastInvoiceNumber);
          const maybeUpdated = await this.invoiceRepo.update(invoice);

          if (maybeUpdated.isLeft()) {
            return left(
              new Errors.InvoiceNumberAssignationError(
                invoice.id.toString(),
                new Error(maybeUpdated.value.message)
              )
            );
          }

          payerData.invoice = maybeUpdated.value;
        }

        const aa = await this.getInvoiceItems(
          { invoiceId: invoice.id.toString() },
          context
        )(payerData);

        if (aa.isLeft()) {
          return aa;
        } else {
          payerData.invoice = aa.value.invoice;
        }
      } catch (e) {
        return left(
          new Errors.InvoiceNumberAssignationError(invoice.id.toString(), e)
        );
      }

      return right(payerData);
    };
  }

  private updateInvoiceStatus(context: Context) {
    return async (
      payerData: PayerDataDomain
    ): Promise<
      Either<
        | ChangeInvoiceStatusErrors.ChangeStatusError
        | ChangeInvoiceStatusErrors.InvoiceNotFoundError,
        PayerDataDomain
      >
    > => {
      const { invoice, address } = payerData;
      this.loggerService.info(
        `Update status for Invoice with id {${payerData?.invoice.id}}`
      );

      if (invoice.getInvoiceTotal() === 0) {
        return (await this.markInvoiceAsFinal(invoice, context)).map(
          (activeInvoice) => ({
            ...payerData,
            invoice: activeInvoice,
          })
        );
      } else if (this.isFromSanctionedCountry(address)) {
        return (await this.markInvoiceAsPending(invoice, context))
          .map((pendingInvoice) => this.sendEmail(pendingInvoice))
          .map((pendingInvoice) => ({
            ...payerData,
            invoice: pendingInvoice,
          }));
      } else {
        if (invoice.status !== InvoiceStatus.ACTIVE) {
          return (await this.markInvoiceAsActive(invoice, context)).map(
            (activeInvoice) => ({
              ...payerData,
              invoice: activeInvoice,
            })
          );
        }
      }
      return right(payerData);
    };
  }

  private dispatchEvents(data: PayerDataDomain): PayerDataDomain {
    DomainEvents.dispatchEventsForAggregate(data.invoice.id);
    return data;
  }

  private getTransactionDetails(context: Context) {
    return async <T>(
      data: T & { invoice: Invoice }
    ): Promise<
      Either<Errors.TransactionNotFoundError, T & { transaction: Transaction }>
    > => {
      const { invoice } = data;
      const transactionId = invoice.transactionId.toString();
      const usecase = new GetTransactionUsecase(this.transactionRepo);

      const result = await usecase.execute({ transactionId }, context);

      if (result.isLeft()) {
        return left(
          new Errors.TransactionNotFoundError(
            transactionId,
            new Error(result.value.message)
          )
        );
      }

      return right({ ...data, transaction: result.value });
    };
  }

  private savePayerData(context: Context) {
    return async (payerInput: PayerInput) => {
      this.loggerService.info(`Save payer ${payerInput.name} data`);
      const emptyPayload: PayerDataDomain = {
        address: null,
        invoice: null,
        payer: null,
      };

      return await new AsyncEither(emptyPayload)
        .then(this.getInvoiceDetails(payerInput, context))
        .then(this.getTransactionDetails(context))
        .then(this.shouldConfirmInvoice)
        .then(this.getInvoiceItems(payerInput, context))
        .then(this.createAddress(payerInput, context))
        .then(this.createPayer(payerInput, context))
        .execute();
    };
  }

  private async shouldConfirmInvoice<T>(
    data: T & { invoice: Invoice; transaction: Transaction }
  ): Promise<
    Either<
      Errors.InvoiceAlreadyConfirmedError | Errors.ManuscriptNotAcceptedError,
      T
    >
  > {
    const { invoice, transaction } = data;

    if (transaction.status === TransactionStatus.DRAFT) {
      return left(new Errors.ManuscriptNotAcceptedError(invoice.id.toString()));
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      return left(
        new Errors.InvoiceAlreadyConfirmedError(
          invoice.persistentReferenceNumber
        )
      );
    }

    return right(data);
  }

  private getInvoiceDetails({ invoiceId }: PayerInput, context: Context) {
    return async (payerData: PayerDataDomain) => {
      this.loggerService.info(`Get Invoice details for id ${invoiceId}`);
      const getInvoiceDetailsUseCase = new GetInvoiceDetailsUsecase(
        this.invoiceRepo
      );
      const maybeDetails = await getInvoiceDetailsUseCase.execute(
        { invoiceId },
        context
      );
      return maybeDetails.map((invoice) => ({
        ...payerData,
        invoice,
      }));
    };
  }

  private getInvoiceItems({ invoiceId }: PayerInput, context: Context) {
    return async (payerData: PayerDataDomain) => {
      this.loggerService.info(`Get Invoice Items for id {${invoiceId}}`);
      const getInvoiceItemsUsecase = new GetItemsForInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo
      );
      const maybeDetails = await getInvoiceItemsUsecase.execute(
        { invoiceId },
        context
      );
      return maybeDetails.map((items) => {
        // items.forEach((ii) => payerData.invoice.addInvoiceItem(ii));
        payerData.invoice.addItems(items);
        return payerData;
      });
    };
  }

  private createPayer(payerInput: PayerInput, context: Context) {
    return async (payerData: PayerDataDomain) => {
      this.loggerService.info(`Create Payer for ${payerInput.name}`);
      const createPayerUseCase = new CreatePayerUsecase(this.payerRepo);
      const payerDTO: CreatePayerRequestDTO = {
        invoiceId: payerInput.invoiceId,
        type: payerInput.type,
        name: payerInput.name,
        email: payerInput.email,
        vatId: payerInput.vatId,
        organization: payerInput.organization || ' ',
        addressId: payerData.address.addressId.id.toString(),
      };

      return (
        await createPayerUseCase.execute(payerDTO, context)
      ).map((payerResult) => ({ ...payerData, payer: payerResult }));
    };
  }

  private createAddress({ address }: PayerInput, context: Context) {
    const usecase = new CreateAddressUsecase(this.addressRepo);
    const addressDTO = {
      addressLine1: address.addressLine1,
      country: address.country,
      postalCode: address.postalCode,
      state: address.state,
      city: address.city,
    };

    return async (payerData: PayerDataDomain) => {
      this.loggerService.info(`Create Address for ${address}`);
      return new AsyncEither(addressDTO)
        .then((data) => usecase.execute(data, context))
        .map((address) => ({ ...payerData, address }))
        .execute();
    };
  }

  private async checkVatId(payer: PayerInput) {
    this.loggerService.info(`Check VAT for ${payer.name}`);
    if (payer.type === PayerType.INSTITUTION) {
      const vatResult = await this.vatService.checkVAT({
        countryCode: payer.address.country,
        vatNumber: payer.vatId,
      });

      if (!(vatResult instanceof Error)) {
        if (!vatResult.valid) {
          this.loggerService.info(`VAT ${payer.vatId} is not valid.`);
        }
      }
    }
  }

  private async markInvoiceAsPending(invoice: Invoice, context: Context) {
    this.loggerService.info(
      `Invoice with id {${invoice.id.toString()}} is confirmed with a sanctioned country.`
    );
    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );
    return await changeInvoiceStatusUseCase.execute(
      {
        invoiceId: invoice.id.toString(),
        status: InvoiceStatus.PENDING,
      },
      context
    );
  }

  private async markInvoiceAsActive(invoice: Invoice, context: Context) {
    invoice.markAsActive();

    await this.invoiceRepo.update(invoice);

    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );
    return changeInvoiceStatusUseCase.execute(
      {
        invoiceId: invoice.id.toString(),
        status: InvoiceStatus.ACTIVE,
      },
      context
    );
  }

  private async markInvoiceAsFinal(invoice: Invoice, context: Context) {
    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );

    invoice.markAsFinal();

    await this.invoiceRepo.update(invoice);

    return changeInvoiceStatusUseCase.execute(
      {
        invoiceId: invoice.id.toString(),
        status: InvoiceStatus.FINAL,
      },
      context
    );
  }

  private applyVatToInvoice(context: Context) {
    return async ({ invoice, address, payer }: PayerDataDomain) => {
      const applyVatToInvoice = new ApplyVatToInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo,
        this.vatService
      );
      const maybeAppliedVat = await applyVatToInvoice.execute(
        {
          invoiceId: invoice.id.toString(),
          postalCode: address.postalCode,
          country: address.country,
          payerType: payer.type,
          state: address.state,
        },
        context
      );
      return maybeAppliedVat.map(() => ({ invoice, address, payer }));
    };
  }

  private sendEmail(invoice: Invoice) {
    this.emailService
      .createInvoicePendingNotification(
        invoice,
        this.receiverEmail,
        this.senderEmail
      )
      .sendEmail();
    return invoice;
  }
}

// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { Either, right, left } from '../../../../core/logic/Either';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';
import { Right } from '../../../../core/logic/Right';

// * Authorization Logic
import {
  UsecaseAuthorizationContext as Context,
  AccessControlledUsecase,
  AccessControlContext,
} from '../../../../domain/authorization';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { SanctionedCountryPolicy } from '../../../../domain/reductions/policies/SanctionedCountryPolicy';
import { PoliciesRegister } from '../../../../domain/reductions/policies/PoliciesRegister';
import { VATService } from '../../../../domain/services/VATService';

import { Payer, PayerType } from '../../../payers/domain/Payer';
import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { Address } from '../../../addresses/domain/Address';

import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { CreateAddress } from '../../../addresses/usecases/createAddress/createAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { ApplyVatToInvoiceUsecase } from '../applyVatToInvoice';
import {
  ChangeInvoiceStatusErrors,
  ChangeInvoiceStatus,
} from '../changeInvoiceStatus/';
import {
  CreatePayerRequestDTO,
  CreatePayerUsecase,
} from '../../../payers/usecases/createPayer/createPayer';

// * Usecase specific

import { ConfirmInvoiceResponse as Response } from './confirmInvoiceResponse';
import { ConfirmInvoiceDTO as DTO, PayerInput } from './confirmInvoiceDTO';
import { ConfirmInvoiceErrors as Errors } from './confirmInvoiceErrors';

interface PayerDataDomain {
  address: Address;
  invoice: Invoice;
  payer: Payer;
}

export class ConfirmInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  receiverEmail: string;
  senderEmail: string;

  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private emailService: EmailService,
    private vatService: VATService,
    private loggerService: LoggerContract
  ) {
    this.isFromSanctionedCountry = this.isFromSanctionedCountry.bind(this);
    this.markInvoiceAsPending = this.markInvoiceAsPending.bind(this);
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

  // @Authorize('payer:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const {
      payer: payerInput,
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender,
    } = request;
    this.receiverEmail = sanctionedCountryNotificationReceiver;
    this.senderEmail = sanctionedCountryNotificationSender;

    await this.checkVatId(payerInput);

    const maybePayer = await new AsyncEither(payerInput)
      .then(this.savePayerData(context))
      .then(this.assignInvoiceNumber(context))
      .then(this.updateInvoiceStatus(context))
      .then(this.applyVatToInvoice(context))
      .then(this.dispatchEvents)
      .map((data) => data.payer)
      .execute();

    return maybePayer;
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
        const lastInvoiceNumber = await this.invoiceRepo.getCurrentInvoiceNumber();
        invoice.assignInvoiceNumber(lastInvoiceNumber);
        payerData.invoice = await this.invoiceRepo.update(invoice);
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
        return (await this.markInvoiceAsFinal(invoice)).map(
          (activeInvoice) => ({
            ...payerData,
            invoice: activeInvoice,
          })
        );
      } else if (this.isFromSanctionedCountry(address)) {
        return (await this.markInvoiceAsPending(invoice))
          .map((pendingInvoice) => this.sendEmail(pendingInvoice))
          .map((pendingInvoice) => ({
            ...payerData,
            invoice: pendingInvoice,
          }));
      } else {
        if (invoice.status !== InvoiceStatus.ACTIVE) {
          return (await this.markInvoiceAsActive(invoice)).map(
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

  private async dispatchEvents(
    data: PayerDataDomain
  ): Promise<Right<null, PayerDataDomain>> {
    DomainEvents.dispatchEventsForAggregate(data.invoice.id);
    return right(data);
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
        .then(this.getInvoiceItems(payerInput, context))
        .then(this.createAddress(payerInput))
        .then(this.createPayer(payerInput, context))
        .execute();
    };
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
      return maybeDetails.map((invoiceResult) => ({
        ...payerData,
        invoice: invoiceResult.getValue(),
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
      return maybeDetails.map((invoiceItemsResult) => {
        const items = invoiceItemsResult.getValue();
        items.forEach((ii) => payerData.invoice.addInvoiceItem(ii));
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
      ).map((payerResult) => ({ ...payerData, payer: payerResult.getValue() }));
    };
  }

  private createAddress({ address }: PayerInput) {
    const usecase = new CreateAddress(this.addressRepo);
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
        .then((data) => usecase.execute(data))
        .map((result) => ({ ...payerData, address: result.getValue() }))
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

      if (!vatResult.valid) {
        this.loggerService.info(`VAT ${payer.vatId} is not valid.`);
      }
    }
  }

  private async markInvoiceAsPending(invoice: Invoice) {
    this.loggerService.info(
      `Invoice with id {${invoice.id.toString()}} is confirmed with a sanctioned country.`
    );
    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );
    const maybePendingInvoice = await changeInvoiceStatusUseCase.execute({
      invoiceId: invoice.id.toString(),
      status: InvoiceStatus.PENDING,
    });
    return maybePendingInvoice.map((pendingInvoiceResult) => {
      const pendingInvoice = pendingInvoiceResult.getValue();
      return pendingInvoice;
    });
  }

  private async markInvoiceAsActive(invoice: Invoice) {
    invoice.markAsActive();

    await this.invoiceRepo.update(invoice);

    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );
    return (
      await changeInvoiceStatusUseCase.execute({
        invoiceId: invoice.id.toString(),
        status: InvoiceStatus.ACTIVE,
      })
    ).map((resultInvoice) => resultInvoice.getValue());
  }

  private async markInvoiceAsFinal(invoice: Invoice) {
    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );

    invoice.markAsFinal();

    await this.invoiceRepo.update(invoice);

    return (
      await changeInvoiceStatusUseCase.execute({
        invoiceId: invoice.id.toString(),
        status: InvoiceStatus.FINAL,
      })
    ).map((resultInvoice) => resultInvoice.getValue());
  }

  private applyVatToInvoice(context: Context) {
    return async ({ invoice, address, payer }: PayerDataDomain) => {
      const applyVatToInvoice = new ApplyVatToInvoiceUsecase(
        this.invoiceItemRepo,
        this.couponRepo,
        this.waiverRepo,
        this.vatService
      );
      const maybeAppliedVat = await applyVatToInvoice.execute({
        invoiceId: invoice.id.toString(),
        postalCode: address.postalCode,
        country: address.country,
        payerType: payer.type,
        state: address.state,
      });
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

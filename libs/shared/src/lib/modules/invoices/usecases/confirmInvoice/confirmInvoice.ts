/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { Either, Result, right } from '../../../../core/logic/Result';
import { chain } from '../../../../core/logic/EitherChain';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  UsecaseAuthorizationContext,
  AccessControlledUsecase,
  AccessControlContext,
  Roles,
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
import { ChangeInvoiceStatus } from '../changeInvoiceStatus/changeInvoiceStatus';
import { ApplyVatToInvoiceUsecase } from '../applyVatToInvoice';
import {
  CreatePayerRequestDTO,
  CreatePayerUsecase,
} from '../../../payers/usecases/createPayer/createPayer';

// * Usecase specific

import { ConfirmInvoiceDTO, PayerInput } from './confirmInvoiceDTO';
import { ConfirmInvoiceResponse } from './confirmInvoiceResponse';

interface PayerDataDomain {
  address: Address;
  invoice: Invoice;
  payer: Payer;
}

export class ConfirmInvoiceUsecase
  implements
    UseCase<
      ConfirmInvoiceDTO,
      Promise<ConfirmInvoiceResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      ConfirmInvoiceDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  authorizationContext: UsecaseAuthorizationContext;
  sanctionedCountryPolicy: SanctionedCountryPolicy;
  reductionsPoliciesRegister: PoliciesRegister;
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
    this.authorizationContext = { roles: [Roles.PAYER] };

    this.sanctionedCountryPolicy = new SanctionedCountryPolicy();
    this.reductionsPoliciesRegister = new PoliciesRegister();
    this.reductionsPoliciesRegister.registerPolicy(
      this.sanctionedCountryPolicy
    );
  }

  // @Authorize('payer:read')
  public async execute(
    request: ConfirmInvoiceDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<ConfirmInvoiceResponse> {
    const {
      payer: payerInput,
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender,
    } = request;
    this.receiverEmail = sanctionedCountryNotificationReceiver;
    this.senderEmail = sanctionedCountryNotificationSender;

    await this.checkVatId(payerInput);
    const maybePayerData = await this.savePayerData(payerInput);

    await chain(
      [
        this.updateInvoiceStatus.bind(this),
        this.applyVatToInvoice.bind(this),
        this.dispatchEvents.bind(this),
      ],
      maybePayerData
    );

    return maybePayerData.map(({ payer }) => Result.ok(payer));
  }

  private isPayerFromSanctionedCountry({ country }: Address): boolean {
    const reductions = this.reductionsPoliciesRegister.applyPolicy(
      this.sanctionedCountryPolicy.getType(),
      [country]
    );

    return reductions?.getReduction()?.props.reduction < 0;
  }

  private async updateInvoiceStatus(
    payerData: PayerDataDomain
  ): Promise<Either<unknown, PayerDataDomain>> {
    const { invoice, address } = payerData;
    this.loggerService.info(
      `Update status for Invoice with id {${payerData?.invoice.id}}`
    );

    if (invoice.getInvoiceTotal() === 0) {
      return (await this.markInvoiceAsFinal(invoice)).map((activeInvoice) => ({
        ...payerData,
        invoice: activeInvoice,
      }));
    } else if (this.isPayerFromSanctionedCountry(address)) {
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
  }

  private async dispatchEvents({ invoice }: PayerDataDomain) {
    DomainEvents.dispatchEventsForAggregate(invoice.id);
    return right<undefined, void>(null);
  }

  private async savePayerData(payerInput: PayerInput) {
    this.loggerService.info(`Save payer ${payerInput.name} data`);
    const emptyPayload: PayerDataDomain = {
      address: null,
      invoice: null,
      payer: null,
    };
    return await chain(
      [
        this.getInvoiceDetails.bind(this, payerInput),
        this.getInvoiceItems.bind(this, payerInput),
        this.createAddress.bind(this, payerInput),
        this.createPayer.bind(this, payerInput),
      ],
      emptyPayload
    );
  }

  private async getInvoiceDetails(
    { invoiceId }: PayerInput,
    payerData: PayerDataDomain
  ) {
    this.loggerService.info(`Get Invoice details for id ${invoiceId}`);
    const getInvoiceDetailsUseCase = new GetInvoiceDetailsUsecase(
      this.invoiceRepo
    );
    const maybeDetails = await getInvoiceDetailsUseCase.execute(
      { invoiceId },
      this.authorizationContext
    );
    return maybeDetails.map((invoiceResult) => ({
      ...payerData,
      invoice: invoiceResult.getValue(),
    }));
  }

  private async getInvoiceItems(
    { invoiceId }: PayerInput,
    payerData: PayerDataDomain
  ) {
    this.loggerService.info(`Get Invoice Items for id {${invoiceId}}`);
    const getInvoiceItemsUsecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    const maybeDetails = await getInvoiceItemsUsecase.execute(
      { invoiceId },
      this.authorizationContext
    );
    return maybeDetails.map((invoiceItemsResult) => {
      const items = invoiceItemsResult.getValue();
      items.forEach((ii) => payerData.invoice.addInvoiceItem(ii));
      return payerData;
    });
  }

  private async createPayer(
    payerInput: PayerInput,
    payerData: PayerDataDomain
  ) {
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
      await createPayerUseCase.execute(payerDTO, this.authorizationContext)
    ).map((payerResult) => ({ ...payerData, payer: payerResult.getValue() }));
  }

  private async createAddress(
    { address }: PayerInput,
    payerData: PayerDataDomain
  ) {
    this.loggerService.info(`Create Address for ${address}`);
    const createAddressUseCase = new CreateAddress(this.addressRepo);
    const addressDTO = {
      addressLine1: address.addressLine1,
      country: address.country,
      postalCode: address.postalCode,
      state: address.state,
      city: address.city,
    };

    return (await createAddressUseCase.execute(addressDTO)).map(
      (addressResult) => {
        return {
          ...payerData,
          address: addressResult.getValue(),
        };
      }
    );
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

  private async applyVatToInvoice({
    invoice,
    address,
    payer,
  }: PayerDataDomain) {
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

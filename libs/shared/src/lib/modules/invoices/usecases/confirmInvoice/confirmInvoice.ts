// * Core Domain
import { Result, Either, left, right } from '../../../../core/logic/Result';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
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

// * Usecase specific
import { InvoiceStatus, Invoice } from '../../domain/Invoice';
import { Address } from '../../../addresses/domain/Address';
import { PayerType } from '../../../payers/domain/Payer';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';

import { ConfirmInvoiceDTO, PayerInput } from './confirmInvoiceDTO';
import { ConfirmInvoiceResponse } from './confirmInvoiceResponse';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { CreateAddress } from '../../../addresses/usecases/createAddress/createAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { ApplyVatToInvoiceUsecase } from '../applyVatToInvoice';
import { ChangeInvoiceStatus } from '../changeInvoiceStatus/changeInvoiceStatus';
import { UpdateInvoiceItemsUsecase } from '../updateInvoiceItems';
import {
  CreatePayerUsecase,
  CreatePayerRequestDTO
} from '../../../payers/usecases/createPayer/createPayer';

import { SanctionedCountryPolicy } from '../../../../domain/reductions/policies/SanctionedCountryPolicy';
import { PoliciesRegister } from '../../../../domain/reductions/policies/PoliciesRegister';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { VATService } from '../../../../domain/services/VATService';

export type ConfirmInvoiceContext = AuthorizationContext<Roles>;

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
      ConfirmInvoiceContext
    >,
    AccessControlledUsecase<
      ConfirmInvoiceDTO,
      ConfirmInvoiceContext,
      AccessControlContext
    > {
  authorizationContext: AuthorizationContext<Roles>;
  sanctionedCountryPolicy: SanctionedCountryPolicy;
  reductionsPoliciesRegister: PoliciesRegister;

  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract,
    private emailService: EmailService,
    private vatService: VATService,
    private receiverEmail: string,
    private senderEmail: string
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
    context?: ConfirmInvoiceContext
  ): Promise<ConfirmInvoiceResponse> {
    const { payer: payerInput } = request;

    await this.checkVatId(payerInput);
    const maybePayerData = await this.savePayerData(payerInput);
    await chain(
      [
        this.updateInvoiceStatus.bind(this),
        this.applyVatToInvoice.bind(this),
        this.dispatchEvents.bind(this)
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
    if (
      reductions &&
      reductions.getReduction() &&
      reductions.getReduction().props.reduction < 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  private async updateInvoiceStatus(
    payerData: PayerDataDomain
  ): Promise<Either<unknown, PayerDataDomain>> {
    const { invoice, address } = payerData;
    if (this.isPayerFromSanctionedCountry(address)) {
      return (await this.markInvoiceAsPending(invoice))
        .map(pendingInvoice => this.sendEmail(pendingInvoice))
        .map(pendingInvoice => ({
          ...payerData,
          invoice: pendingInvoice
        }));
    } else {
      if (invoice.status !== InvoiceStatus.ACTIVE) {
        return (await this.markInvoiceAsActive(invoice)).map(activeInvoice => ({
          ...payerData,
          invoice: activeInvoice
        }));
      }
    }
    return right(payerData);
  }

  private async dispatchEvents({ invoice }: PayerDataDomain) {
    DomainEvents.dispatchEventsForAggregate(invoice.id);
    return right<undefined, void>(null);
  }

  private async savePayerData(payerInput: PayerInput) {
    const emptyPayload: PayerDataDomain = {
      address: null,
      invoice: null,
      payer: null
    };
    return await chain(
      [
        this.getInvoiceDetails.bind(this, payerInput),
        this.createAddress.bind(this, payerInput),
        this.createPayer.bind(this, payerInput)
      ],
      emptyPayload
    );
  }

  private async getInvoiceDetails(
    { invoiceId }: PayerInput,
    payerData: PayerDataDomain
  ) {
    const getInvoiceDetailsUseCase = new GetInvoiceDetailsUsecase(
      this.invoiceRepo
    );
    const maybeDetails = await getInvoiceDetailsUseCase.execute(
      { invoiceId },
      this.authorizationContext
    );
    return maybeDetails.map(invoiceResult => ({
      ...payerData,
      invoice: invoiceResult.getValue()
    }));
  }

  private async createPayer(
    payerInput: PayerInput,
    payerData: PayerDataDomain
  ) {
    const createPayerUseCase = new CreatePayerUsecase(this.payerRepo);
    const payerDTO: CreatePayerRequestDTO = {
      invoiceId: payerInput.invoiceId,
      type: payerInput.type,
      name: payerInput.name,
      email: payerInput.email,
      vatId: payerInput.vatId,
      organization: payerInput.organization || ' ',
      addressId: payerData.address.addressId.id.toString()
    };

    return (
      await createPayerUseCase.execute(payerDTO, this.authorizationContext)
    ).map(payerResult => ({ ...payerData, payer: payerResult.getValue() }));
  }

  private async createAddress(
    { address }: PayerInput,
    payerData: PayerDataDomain
  ) {
    const createAddressUseCase = new CreateAddress(this.addressRepo);
    const addressDTO = {
      city: address.city,
      country: address.country,
      addressLine1: address.addressLine1
    };

    return (await createAddressUseCase.execute(addressDTO)).map(
      addressResult => {
        return {
          ...payerData,
          address: addressResult.getValue()
        };
      }
    );
  }

  private async checkVatId(payer: PayerInput) {
    if (payer.type === PayerType.INSTITUTION) {
      const vatResult = await this.vatService.checkVAT({
        countryCode: payer.address.country,
        vatNumber: payer.vatId
      });

      if (!vatResult.valid) {
        console.log(`VAT ${payer.vatId} is not valid.`);
      }
    }
  }

  private async markInvoiceAsPending(invoice: Invoice) {
    console.log(
      `Invoice with id {${invoice.id.toString()}} is confirmed with a sanctioned country.`
    );
    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );
    const maybePendingInvoice = await changeInvoiceStatusUseCase.execute({
      invoiceId: invoice.id.toString(),
      status: InvoiceStatus.PENDING
    });
    return maybePendingInvoice.map(pendingInvoiceResult => {
      const pendingInvoice = pendingInvoiceResult.getValue();
      return pendingInvoice;
    });
  }

  private async markInvoiceAsActive(invoice: Invoice) {
    invoice.markAsActive();
    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );
    return (
      await changeInvoiceStatusUseCase.execute({
        invoiceId: invoice.id.toString(),
        status: InvoiceStatus.ACTIVE
      })
    ).map(resultInvoice => resultInvoice.getValue());
  }

  private async applyVatToInvoice({
    invoice,
    address,
    payer
  }: PayerDataDomain) {
    const applyVatToInvoice = new ApplyVatToInvoiceUsecase(
      this.invoiceItemRepo,
      this.invoiceRepo,
      this.vatService
    );
    const maybeAppliedVat = await applyVatToInvoice.execute({
      invoiceId: invoice.id.toString(),
      country: address.country,
      payerType: payer.type
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

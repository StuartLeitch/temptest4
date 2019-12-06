// * Core Domain
import { Result, Either, left, right } from '../../../../core/logic/Result';
import { DomainEvents } from '../../../../core/domain/events/DomainEvents';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { chain } from '../../../../core/logic/EitherChain';
import { map } from '../../../../core/logic/EitherMap';

import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { Address } from '../../../addresses/domain/Address';
import { InvoiceId } from '../../domain/InvoiceId';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { PayerMap } from '../../../payers/mapper/Payer';
import { PayerType } from '../../../payers/domain/Payer';
import { Invoice, InvoiceStatus } from '../../domain/Invoice';

import { ConfirmInvoiceResponse } from './confirmInvoiceResponse';
import { ConfirmInvoiceErrors } from './confirmInvoiceErrors';
import { ConfirmInvoiceDTO, PayerInput } from './confirmInvoiceDTO';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';

import { CreateAddress } from '../../../addresses/usecases/createAddress/createAddress';
import { CreateAddressRequestDTO } from '../../../addresses/usecases/createAddress/createAddressDTO';
import {
  CreatePayerUsecase,
  CreatePayerRequestDTO
} from '../../../payers/usecases/createPayer/createPayer';
import { ChangeInvoiceStatus } from '../changeInvoiceStatus/changeInvoiceStatus';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';

import { VATService } from '../../../../domain/services/VATService';
import { AddressId } from '../../../addresses/domain/AddressId';

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

  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract,
    private vatService: VATService
  ) {
    this.authorizationContext = { roles: [Roles.PAYER] };
  }

  // @Authorize('payer:read')
  public async execute(
    request: ConfirmInvoiceDTO,
    context?: ConfirmInvoiceContext
  ): Promise<ConfirmInvoiceResponse> {
    let invoice: Invoice;
    const { payer: payerInput } = request;

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(payerInput.invoiceId)
    ).getValue();

    invoice = await this.invoiceRepo.getInvoiceById(invoiceId);

    await this.checkVatId(payerInput);

    const maybePayerData = await this.savePayerData(payerInput);

    await map([this.choseAction], maybePayerData);

    DomainEvents.dispatchEventsForAggregate(invoice.id);

    return maybePayerData.map(({ payer }) => Result.ok(payer));
  }

  private async choseAction({ invoice, address, payer }: PayerDataDomain) {
    if (invoice.status !== InvoiceStatus.ACTIVE) {
      await this.markInvoiceAsActive(invoice, address, payer);
    }

    if (this.isPayerFromSanctionedCountry(address)) {
      await this.markInvoiceAsPending(invoice, address, payer);
    }
  }

  private isPayerFromSanctionedCountry(address: Address): boolean {
    return false;
  }

  private async savePayerData(payerInput: PayerInput) {
    const emptyPayload: PayerDataDomain = {
      address: null,
      invoice: null,
      payer: null
    };
    return await map(
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
      addressResult => ({
        ...payerData,
        address: addressResult.getValue()
      })
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

  private async markInvoiceAsPending(
    invoice: Invoice,
    address: Address,
    payer: Payer
  ) {}

  private async markInvoiceAsActive(
    invoice: Invoice,
    address: Address,
    payer: Payer
  ) {
    let invoiceItem: InvoiceItem;
    const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(
      this.invoiceRepo
    );
    invoice.markAsActive();

    await changeInvoiceStatusUseCase.execute({
      invoiceId: payer.invoiceId.id.toString(),
      status: 'ACTIVE'
    });

    // * Apply and save VAT scheme
    const vat = this.vatService.calculateVAT(
      address.country,
      payer.type !== PayerType.INSTITUTION
    );

    try {
      [invoiceItem] = await this.invoiceItemRepo.getItemsByInvoiceId(
        invoice.invoiceId
      );
    } catch (err) {
      // do nothing yet
    }

    invoiceItem.vat = vat;

    await this.invoiceItemRepo.update(invoiceItem);
  }
}

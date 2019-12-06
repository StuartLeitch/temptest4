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
import { CreatePayerUsecase } from '../../../payers/usecases/createPayer/createPayer';
import { ChangeInvoiceStatus } from '../changeInvoiceStatus/changeInvoiceStatus';

import { VATService } from '../../../../domain/services/VATService';

export type ConfirmInvoiceContext = AuthorizationContext<Roles>;

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
  ) {}

  // @Authorize('payer:read')
  public async execute(
    request: ConfirmInvoiceDTO,
    context?: ConfirmInvoiceContext
  ): Promise<ConfirmInvoiceResponse> {
    let address: Address;
    let updatedPayer: Payer;
    let invoice: Invoice;
    let invoiceItem: InvoiceItem;

    const usecaseContext = { roles: [Roles.PAYER] };
    const { payer } = request;

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(payer.invoiceId)
    ).getValue();

    invoice = await this.invoiceRepo.getInvoiceById(invoiceId);

    const createAddressUseCase = new CreateAddress(this.addressRepo);
    const createPayerUseCase = new CreatePayerUsecase(this.payerRepo);

    // if (payer.type === PayerType.INSTITUTION) {
    //   const vatResult = await this.vatService.checkVAT({
    //     countryCode: payer.address.country,
    //     vatNumber: payer.vatId
    //   });

    //   if (!vatResult.valid) {
    //     console.log(`VAT ${payer.vatId} is not valid.`);
    //   }
    // }
    await this.checkVatId(payer);

    const addressResult = await createAddressUseCase.execute({
      city: payer.address.city,
      country: payer.address.country,
      addressLine1: payer.address.addressLine1
    });

    if (addressResult.isRight()) {
      address = addressResult.value.getValue();
    }

    const createPayerRequest = {
      invoiceId: payer.invoiceId,
      type: payer.type,
      name: payer.name,
      email: payer.email,
      vatId: payer.vatId,
      organization: payer.organization || ' ',
      addressId: address.addressId.id.toString()
    };

    const payerResult = await createPayerUseCase.execute(
      createPayerRequest,
      usecaseContext
    );

    if (payerResult.isRight()) {
      updatedPayer = payerResult.value.getValue();
    }

    if (invoice.status !== InvoiceStatus.ACTIVE) {
      // invoice.markAsActive();

      // await changeInvoiceStatusUseCase.execute({
      //   invoiceId: updatedPayer.invoiceId.id.toString(),
      //   status: 'ACTIVE'
      // });

      // // * Apply and save VAT scheme
      // const vat = this.vatService.calculateVAT(
      //   payer.address.country,
      //   payer.type !== PayerType.INSTITUTION
      // );

      // try {
      //   [invoiceItem] = await this.invoiceItemRepo.getItemsByInvoiceId(
      //     invoice.invoiceId
      //   );
      // } catch (err) {
      //   // do nothing yet
      // }

      // invoiceItem.vat = vat;

      // await this.invoiceItemRepo.update(invoiceItem);
      await this.markInvoiceActive(invoice, updatedPayer, invoiceItem, address);
    }

    DomainEvents.dispatchEventsForAggregate(invoice.id);

    return right(Result.ok(PayerMap.toPersistence(updatedPayer)));
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

  private async markInvoiceActive(
    invoice: Invoice,
    payer: Payer,
    invoiceItem: InvoiceItem,
    address: Address
  ) {
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

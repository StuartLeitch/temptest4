import {
  Roles,
  Address,
  Payer,
  PayerMap,
  Invoice,
  UpdatePayerUsecase
} from '@hindawi/shared';

import {Resolvers} from '../schema';
import {Context} from '../../context';

import {CreateAddress} from '../../../../../libs/shared/src/lib/modules/addresses/usecases/createAddress/createAddress';
import {ChangeInvoiceStatus} from '../../../../../libs/shared/src/lib/modules/invoices/usecases/changeInvoiceStatus/changeInvoiceStatus';

export const payerResolvers: Resolvers<Context> = {
  Query: {},

  Mutation: {
    async confirmInvoice(parent, args, context) {
      let address: Address;
      let updatedPayer: Payer;
      let invoice: Invoice;

      const {repos} = context;
      const usecaseContext = {roles: [Roles.PAYER]};
      const {payerId, payer} = args;

      const createAddressUseCase = new CreateAddress(repos.address);
      const updatePayerUseCase = new UpdatePayerUsecase(repos.payer);
      const changeInvoiceStatusUseCase = new ChangeInvoiceStatus(repos.invoice);

      const addressResult = await createAddressUseCase.execute({
        city: payer.city,
        country: payer.country,
        addressLine1: payer.billingAddress
      });

      if (addressResult.isRight()) {
        address = addressResult.value.getValue();
      }

      const updatePayerRequest = {
        payerId,
        type: payer.type,
        name: payer.name,
        email: payer.email,
        addressId: address.id.toString()
      };

      const payerResult = await updatePayerUseCase.execute(
        updatePayerRequest,
        usecaseContext
      );

      if (payerResult.isRight()) {
        updatedPayer = payerResult.value.getValue();
      }

      const invoiceResult = await changeInvoiceStatusUseCase.execute({
        invoiceId: updatedPayer.invoiceId.id.toString(),
        status: 'ACTIVE'
      });

      if (invoiceResult.isRight()) {
        invoice = invoiceResult.value.getValue();
      }

      return PayerMap.toPersistence(updatedPayer);
    }
  }
};

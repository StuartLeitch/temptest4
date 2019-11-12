import {
  Payer,
  PayerMap,
  Roles,
  UpdatePayerUsecase,
  Address
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
      let updatedPayer;
      let invoice;

      const {repos} = context;
      const usecaseContext = {roles: [Roles.PAYER]};
      const {payerId, payer} = args;

      const createAddressUseCase = new CreateAddress(repos.address);
      const updatePayerUseCase = new UpdatePayerUsecase(repos.payer);
      const changeInvoiceStatusUseCase = new ChangeInvoiceStatus();

      const addressResult = await createAddressUseCase.execute({
        city: payer.city,
        country: payer.country,
        addressLine1: payer.billingAddress
      });

      if (addressResult.isRight()) {
        address = addressResult.value.getValue();
      }

      // const updatePayerRequest = {
      //   payerId,
      //   type: payer.type,
      //   name: payer.name,
      //   email: payer.email,
      //   addressId: address.id
      // };

      // try {
      //   updatedPayer = await updatePayerUseCase.execute(
      //     updatePayerRequest,
      //     usecaseContext
      //   );
      // } catch (err) {
      //   throw new Error(err.message);
      // }

      // try {
      //   invoice = await changeInvoiceStatusUseCase.execute(
      //     updatedPayer.invoiceId,
      //     'ACTIVE'
      //   );
      // } catch (err) {
      //   throw new Error(err.message);
      // }

      // return PayerMap.toPersistence(updatedPayer.getValue());
      return payer;
    }
  }
};

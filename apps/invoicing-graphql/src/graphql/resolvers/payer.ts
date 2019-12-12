import {
  PayerMap,
  AddressMap,
  GetAddressUseCase,
  ConfirmInvoiceUsecase
} from '@hindawi/shared';

import { Resolvers } from '../schema';
import { Context } from '../../context';
import { config } from '../../config';

export const payer: Resolvers<Context> = {
  Mutation: {
    async confirmInvoice(parent, args, context) {
      const { repos, vatService, emailService } = context;
      const { payer: inputPayer } = args;

      const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
        repos.invoiceItem,
        repos.address,
        repos.invoice,
        repos.payer,
        emailService,
        vatService,
        config.sanctionedCountryNotificationReceiver,
        config.sanctionedCountryNotificationSender
      );
      const maybeUpdatedPayer = await confirmInvoiceUsecase.execute({
        payer: inputPayer
      });
      if (maybeUpdatedPayer.isLeft()) {
        throw new Error(
          `Error: ${maybeUpdatedPayer.value.errorValue().message}`
        );
      }
      return PayerMap.toPersistence(maybeUpdatedPayer.value.getValue());
    }
  },
  Payer: {
    async address(payer: any, args: any, context) {
      const getAddressUseCase = new GetAddressUseCase(context.repos.address);

      const address = await getAddressUseCase.execute({
        billingAddressId: payer.billingAddressId
      });

      if (address.isLeft()) {
        throw new Error(`Can't get address for payer ${payer.id}`);
      }

      return AddressMap.toPersistence(address.value.getValue());
    }
  }
};

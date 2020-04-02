/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {
  PayerMap,
  AddressMap,
  GetAddressUseCase,
  ConfirmInvoiceUsecase,
} from '@hindawi/shared';

import { Resolvers } from '../schema';
import { env } from '../../env';

export const payer: Resolvers<any> = {
  Mutation: {
    async confirmInvoice(parent, args, context) {
      const {
        repos,
        services: { vatService, emailService, logger: loggerService },
      } = context;
      const { payer: inputPayer } = args;

      const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
        repos.invoiceItem,
        repos.address,
        repos.invoice,
        repos.payer,
        repos.coupon,
        repos.waiver,
        emailService,
        vatService,
        loggerService
      );
      const maybeUpdatedPayer = await confirmInvoiceUsecase.execute({
        payer: inputPayer,
        sanctionedCountryNotificationReceiver:
          env.app.sanctionedCountryNotificationReceiver,
        sanctionedCountryNotificationSender:
          env.app.sanctionedCountryNotificationSender,
      });
      if (maybeUpdatedPayer.isLeft()) {
        throw new Error(
          `Error: ${maybeUpdatedPayer.value.errorValue().message}`
        );
      }
      return PayerMap.toPersistence(maybeUpdatedPayer.value.getValue());
    },
  },
  Payer: {
    async address(payer: any, args: any, context) {
      const getAddressUseCase = new GetAddressUseCase(context.repos.address);

      const address = await getAddressUseCase.execute({
        billingAddressId: payer.billingAddressId,
      });

      if (address.isLeft()) {
        throw new Error(`Can't get address for payer ${payer.id}`);
      }

      return AddressMap.toPersistence(address.value.getValue());
    },
  },
};

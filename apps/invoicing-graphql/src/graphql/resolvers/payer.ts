/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {
  PayerMap,
  AddressMap,
  GetAddressUseCase,
  ConfirmInvoiceUsecase,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';
import { env } from '../../env';

export const payer: Resolvers<Context> = {
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
      const updatedPayer = await confirmInvoiceUsecase.execute({
        payer: inputPayer,
        sanctionedCountryNotificationReceiver:
          env.app.sanctionedCountryNotificationReceiver,
        sanctionedCountryNotificationSender:
          env.app.sanctionedCountryNotificationSender,
      });

      if (updatedPayer.isLeft()) {
        throw new Error(`Error: ${updatedPayer.value.errorValue().message}`);
      }

      return PayerMap.toPersistence(updatedPayer.value.getValue());
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

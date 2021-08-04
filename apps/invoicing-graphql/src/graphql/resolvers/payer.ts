/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {
  ConfirmInvoiceUsecase,
  GetAddressUsecase,
  AddressMap,
  PayerMap,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';
import { env } from '../../env';

import { handleForbiddenUsecase } from './utils';

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
        repos.transaction,
        repos.address,
        repos.invoice,
        repos.coupon,
        repos.waiver,
        repos.payer,
        loggerService,
        emailService,
        vatService
      );

      const usecaseContext = {
        roles: [Roles.PAYER],
      };

      const updatedPayer = await confirmInvoiceUsecase.execute(
        {
          payer: inputPayer,
          sanctionedCountryNotificationReceiver:
            env.app.sanctionedCountryNotificationReceiver,
          sanctionedCountryNotificationSender:
            env.app.sanctionedCountryNotificationSender,
        },
        usecaseContext
      );

      handleForbiddenUsecase(updatedPayer);

      if (updatedPayer.isLeft()) {
        throw new Error(`Error: ${updatedPayer.value.message}`);
      }

      return PayerMap.toPersistence(updatedPayer.value);
    },
  },
  Payer: {
    async address(payer: any, args: any, context) {
      const getAddressUseCase = new GetAddressUsecase(context.repos.address);

      const usecaseContext = {
        roles: [Roles.PAYER],
      };

      const address = await getAddressUseCase.execute(
        {
          billingAddressId: payer.billingAddressId,
        },
        usecaseContext
      );

      handleForbiddenUsecase(address);

      if (address.isLeft()) {
        throw new Error(`Can't get address for payer ${payer.id}`);
      }

      return AddressMap.toPersistence(address.value);
    },
  },
};

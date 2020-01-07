import {
  PayerMap,
  AddressMap,
  GetAddressUseCase,
  ConfirmInvoiceUsecase
} from '@hindawi/shared';

import { Resolvers, PayerType } from '../schema';
import { env } from '../../env';

import { CreateAddress } from '../../../../../libs/shared/src/lib/modules/addresses/usecases/createAddress/createAddress';
import { ChangeInvoiceStatus } from '../../../../../libs/shared/src/lib/modules/invoices/usecases/changeInvoiceStatus/changeInvoiceStatus';
import { CreatePayerUsecase } from './../../../../../libs/shared/src/lib/modules/payers/usecases/createPayer/createPayer';
import { DomainEvents } from 'libs/shared/src/lib/core/domain/events/DomainEvents';

export const payer: Resolvers<any> = {
  Mutation: {
    async confirmInvoice(parent, args, context) {
      const { repos, vatService, emailService } = context;
      const { payer: inputPayer } = args;

      const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
        repos.invoiceItem,
        repos.address,
        repos.invoice,
        repos.payer,
        repos.coupon,
        emailService,
        vatService,
        env.app.sanctionedCountryNotificationReceiver,
        env.app.sanctionedCountryNotificationSender
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

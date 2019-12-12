import { Roles, GetPaymentMethodsUseCase } from '@hindawi/shared';

import { Resolvers } from '../schema';

import { SetTransactionToActiveByCustomIdUsecase } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/setTransactionToActiveByCustomId/setTransactionToActiveByCustomId';

export const transactions: Resolvers<any> = {
  Mutation: {
    async setTransactionToActive(parent, args, context) {
      const {
        repos: {
          catalog: catalogRepo,
          transaction: transactionRepo,
          invoiceItem: invoiceItemRepo,
          invoice: invoiceRepo,
          manuscript: articleRepo
        }
      } = context;
      const { customId } = args;

      const setTransactionToActiveByCustomId = new SetTransactionToActiveByCustomIdUsecase(
        catalogRepo,
        transactionRepo,
        invoiceItemRepo,
        invoiceRepo,
        articleRepo
      );
      const usecaseContext = { roles: [Roles.ADMIN] };

      const result = await setTransactionToActiveByCustomId.execute(
        {
          customId
        },
        usecaseContext
      );

      if (result.isLeft()) {
        return null;
      }

      const updatedTransaction = result.value.getValue();

      return {
        id: updatedTransaction.transactionId.id.toString(),
        status: updatedTransaction.status
      };
    }
  }
};

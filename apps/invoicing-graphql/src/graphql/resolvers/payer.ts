import {Payer, PayerMap, Roles, UpdatePayerUsecase} from '@hindawi/shared';

import {Resolvers} from '../schema';
import {Context} from '../../context';

export const payerResolvers: Resolvers<Context> = {
  Query: {},

  Mutation: {
    async updateInvoicePayer(parent, args, context) {
      const {repos} = context;
      const usecase = new UpdatePayerUsecase(repos.payer);
      const usecaseContext = {roles: [Roles.PAYER]};

      const {payerId, payer} = args;
      console.log('the payer ', payer);

      const usecaseRequest = {
        payerId,
        type: payer.type,
        name: payer.name
      };

      const result = await usecase.execute(usecaseRequest, usecaseContext);

      console.log(result);
      if (!result.isSuccess) {
        return undefined;
      }

      const updatedPayer = result.getValue();

      const payerDto = PayerMap.toPersistence(updatedPayer);
      console.log('payerDto ->', JSON.stringify(payerDto));
      return {
        ...payerDto
      };
    }
  }
};

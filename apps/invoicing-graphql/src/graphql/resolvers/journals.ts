/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { GetJournalListUsecase, CatalogMap, Roles } from '@hindawi/shared';

import { Resolvers } from '../schema';
import { Context } from '../../builders';

export const journals: Resolvers<Context> = {
  Query: {
    async journals(parent, args, context) {
      const { repos } = context;

      const usecase = new GetJournalListUsecase(repos.catalog);

      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const result = await usecase.execute(args, usecaseContext);

      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      const journalsList = result.value.getValue();
      return journalsList.map(CatalogMap.toPersistence);
    },
  },
};

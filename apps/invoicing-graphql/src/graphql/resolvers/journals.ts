/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { GetJournalListUsecase, CatalogMap, Roles } from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const invoicingJournals: Resolvers<Context> = {
  Query: {
    async invoicingJournals(parent, args, context) {
      const roles = getAuthRoles(context);

      const { repos } = context;

      const usecase = new GetJournalListUsecase(repos.catalog);

      const usecaseContext = {
        roles,
      };

      const resultJournals = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(resultJournals);

      if (resultJournals.isLeft()) {
        throw new Error(resultJournals.value.message);
      }

      const journalList = resultJournals.value;

      return {
        totalCount: journalList.totalCount,
        catalogItems: journalList.catalogItems.map(CatalogMap.toPersistence),
      };
    },
  },
};

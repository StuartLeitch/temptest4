/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  GetJournalListUsecase,
  GetPublisherDetailsUsecase,
  CatalogMap,
  Roles,
} from '@hindawi/shared';

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

      const result = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      const journalList = result.value;

      console.log(journalList);

      return {
        totalCount: journalList.totalCount,
        catalogItems: journalList.catalogItems.map(CatalogMap.toPersistence),
      };
    },
  },
};

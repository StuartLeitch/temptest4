/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { GetJournalListUsecase, CatalogMap, Roles } from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const journals: Resolvers<Context> = {
  Query: {
    async journals(parent, args, context) {
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

      const journalsList = result.value;

      return journalsList.map(CatalogMap.toPersistence);
    },
  },
};

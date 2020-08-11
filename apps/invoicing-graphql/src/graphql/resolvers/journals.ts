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
        return undefined;
      }

      const journalsList = result.value.getValue();
      // console.info('[INFO] Journal list:', journalsList.slice(0,6), '...');

      return journalsList.map(CatalogMap.toPersistence);
      // return journalsList.map(({ props: { journalId, journalTitle } }) => ({
      //   journalId: journalId.id.toString(),
      //   journalTitle,
      // }));
    },
  },
};

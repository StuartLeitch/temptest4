/* eslint-disable max-len */

import { Roles } from '@hindawi/shared';
import { Resolvers } from '../schema';
import { GetJournalListUsecase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/journals/getJournalList/getJournalList';
import { CatalogMap } from  '../../../../../libs/shared/src/lib/modules/journals/mappers/CatalogMap';

export const journals: Resolvers<any> = {
  Query: {
    async journals(parent, args, context) {
      const { repos } = context;
      const usecase = new GetJournalListUsecase(repos.catalog);
      const usecaseContext = {
        roles: [Roles.ADMIN]
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

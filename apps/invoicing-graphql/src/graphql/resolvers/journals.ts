/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  GetJournalListUsecase,
  CatalogMap,
  Roles,
  GetPublisherDetailsUsecase,
  PublisherMap,
  UpdateCatalogItemFieldsUsecase,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers, InvoicingJournal } from '../schema';

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
        const err = resultJournals.value;
        context.services.logger.error(err.message, err);
        return null;
      }

      const journalList = resultJournals.value;
      return {
        totalCount: journalList.totalCount,
        catalogItems: journalList.catalogItems.map(CatalogMap.toPersistence),
      };
    },
  },
  InvoicingJournal: {
    async publisher(parent: InvoicingJournal, args, context) {
      const roles = getAuthRoles(context);

      const { repos } = context;

      const usecase = new GetPublisherDetailsUsecase(repos.publisher);

      const usecaseContext = {
        roles,
      };

      const resultPublisher = await usecase.execute(
        {
          publisherId: parent.publisherId,
        },
        usecaseContext
      );

      if (resultPublisher.isLeft()) {
        throw new Error(resultPublisher.value.message);
      }

      const publisher = resultPublisher.value;

      return PublisherMap.toPersistence(publisher);
    },
  },
  Mutation: {
    async updateCatalogItem(parent, args, context) {
      const roles = getAuthRoles(context);
      const { repos } = context;

      const usecase = new UpdateCatalogItemFieldsUsecase(repos.catalog);
      const usecaseContext = { roles };
      const result = await usecase.execute(args.catalogItem, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return CatalogMap.toPersistence(result.value);
    },
  },
};

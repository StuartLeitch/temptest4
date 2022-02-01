/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  GetPublisherDetailsUsecase,
  Roles,
  PublisherMap,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const invoicingJournals: Resolvers<Context> = {
  Query: {
    async getPublishers(parent, args, context) {
      const roles = getAuthRoles(context);

      const { repos } = context;

      const usecase = new GetPublisherDetailsUsecase(repos.publisher);

      const usecaseContext = {
        roles,
      };

      const result = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      const publishers = result.value;

      console.log(publishers);

      return PublisherMap.toPersistence(publishers);
    },
  },
};

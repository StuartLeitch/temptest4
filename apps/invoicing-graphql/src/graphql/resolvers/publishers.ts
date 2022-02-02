/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  GetPublisherDetailsUsecase,
  GetPublisherDetailsDTO,
  Roles,
  PublisherMap,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const publisher: Resolvers<Context> = {
  Query: {
    async getPublisherDetails(parent, args, context): Promise<any> {
      const roles = getAuthRoles(context);

      const { repos } = context;

      const usecase = new GetPublisherDetailsUsecase(repos.publisher);

      const request: GetPublisherDetailsDTO = {
        publisherId: args.publisherId,
      };

      const usecaseContext = {
        roles,
      };

      const result = await usecase.execute(request, usecaseContext);

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

/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  GetPublisherDetailsUsecase,
  GetPublisherDetailsDTO,
  GetPublishersByPublisherIdUsecase,
  Roles,
  PublisherMap,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const publisher: Resolvers<Context> = {
  Query: {
    async getPublisherDetails(parent, args, context) {
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

      return PublisherMap.toPersistence(publishers);
    },

    async getPublishers(parent, args, context) {
      const roles = getAuthRoles(context);

      const { repos } = context;

      const usecase = new GetPublishersByPublisherIdUsecase(repos.publisher);

      const usecaseContext = { roles };

      const resultPublisherList = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(resultPublisherList);

      if (resultPublisherList.isLeft()) {
        throw new Error(resultPublisherList.value.message);
      }

      const publisherList = resultPublisherList.value;

      return {
        totalCount: publisherList.totalCount,
        publishers: publisherList.publishers.map(PublisherMap.toPersistence),
      };
    },
  },
};

import {
  GetRecentLogsUsecase,
  AuditLogMap
} from '@hindawi/shared';

import { Resolvers } from '../schema';
import { Context } from '../../builders';

import {
  handleForbiddenUsecase,
  getAuthRoles,
} from './utils';

export const audit: Resolvers<Context> = {
  Query: {
    async auditlogs(parent, args, context) {
      const contextRoles = getAuthRoles(context);

      const { repos } = context;

      const usecase = new GetRecentLogsUsecase(repos.audit);
      const usecaseContext = {
        roles: contextRoles,
      };

      const result = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        return undefined;
      }

      const logsList = result.value;

      return {
        totalCount: logsList.totalCount,
        logs: logsList.auditLogs.map(AuditLogMap.toPersistence),
      };
    }
  }
};

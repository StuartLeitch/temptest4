import { GenerateCompensatoryEventsUsecase } from '@hindawi/shared';

import { Resolvers } from '../schema';

import { env } from '../../env';

export const generateCompensatoryEvents: Resolvers<any> = {
  Mutation: {
    async generateCompensatoryEvents(parent, args, context) {
      return 'ok';
    }
  }
};

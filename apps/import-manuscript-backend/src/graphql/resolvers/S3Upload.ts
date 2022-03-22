import { ApolloKeycloakAuthUtils } from '@hindawi/shared';
import {
  CreateManuscriptUploadUrlUseCase,
  ConfirmManuscriptUploadUseCase,
  Roles,
} from '@hindawi/import-manuscript-commons';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { env } from '../../env';

const utils = new ApolloKeycloakAuthUtils<Context, Roles>(
  env.app.keycloakClientId,
  Roles
);

export const s3Upload: Resolvers<Context> = {
  Mutation: {
    async confirmS3Upload(parent, args, context) {
      const { fileName }: { fileName: string } = args.confirmation;

      const senderEmail = utils.getUserEmail(context);
      const receiver = {
        email: env.app.validationUnsuccessfulEmail,
        name: env.app.validationUnsuccessfulReceiver
      };

      const contextRoles = utils.getAuthRoles(context);
      const useCaseContext = {
        roles: contextRoles,
      };

      const { services } = context;
      try {
        const confirmManuscriptUploadUseCase = new ConfirmManuscriptUploadUseCase(
          services.uploadService,
          services.queueService,
          services.logger,
          services.emailService
        );
        const response = await confirmManuscriptUploadUseCase.execute(
          { fileName, senderEmail, receiver },
          useCaseContext
        );

        utils.handleForbiddenUsecase(response);

        if (response.isLeft()) {
          throw new Error(response.value.message);
        }

        return true;
      } catch (err) {
        services.logger.error(err);
        throw err;
      }
    },
  },

  Query: {
    async createSignedUrlForS3Upload(parent, args, context): Promise<string> {
      const fileName: string = args.fileName;

      const contextRoles = utils.getAuthRoles(context);
      const useCaseContext = {
        roles: contextRoles,
      };

      const { services } = context;

      try {
        const createManuscriptUploadUrlUseCase = new CreateManuscriptUploadUrlUseCase(
          services.uploadService,
          services.logger
        );
        const response = await createManuscriptUploadUrlUseCase.execute(
          { fileName },
          useCaseContext
        );

        utils.handleForbiddenUsecase(response);

        if (response.isLeft()) {
          throw new Error(response.value.message);
        }

        return response.value;
      } catch (err) {
        context.services.logger.error(err);
        throw err;
      }
    },
  },
};

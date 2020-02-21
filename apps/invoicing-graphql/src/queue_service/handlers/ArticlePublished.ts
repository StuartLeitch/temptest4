import { ArticlePublished as ArticlePublishedEventPayload } from '@hindawi/phenom-events';
import {
  EpicOnArticlePublishedUsecase,
  EpicOnArticlePublishedDTO
} from '../../../../../libs/shared/src/lib/modules/manuscripts/usecases/epicOnArticlePublished';
import { Logger } from '../../lib/logger';
import { env } from '../../env';

const ARTICLE_PUBLISHED = 'ArticlePublished';
const logger = new Logger(`events:${ARTICLE_PUBLISHED}`);

export const ArticlePublishedHandler = {
  event: ARTICLE_PUBLISHED,
  async handler(data: ArticlePublishedEventPayload) {
    logger.info(`Incoming Event Data`, data);

    const {
      customId,
      // articleType: { name },
      // journalId,
      published
      // title
    } = data;

    const {
      repos: {
        invoice: invoiceRepo,
        invoiceItem: invoiceItemRepo,
        manuscript: manuscriptRepo,
        payer: payerRepo,
        address: addressRepo,
        coupon: couponRepo,
        waiver: waiverRepo
      },
      services: { emailService, vatService, logger: loggerService }
    } = this;
    const {
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender
    } = env.app;

    const epicOnArticlePublishedUsecase = new EpicOnArticlePublishedUsecase(
      invoiceItemRepo,
      manuscriptRepo,
      invoiceRepo,
      payerRepo,
      addressRepo,
      couponRepo,
      waiverRepo,
      emailService,
      vatService,
      loggerService
    );

    try {
      const args: EpicOnArticlePublishedDTO = {
        customId,
        published,
        sanctionedCountryNotificationReceiver,
        sanctionedCountryNotificationSender
      };
      const result = await epicOnArticlePublishedUsecase.execute(args);

      if (result.isLeft()) {
        logger.error(result.value.error.toString());
      }
    } catch (error) {
      logger.error(error);
    }
  }
};

import { ArticlePublished as ArticlePublishedEventPayload } from '@hindawi/phenom-events';
import {
  EpicOnArticlePublishedUsecase,
  EpicOnArticlePublishedDTO
} from '../../../../../libs/shared/src/lib/modules/manuscripts/usecases/epicOnArticlePublished';
import { Logger } from '../../lib/logger';

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
      repos: { /*catalog: catalogRepo, */ manuscript: manuscriptRepo }
    } = this;

    const epicOnArticlePublishedUsecase = new EpicOnArticlePublishedUsecase(
      manuscriptRepo
    );
    try {
      const args: EpicOnArticlePublishedDTO = { customId, published };
      const result = await epicOnArticlePublishedUsecase.execute(args);

      if (result.isLeft()) {
        console.error(result.value.error);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

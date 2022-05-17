import { Mapper } from '../../../../../shared/src/lib/infrastructure';
import {
  ArticleType,
  ArticleTypeProps,
} from '../submission-system-models/article-type';

export interface RawArticleTypesProps {
  id: string;
  name: string;
}

export class SubmissionSystemArticleTypeMapper extends Mapper<ArticleType> {
  static toDomain(raw: Partial<RawArticleTypesProps>): ArticleType {
    const props: ArticleTypeProps = {
      id: raw.id,
      name: raw.name,
    };
    return ArticleType.create(props);
  }

  static toPersistance(article: ArticleType): ArticleTypeProps {
    return {
      id: article.id,
      name: article.name,
    };
  }
}

import { ValueObject, ValueObjectProps } from '@hindawi/shared';

export interface ArticleTypeProps extends ValueObjectProps {
  id: string;
  name: string;
}

export class ArticleType extends ValueObject<ArticleTypeProps> {
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: ArticleTypeProps) {
    super(props);
  }

  static create(props: ArticleTypeProps): ArticleType {
    return new ArticleType(props);
  }
}

import { UniqueEntityID, Mapper } from '@hindawi/shared';

import { Founding, FoundingProps } from '../founding';

export interface RawFoundingProps {
  recipientName: string;
  founderName: string;
  founderId: string;
  id: string;
}

export class FoundingMapper extends Mapper<unknown> {
  static toDomain(raw: RawFoundingProps): Founding {
    const props: FoundingProps = {
      id: raw.id && new UniqueEntityID(raw.id),
      founderName: raw.founderName,
      recipientName: raw.recipientName,
      founderId: raw.founderId,
    };

    return Founding.create(props);
  }

  static toPersistance(founding: Founding): RawFoundingProps {
    return {
      recipientName: founding.recipientName,
      founderName: founding.founderName,
      founderId: founding.founderId,
      id: founding.id.toString(),
    };
  }
}

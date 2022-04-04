import { Mapper } from '@hindawi/shared';

import { IssnProps, IssnType, Issn } from '../issn';

interface RawIssnProps {
  value: string;
  type: string;
}

export class IssnMapper extends Mapper<Issn> {
  static toDomain(raw: Partial<RawIssnProps>): Issn {
    const props: IssnProps = {
      type: raw.type ? IssnType[raw.type] : null,
      value: raw.value || null,
    };

    return Issn.create(props);
  }

  static toPersistence(issn: Issn): RawIssnProps {
    return {
      value: issn.value,
      type: issn.type,
    };
  }
}

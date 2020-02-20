import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';

import { PublisherCustomValues } from '../domain/PublisherCustomValues';
import { Publisher } from '../domain/Publisher';

interface RawPublisher {
  customValues: PublisherCustomValues;
  dateCreated: string;
  dateUpdated: string;
  name: string;
  id: string;
}

export class PublisherMap extends Mapper<Publisher> {
  public static toDomain(raw: RawPublisher): Publisher | null {
    const now = new Date();
    const props = {
      customValues: raw.customValues,
      dateCreated: raw.dateCreated ? new Date(raw.dateCreated) : now,
      dateUpdated: raw.dateUpdated ? new Date(raw.dateUpdated) : now,
      name: raw.name
    };
    const maybePublisher = Publisher.create(props, new UniqueEntityID(raw.id));

    if (maybePublisher.isSuccess) {
      return maybePublisher.getValue();
    }

    console.log(maybePublisher.errorValue);
    return null;
  }

  public static toPersistence(publisher: Publisher): RawPublisher | null {
    if (!publisher) {
      return null;
    }

    return {
      dateCreated: publisher.dateCreated.toISOString(),
      dateUpdated: publisher.dateUpdated.toISOString(),
      customValues: publisher.customValue,
      id: publisher.id.toString(),
      name: publisher.name
    };
  }
}

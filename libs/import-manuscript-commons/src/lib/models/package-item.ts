import {
  ValueObjectProps,
  GuardArgument,
  ValueObject,
  Guard,
} from '@hindawi/shared';

interface MetadataDetails {
  '#text': string;
  '@_metadata-name': string;
}

interface ItemMetadataProps {
  metadata: Array<MetadataDetails> | MetadataDetails;
}

interface ItemInstanceProps {
  '@_media-type'?: string;
  '@_xlink:href': string;
}

export interface PackageItemProps extends ValueObjectProps {
  'item-metadata'?: ItemMetadataProps;
  instance: ItemInstanceProps;
  'item-description'?: string;
  '@_item-version'?: string;
  '@_item-type': string;
  'file-order'?: string;
  '@_id'?: string;
}

type Metadata = Readonly<Record<string, string>>;

export class PackageItem extends ValueObject<PackageItemProps> {
  public readonly metadata: Metadata = undefined;
  public readonly description?: string;
  public readonly fileOrder?: string;
  public readonly mediaType?: string;
  public readonly version?: string;
  public readonly type: string;
  public readonly id?: string;
  public readonly uri: string;

  private constructor(props: PackageItemProps) {
    super(props);

    if (props['item-metadata']) {
      this.metadata = processMetadata(props['item-metadata'].metadata);
    }
    this.version = props['@_item-version'];
    this.description = props['item-description'];
    this.id = props['@_id'];
    this.type = props['@_item-type'];
    this.mediaType = props.instance['@_media-type'];
    this.uri = props.instance['@_xlink:href'];
    this.fileOrder = props['file-order'];
  }

  static create(props: PackageItemProps): PackageItem {
    const guardArgs: GuardArgument[] = [
      { argument: props.instance['@_xlink:href'], argumentName: 'href' },
      { argument: props['@_item-type'], argumentName: 'item-type' },
      { argument: props.instance, argumentName: 'instance' },
    ];

    const nullResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (nullResult.failed) {
      console.log(JSON.stringify(props));
      throw nullResult;
    }

    return new PackageItem(props);
  }
}

function processMetadata(
  metadata: Array<MetadataDetails> | MetadataDetails
): Metadata {
  if (Array.isArray(metadata)) {
    const parsed = metadata.reduce((acc, item) => {
      acc[item['@_metadata-name']] = item['#text'];
      return acc;
    }, {});

    return Object.freeze(parsed);
  }
  return Object.freeze({ [metadata['@_metadata-name']]: metadata['#text'] });
}

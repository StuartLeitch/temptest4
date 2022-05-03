import {
  ValueObjectProps,
  GuardArgument,
  ValueObject,
  GuardFail,
  Guard,
} from '@hindawi/shared';

import { PackageItemProps, PackageItem } from './package-item';

export interface ManifestProps extends ValueObjectProps {
  '@_manifest-version': string;
  item: Array<PackageItemProps> | PackageItemProps;
}

export class Manifest extends ValueObject<ManifestProps> {
  public readonly items: ReadonlyArray<PackageItem>;
  public readonly version: string;

  private constructor(props: ManifestProps) {
    super(props);

    this.items = Object.freeze(props.item.map(PackageItem.create));
    this.version = props['@_manifest-version'];
  }

  static create(props: ManifestProps): Manifest {
    const guardArgs: GuardArgument[] = [
      {
        argument: props['@_manifest-version'],
        argumentName: 'manifest-version',
      },
      { argument: props.item, argumentName: 'items' },
    ];

    const nullResult = Guard.againstNullOrUndefinedBulk(guardArgs);
    const emptyResult = Guard.againstEmpty(props.item, 'items');

    if (!Array.isArray(props.item)) {
      throw new GuardFail('There must be multiple items defined');
    }

    const guardResult = Guard.combineResults([nullResult, emptyResult]);

    if (guardResult.failed) {
      throw guardResult;
    }

    return new Manifest(props);
  }
}

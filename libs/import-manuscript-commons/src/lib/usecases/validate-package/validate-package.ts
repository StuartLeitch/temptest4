import { readdir } from 'fs/promises';
import { join } from 'path';
import VError from 'verror';

import { LoggerContract, UseCase } from '@hindawi/shared';

import { ManifestProps, Manifest, Path, PackageItem } from '../../models';
import { XmlServiceContract } from '../../services';
import { FileUtils } from '../../utils';

import type { ValidatePackage as Response } from './validate-package-response';
import type { ValidatePackageDTO as DTO } from './validate-package-dto';

type ManifestXML = {
  manifest: ManifestProps;
};

export class ValidatePackageUseCase
  implements UseCase<DTO, Promise<Response>, null>
{
  constructor(
    private readonly xmlService: XmlServiceContract,
    private readonly logger: LoggerContract
  ) {}

  public async execute(request: DTO): Promise<Response> {
    const packagePath = Path.create(request.packagePath);
    const manifestPath = Path.create(join(request.packagePath, 'manifest.xml'));
    const manifestDefinitionPath = Path.create(
      join(request.definitionsPath, 'MECA_manifest.dtd')
    );

    await this.xmlService.validate(manifestPath, manifestDefinitionPath);

    const rawManifest = await this.xmlService.parseXml<ManifestXML>(
      manifestPath
    );

    const manifest = Manifest.create(rawManifest.manifest);

    validateItemTypeCount(manifest);
    await validateFilesInPackage(packagePath, manifest);
    await validateItemAreAccessible(packagePath, manifest);

    this.logger.info(
      `Successfully parsed the manifest file for package at route ${packagePath.src}`
    );
  }
}

async function getInaccessibleFiles(
  packagePath: Path,
  items: ReadonlyArray<PackageItem>
): Promise<Array<{ isAccessible: boolean; file: string }>> {
  const promises = items
    .map((item) => ({ path: packagePath.join(item.uri), item: item.uri }))
    .map(async (val) => {
      return FileUtils.isFileAccessible(val.path).then((isAccessible) => ({
        file: val.item,
        isAccessible,
      }));
    });

  const files = await Promise.all(promises);

  return files.filter((f) => !f.isAccessible);
}

function getItemCount(manifest: Manifest, desiredType: string): number {
  const matchingItems = manifest.items.filter(
    (item) => item.type === desiredType
  );

  return matchingItems.length;
}

function exactlyOne(manifest: Manifest, itemType: string): void {
  const errMultipleItems = (itemType: string): Error => {
    return new VError('The manifest contains multiple %s items', itemType);
  };

  const errNoItem = (itemType: string): Error => {
    return new VError('The manifest does not contain any %s item', itemType);
  };

  const count = getItemCount(manifest, itemType);

  if (count === 0) {
    throw errNoItem(itemType);
  }

  if (count > 1) {
    throw errMultipleItems(itemType);
  }
}

function validateItemTypeCount(manifest: Manifest): void {
  exactlyOne(manifest, 'manuscript');
  exactlyOne(manifest, 'manifest-metadata');
  exactlyOne(manifest, 'article-metadata');
  exactlyOne(manifest, 'transfer-metadata');
}

async function validateFilesInPackage(
  packagePath: Path,
  manifest: Manifest
): Promise<void> {
  const files = await readdir(packagePath.src);

  if (files.length !== manifest.items.length) {
    throw new VError(
      `The number of items in manifest.xml does not match the number of files present in package:
      manifest.xml contains %d items, whereas there are %d files in package`,
      manifest.items.length,
      files.length
    );
  }
}

async function validateItemAreAccessible(
  packagePath: Path,
  manifest: Manifest
): Promise<void> {
  const inaccessibleFiles = await getInaccessibleFiles(
    packagePath,
    manifest.items
  );

  if (inaccessibleFiles.length !== 0) {
    throw new VError(
      'The following files do not exist in package: \n %j',
      inaccessibleFiles.map((f) => f.file)
    );
  }
}

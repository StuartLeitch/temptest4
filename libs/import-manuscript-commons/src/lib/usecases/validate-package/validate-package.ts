import {join} from 'path';
import VError from 'verror';

import {LoggerContract, UseCase} from '@hindawi/shared';

import {XmlServiceContract} from '../../services';
import {FileUtils} from '../../utils';
import {FileType, Manifest, ManifestProps, PackageItem, Path,} from '../../models';

import type {ValidatePackage as Response} from './validate-package-response';
import type {ValidatePackageDTO as DTO} from './validate-package-dto';

type ManifestXML = {
  manifest: ManifestProps;
};

const A_TYPON_REX = 'AtyponReX';
const PHENOM = 'Phenom';

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
    await validateItemAreAccessible(packagePath, manifest);


    const transferDefinitionPath = Path.create(
      join(request.definitionsPath, 'MECA_transfer.dtd')
    );
    const transferPath = Path.create(join(request.packagePath, manifest.items.find(it => it.type === FileType.transferMetadata).uri));
    await this.xmlService.validate(transferPath, transferDefinitionPath);


    const rawTransfer = await this.xmlService.parseXml(transferPath);


    validateTransferMetadata(rawTransfer);

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

function getItemCount(manifest: Manifest, desiredType: FileType): number {
  const matchingItems = manifest.items.filter(
    (item) => item.type === desiredType
  );

  return matchingItems.length;
}

function validateTransferDestination(rawTransfer): void {
  const transfer =
    rawTransfer.transfer['destination']['service-provider']['provider-name'];
  if (transfer !== PHENOM) {
    throw new VError('The destination system is not Phenom!', transfer);
  }

  return null;
}

function validateTransferSource(rawTransfer): void {
  const transfer =
    rawTransfer.transfer['transfer-source']['service-provider'][
      'provider-name'
    ];

  if (transfer !== A_TYPON_REX) {
    throw new VError('The source system is not AtyponReX!', transfer);
  }
}

function validateTransferMetadata(rawTransfer): void {
  validateTransferSource(rawTransfer);
  validateTransferDestination(rawTransfer);
}

function noMoreThanOne(manifest: Manifest, itemType: FileType): void {
  const errMultipleItems = (itemType: string): Error => {
    return new VError('The manifest contains multiple %s items', itemType);
  };

  const count = getItemCount(manifest, itemType);

  if (count > 1) {
    throw errMultipleItems(itemType);
  }
}

function exactlyOne(manifest: Manifest, itemType: FileType): void {
  const errNoItem = (itemType: string): Error => {
    return new VError('The manifest does not contain any %s item', itemType);
  };

  const count = getItemCount(manifest, itemType);

  if (count === 0) {
    throw errNoItem(itemType);
  }

  noMoreThanOne(manifest, itemType);
}

function validateItemTypeCount(manifest: Manifest): void {
  exactlyOne(manifest, FileType.manuscript);
  exactlyOne(manifest, FileType.manifestMetadata);
  exactlyOne(manifest, FileType.articleMetadata);
  exactlyOne(manifest, FileType.transferMetadata);
  noMoreThanOne(manifest, FileType.coverLetter);
  noMoreThanOne(manifest, FileType.conflictOfInterestStatement);
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

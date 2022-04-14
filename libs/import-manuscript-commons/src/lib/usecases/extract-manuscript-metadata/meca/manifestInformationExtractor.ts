import { stat } from 'fs/promises';

import { LoggerContract } from '@hindawi/shared';

import { Path, Manifest, ManifestProps } from '../../../models';

import { XmlServiceContract } from '../../../services';

import { RawFileProps } from '../../../models/mappers';

type ManifestXML = {
  manifest: ManifestProps;
};

export class ManifestInformationExtractor {
  constructor(
    private readonly xmlService: XmlServiceContract,
    private readonly logger: LoggerContract
  ) {}

  async extract(xmlPath: Path, packagePath: Path): Promise<RawFileProps[]> {
    const parsedManifest = await this.xmlService.parseXml<ManifestXML>(xmlPath);

    const manifest = Manifest.create(parsedManifest.manifest);

    const filesPromise = manifest.items.map(async (item) => {
      const itemStat = await stat(packagePath.join(item.uri).src);

      const file: RawFileProps = {
        name: item.description || item.type,
        size: itemStat.size,
        path: item.uri,
        type: item.type,
      };

      return file;
    });

    const files = Promise.all(filesPromise);

    this.logger.info('Files info extracted');

    return files;
  }
}

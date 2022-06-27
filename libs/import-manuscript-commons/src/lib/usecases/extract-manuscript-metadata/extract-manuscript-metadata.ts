import {
  LoggerBuilderContract,
  LoggerContract,
  UseCase,
} from '@hindawi/shared';

import { ManuscriptMapper, RawManuscriptProps } from '../../models/mappers';
import {Manifest, MecaFileType, Path} from '../../models';

import { XmlServiceContract } from '../../services';

import { ManuscriptInformationExtractor } from './meca/manuscriptInformationExtractor';

import { ExtractManuscriptMetadataResponse as Response } from './extract-manuscript-metadata-response';
import type { ExtractManuscriptMetadataDTO as DTO } from './extract-manuscript-metadata-dto';
import {ManifestXML} from "../validate-package";
import {join} from "path";

export class ExtractManuscriptMetadataUseCase
  implements UseCase<DTO, Promise<Response>, null>
{
  logger: LoggerContract;

  constructor(
    private readonly xmlService: XmlServiceContract,
    loggerBuilder: LoggerBuilderContract
  ) {
    this.logger = loggerBuilder.getLogger(
      ExtractManuscriptMetadataUseCase.name
    );
  }

  async execute(request?: DTO): Promise<Response> {
    const packagePath = Path.create(request.packagePath).join();

    const manifestPath = packagePath.join('manifest.xml');
    const rawManifest = await this.xmlService.parseXml<ManifestXML>(
      manifestPath
    );
    const manifest = Manifest.create(rawManifest.manifest);

    const articlePath = Path.create(join(request.packagePath, manifest.items.find(it => it.type === MecaFileType.articleMetadata).uri));
    const transferPath = Path.create(join(request.packagePath, manifest.items.find(it => it.type === MecaFileType.transferMetadata).uri));

    console.log(JSON.stringify(articlePath, null, 2))
    console.log(JSON.stringify(transferPath, null, 2))

    const dataExtractor = new ManuscriptInformationExtractor(
      this.xmlService,
      this.logger
    );

    const rawManuscriptProps: RawManuscriptProps = await dataExtractor.extract(
      manifestPath,
      transferPath,
      articlePath,
      packagePath
    );
    return ManuscriptMapper.toDomain(rawManuscriptProps);
  }
}

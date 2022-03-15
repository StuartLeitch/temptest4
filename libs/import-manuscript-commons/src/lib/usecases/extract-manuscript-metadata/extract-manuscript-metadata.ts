import {
  LoggerBuilderContract,
  LoggerContract,
  UseCase,
} from '@hindawi/shared';

import { ManuscriptMapper, RawManuscriptProps } from '../../models/mappers';
import { Path } from '../../models';

import { XmlServiceContract } from '../../services';

import { ManuscriptInformationExtractor } from './meca/manuscriptInformationExtractor';

import { ExtractManuscriptMetadataResponse as Response } from './extract-manuscript-metadata-response';
import type { ExtractManuscriptMetadataDTO as DTO } from './extract-manuscript-metadata-dto';

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
    const articlePath = packagePath.join('article.xml');
    const transferPath = packagePath.join('transfer.xml');
    const manifestPath = packagePath.join('manifest.xml');

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

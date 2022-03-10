import { Path } from '../../models';

export type ParsedXml = Record<string, unknown>;

export interface XmlServiceContract {
  validate(xmlPath: Path, ...dtdPaths: Array<Path>): Promise<void>;
  parseXml<T extends ParsedXml>(xmlPath: Path): Promise<T>;
}

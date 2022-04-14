import { Path } from '../../models';

export type ParsedXml = Record<string, unknown>;

export interface XPathSelectorContract {
  xpathSelect(selector: string): null | boolean | number | string;
  loadXml(url: string): boolean;
  clearAll(): void;
}

export interface XmlServiceContract {
  validate(xmlPath: Path, ...dtdPaths: Array<Path>): Promise<void>;
  parseXml<T extends ParsedXml>(xmlPath: Path): Promise<T>;
  getXPathSelector(): XPathSelectorContract;
}

import { readFile } from 'fs/promises';
import LibXml, { XmlError } from 'node-libxml';
import { VError, MultiError } from 'verror';
import { XMLParser } from 'fast-xml-parser';

import { Path } from '../../models';
import { FileUtils } from '../../utils';

import { XmlServiceContract, ParsedXml } from '../contracts';

export class XmlService implements XmlServiceContract {
  readonly parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      allowBooleanAttributes: true,
      ignoreAttributes: false,
    });
  }

  async validate(xmlPath: Path, ...dtdPaths: Array<Path>): Promise<void> {
    const validator = new LibXml();

    const manifestExists = await this.filesExist(xmlPath);

    if (!manifestExists) {
      throw new VError('The file %s does not exist in zip', xmlPath.src);
    }

    const dtdsExist = await this.filesExist(...dtdPaths);

    if (!dtdsExist) {
      throw new VError(`The DTD files %j do not exist`, xmlPath, dtdPaths);
    }

    try {
      const formatResult = validator.loadXml(xmlPath.src);
      if (!formatResult) {
        treatXmlFormatErrors(validator.wellformedErrors, xmlPath.src);
      }

      validator.loadDtds(dtdPaths.map((p) => p.src));

      const isValid = validator.validateAgainstDtds();

      if (!isValid) {
        treatXmlValidationErrors(validator.validationDtdErrors, xmlPath.src);
      }
    } catch (err) {
      throw new VError(err);
    }
  }

  async parseXml<T extends ParsedXml>(xmlPath: Path): Promise<T> {
    const xmlFile = await readFile(xmlPath.src);

    return this.parser.parse(xmlFile);
  }

  private async filesExist(...paths: Array<Path>): Promise<boolean> {
    const exists = await Promise.all(paths.map(FileUtils.isFileAccessible));

    if (exists.includes(false)) {
      return false;
    }

    return true;
  }
}

function treatXmlFormatErrors(errors: Array<XmlError>, xmlPath: string): void {
  if (errors) {
    throw new MultiError(errors.map(convertXmlError));
  } else {
    throw new VError(`Failed to load XML ${xmlPath}`);
  }
}

function treatXmlValidationErrors(
  errors: Record<string, Array<XmlError>>,
  xmlPath: string
): void {
  if (errors) {
    throw new MultiError(
      Object.keys(errors).map(
        (key) => new MultiError(errors[key].map(convertXmlError))
      )
    );
  } else {
    throw new VError(`Failed to validate XML ${xmlPath}`);
  }
}

function convertXmlError(error: XmlError): Error {
  return new Error(JSON.stringify(error));
}

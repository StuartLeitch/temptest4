import {Guard, LoggerContract} from '@hindawi/shared';

import { Path } from '../../../models';

import { XmlServiceContract, XPathSelectorContract } from '../../../services';

import { RawManuscriptProps, RawAuthorProps } from '../../../models/mappers';

import { ManifestInformationExtractor } from './manifestInformationExtractor';
import { VError } from 'verror';

export class ManuscriptInformationExtractor {
  constructor(
    private readonly xmlService: XmlServiceContract,
    private readonly logger: LoggerContract
  ) {}

  async extract(
    manifestXmlPath: Path,
    transferXmlPath: Path,
    articleXmlPath: Path,
    packagePath: Path
  ): Promise<RawManuscriptProps> {
    const transferXml = this.xmlService.getXPathSelector();
    const articleXml = this.xmlService.getXPathSelector();

    transferXml.loadXml(transferXmlPath.src);
    articleXml.loadXml(articleXmlPath.src);

    const rawManuscript = extractBaseManuscriptData(articleXml, transferXml);
    const authors = await this.extractAuthorsDetails(articleXmlPath);

    rawManuscript.authors.push(...authors);

    await this.extractAuthorsDetails(articleXmlPath);

    transferXml.clearAll();
    articleXml.clearAll();

    const manifestExtractor = new ManifestInformationExtractor(
      this.xmlService,
      this.logger
    );

    const files = await manifestExtractor.extract(manifestXmlPath, packagePath);
    rawManuscript.files = files;

    this.logger.info(`Manuscript metadata extracted`);

    return rawManuscript;
  }

  private async extractAuthorsDetails(
    articleXmlPath: Path
  ): Promise<RawAuthorProps[]> {
    const ab = await this.xmlService.parseXml(articleXmlPath);

    const aut = getAuthors(getContributors(ab.article));
    const affiliations = getAffiliations(ab.article);

    const rawAuthors = aut.map((author) =>
      extractAuthorData(author, affiliations)
    );

    return rawAuthors;
  }
}

function getAffiliations(article: any): Array<any> {
  if (
    article &&
    article['front'] &&
    article['front']['article-meta'] &&
    article['front']['article-meta']['contrib-group'] &&
    article['front']['article-meta']['contrib-group']['aff']
  ) {
    const data = article['front']['article-meta']['contrib-group']['aff'];

    if (Array.isArray(data)) {
      return data;
    }

    return [data];
  }

  throw new VError('No affiliations found');
}

function getContributors(article: any): Array<any> {
  if (
    article &&
    article['front'] &&
    article['front']['article-meta'] &&
    article['front']['article-meta']['contrib-group'] &&
    article['front']['article-meta']['contrib-group']['contrib']
  ) {
    const data = article['front']['article-meta']['contrib-group']['contrib'];

    if (Array.isArray(data)) {
      return data;
    }

    return [data];
  }

  throw new VError('No authors found');
}

function getAuthors(contributors: Array<any>): Array<any> {
  return contributors.filter((pers) => pers['@_contrib-type'] === 'author');
}

function extractRinggoldId(aff: any): string {
  const externalAffiliationIds = aff['institution-wrap']['institution-id'];
  if(!externalAffiliationIds)
    return '';

  if (Array.isArray(externalAffiliationIds)) {
    const id = externalAffiliationIds.find(
      (aff) => aff['@_institution-id-type'] === 'Ringgold'
    );

    Guard.againstNullOrUndefined(id, 'affiliationId').throwIfFailed()
    Guard.againstEmpty(id, 'affiliationId').throwIfFailed()
    return id && id['#text'];
  }

  return externalAffiliationIds['#text'];
}

function getAuthorAffiliationId(author: any): string {
  const references = author['xref'];
  Guard.againstEmpty(references, "author.affiliation").throwIfFailed()
  if (Array.isArray(references)) {
    return references[0]['@_rid'];
  }
  return references['@_rid'];
}

function extractAuthorData(
  author: any,
  affiliations: Array<any>
): RawAuthorProps {
  const authorAffId = getAuthorAffiliationId(author);
  const authorAff = affiliations.find((aff) => aff['@_id'] === authorAffId);
  Guard.againstNullOrUndefined(authorAff, "author.institution").throwIfFailed()
  const ringgolId = extractRinggoldId(authorAff)

  if (!(authorAff['country'] && authorAff['country']['@_country'])) {
    throw new VError('Country code for an author is missing.');
  }

  const rawAuthor: RawAuthorProps = {
    affiliationName: (authorAff['institution-wrap'] && authorAff['institution-wrap']['institution']) || null,
    affiliationRorId: '__MISSING__',
    affiliationRinggoldId: ringgolId,
    countryCode: (authorAff['country'] && authorAff['country']['@_country']) || null,
    email: author['email'],
    givenName: (author['name'] && author['name']['given-names']) || null,
    surname: author['name']['surname'],
    isCorresponding: author['@_corresp'] === 'yes',
    isSubmitting: author['@_specific-use'] === 'submitting',
  };

  return rawAuthor;
}

function extractBaseManuscriptData(
  articleXml: XPathSelectorContract,
  transferXml: XPathSelectorContract
): RawManuscriptProps {
  const articleAbstract = (<string>(
    articleXml.xpathSelect(
      'string(//article/front/article-meta/abstract/p/text())'
    )
  )).trim();
  const articleTypeId = (<string>(
    articleXml.xpathSelect(
      "string(//article/front/article-meta/article-categories/subj-group[@subj-group-type='Article Type']/subject/text())"
    )
  )).trim();
  const conflictOfInterest = (<string>(
    articleXml.xpathSelect(
      "string(//article/front/article-meta/custom-meta-group/custom-meta[@id='ConflictOfInterest1']/meta-value/text())"
    )
  )).trim();
  const dataAvailability = (<string>(
    articleXml.xpathSelect(
      "string(//article/front/article-meta/custom-meta-group/custom-meta[@id='DataAvailabilityStatement']/meta-value/text())"
    )
  )).trim();
  const articleTitle = (<string>(
    articleXml.xpathSelect(
      'string(//article/front/article-meta/title-group/article-title/text())'
    )
  )).trim();
  const sourceJournalTitle = (<string>(
    articleXml.xpathSelect(
      'string(//article/front/journal-meta/journal-title-group/journal-title/text())'
    )
  )).trim();
  const sourceJournalEissn = (<string>(
    articleXml.xpathSelect(
      "string(//article/front/journal-meta/issn[@pub-type='epub']/text())"
    )
  )).trim();
  const sourceJournalPissn = (<string>(
    articleXml.xpathSelect(
      "string(//article/front/journal-meta/issn[@pub-type='ppub']/text())"
    )
  )).trim();
  const sourceJournalManuscriptId = (<string>(
    articleXml.xpathSelect(
      "string(//article/front/article-meta/article-id[@pub-id-type='internal-id']/text())"
    )
  )).trim();
  const sourceJournalCode = (<string>(
    transferXml.xpathSelect(
      "string(//*[local-name()='transfer']/*[local-name()='transfer-source']/*[local-name()='publication']/*[local-name()='acronym']/text())"
    )
  )).trim();

  const founderId = (<string>(
    articleXml.xpathSelect(
      "string(//article/front/article-meta/funding-group/award-group/funding-source/named-content[@content-type='funder-id']/text())"
    )
  )).trim();
  const founderName = (<string>(
    articleXml.xpathSelect(
      'string(//article/front/article-meta/funding-group/award-group/funding-source/text())'
    )
  )).trim();
  const recipientName = (<string>(
    articleXml.xpathSelect(
      'string(//article/front/article-meta/funding-group/award-group/principal-award-recipient/text())'
    )
  )).trim();
  const foundId = (<string>(
    articleXml.xpathSelect(
      'string(//article/front/article-meta/funding-group/award-group/award-id/text())'
    )
  )).trim();

  const destinationJournalName = (<string>(
    transferXml.xpathSelect(
      "string(//*[local-name()='transfer']/*[local-name()='destination']/*[local-name()='publication']/*[local-name()='publication-title']/text())"
    )
  )).trim();
  const destinationJournalCode = (<string>(
    transferXml.xpathSelect(
      "string(//*[local-name()='transfer']/*[local-name()='destination']/*[local-name()='publication']/*[local-name()='acronym']/text())"
    )
  )).trim();

  const rawManuscript: RawManuscriptProps = {
    articleAbstract,
    articleTypeName: articleTypeId,
    authors: [],
    conflictOfInterest,
    dataAvailability,
    destinationJournal: {
      code: destinationJournalCode,
      name: destinationJournalName,
      phenomId: undefined,
    },
    files: undefined,
    founding: {
      founderId,
      founderName,
      recipientName,
      id: foundId,
    },
    preprintValue: '',
    sourceJournal: {
      code: sourceJournalCode,
      name: sourceJournalTitle,
      eissn: sourceJournalEissn,
      pissn: sourceJournalPissn,
      phenomId: undefined,
    },
    sourceManuscriptId: sourceJournalManuscriptId,
    title: articleTitle,
  };

  return rawManuscript;
}

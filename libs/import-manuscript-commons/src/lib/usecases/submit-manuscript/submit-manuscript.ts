/* eslint-disable max-len */
import {
  GuardFailure,
  LoggerBuilder,
  LoggerContract,
  UseCase,
} from '@hindawi/shared';
import { Manuscript } from '../../models/manuscript';
import {
  AuthorInput,
  CreateDraftManuscriptInput,
  ReviewClientContract,
  UpdateDraftManuscriptInput,
} from '../../services/contracts/review-client-contract';
import {
  ActiveJournal,
  DraftSubmission,
  SourceJournal,
} from '../../models/submission-system-models';
import { MecaFileType } from '../../models/file';

export enum SubmissionSystemFileType {
  figure = 'figure',
  manuscript = 'manuscript',
  supplementary = 'supplementary',
  coverLetter = 'coverLetter',
  reviewComment = 'reviewComment',
  responseToReviewers = 'responseToReviewers',
}

interface Request {
  manuscript: Manuscript;
  packagePath: string;
}

export class SubmitManuscriptUseCase
  implements UseCase<Request, Promise<string>, null>
{
  logger: LoggerContract;

  constructor(
    private readonly reviewClient: ReviewClientContract,
    private readonly reviewAppBasePath: string,
    private readonly supportedArticleTypes: string[],
    private readonly mecaTypes: any,
    loggerBuilder: LoggerBuilder,
  ) {
    this.logger = loggerBuilder.getLogger();
  }

  async execute({ manuscript, packagePath }: Request): Promise<string> {
    const sourceJournalName = manuscript.sourceJournal.name;
    const destinationJournalName = manuscript.destinationJournal.name;
    const allSourceJournals = await this.reviewClient.getSourceJournals();

    const sourceJournal = allSourceJournals.find(
      (sj) => sj.name === sourceJournalName
    ); //TODO add PISSN and EISSN to review
    if (!sourceJournal) {
      throw new GuardFailure(
        `The source journal ${sourceJournalName} for manuscript ${manuscript.sourceManuscriptId} not found.`
      );
    }

    const existingJournals = await this.reviewClient.getAllActiveJournals();
    const destinationJournal = existingJournals.find(
      (aj) => aj.name === destinationJournalName
    );

    if (!destinationJournal) {
      throw new GuardFailure(
        `The destination journal ${destinationJournalName} for manuscript ${manuscript.sourceManuscriptId} not found.`
      );
    }

    this.logger.info(
      `Creating draft manuscript into ${destinationJournal.name}`
    );
    const { manuscriptId, submissionId } = await this.createDraftManuscript(
      destinationJournal
    );
    this.logger.info(
      `Created manuscriptID: ${manuscriptId} submissionId: ${submissionId}`
    );

    this.logger.info(
      `Adding manuscript details for manuscriptID: ${manuscriptId} submissionId: ${submissionId}`
    );
    await this.addManuscriptDetails(manuscript, sourceJournal, manuscriptId);

    this.logger.info(
      `Adding authors to manuscriptID: ${manuscriptId} submissionId: ${submissionId}`
    );
    await this.addAuthorsToManuscript(manuscript, manuscriptId);

    this.logger.info(
      `Uploading files for manuscriptID: ${manuscriptId} submissionId: ${submissionId}`
    );
    await this.uploadFiles(manuscript, manuscriptId, packagePath);

    this.logger.info(
      `Creating submission edit url for manuscriptID: ${manuscriptId} submissionId: ${submissionId}`
    );
    return `${this.reviewAppBasePath}/submit/${submissionId}/${manuscriptId}`;
  }

  private async uploadFiles(
    request: Manuscript,
    manuscriptId: string,
    packagePath: string
  ): Promise<void> {
    for (const file of request.files) {
      const type = this.mapMecaFileTypeToSubmissionSystemFileType(file.type);
      if (type) {
        await this.reviewClient.uploadFile(
          manuscriptId,
          { type: type, size: 1 },
          file.path.prefix(packagePath).src
        );
      } else {
        this.logger.debug(
          `Not uploading ${file.name} as we do not support the ${file.type} file type`
        );
      }
    }
  }

  private async addAuthorsToManuscript(
    request: Manuscript,
    manuscriptId: string
  ): Promise<void> {
    const authors: Array<AuthorInput> = request.authors.map(
      (a): AuthorInput => {
        return {
          email: a.email.value,
          givenNames: a.givenName,
          surname: a.surname,
          affRorId: a.affiliationRorId,
          country: a.countryCode,
          isSubmitting: a.isSubmitting,
          isCorresponding: a.isCorresponding,
          aff: a.affiliationName,
        };
      }
    );
    for (const author of authors) {
      await this.reviewClient.setSubmissionAuthors(manuscriptId, author);
    }
  }

  private mapMecaFileTypeToSubmissionSystemFileType(
    mecaFileType: MecaFileType
  ): SubmissionSystemFileType {
    const mapper: Map<MecaFileType, SubmissionSystemFileType> = new Map<
      MecaFileType,
      SubmissionSystemFileType
    >();

    mapper.set(MecaFileType.coverLetter, SubmissionSystemFileType.coverLetter);
    mapper.set(MecaFileType.manuscript, SubmissionSystemFileType.manuscript);

    mapper.set(
      MecaFileType.conflictOfInterestStatement,
      SubmissionSystemFileType.supplementary
    );
    mapper.set(
      MecaFileType.supportingInformation,
      SubmissionSystemFileType.supplementary
    );
    mapper.set(
      MecaFileType.reportsAndResponses,
      SubmissionSystemFileType.supplementary
    );
    mapper.set(
      MecaFileType.supplementary,
      SubmissionSystemFileType.supplementary
    );

    mapper.set(MecaFileType.reviewMetadata, null);
    mapper.set(MecaFileType.transferMetadata, null);
    mapper.set(MecaFileType.articleMetadata, null);
    mapper.set(MecaFileType.manifestMetadata, null);

    const submissionSystemFileType = mapper.get(mecaFileType);

    this.logger.info(`Mapping ${mecaFileType} to ${submissionSystemFileType} `);
    return submissionSystemFileType;
  }

  private async addManuscriptDetails(
    request: Manuscript,
    sourceJournal: SourceJournal,
    manuscriptId: string
  ): Promise<void> {
    const phenomArticleTypeId = await this.articleTypeMapper(
      request.articleTypeName
    );

    const autoSaveInput: UpdateDraftManuscriptInput = {
      meta: {
        title: request.title,
        abstract: request.articleAbstract,
        agreeTc: true, //if a manuscript is imported/transferred then the T&Cs are automatically accepted
        conflictOfInterest: request.conflictOfInterest,
        dataAvailability: request.dataAvailability,
        fundingStatement: `${request.founding.founderName} ${request.founding.recipientName} ${request.founding.founderId}`,
        articleTypeId: phenomArticleTypeId,
      },
      authors: [],
      files: [],
      journalId: '03c3c41e-bded-4323-a482-88d805ba35bb',
      sectionId: null,
      preprintValue: request.preprintValue,
      sourceJournalId: sourceJournal.id,
      sourceJournalManuscriptId: request.sourceManuscriptId.toString(),
      linkedSubmissionCustomId: null,
    };
    await this.reviewClient.updateDraftManuscript(manuscriptId, autoSaveInput);
  }

  private async createDraftManuscript(
    destinationJournal: ActiveJournal
  ): Promise<DraftSubmission> {
    const input: CreateDraftManuscriptInput = {
      journalId: destinationJournal.id,
      sectionId: null,
      specialIssueId: null,
      customId: null,
    };
    const draftManuscriptResult =
      await this.reviewClient.createNewDraftSubmission(input);

    if (!draftManuscriptResult) {
      throw new GuardFailure(
        `The draft manuscript for journal with id ${destinationJournal.id} was not found.`
      );
    }

    return draftManuscriptResult;
  }

  private async articleTypeMapper(mecaManuscript: string): Promise<string> {
    const reviewArticleTypes = await this.reviewClient.getArticleTypes();

    if (!reviewArticleTypes) {
      throw new GuardFailure(`Could not retrieve review article types`);
    }


    if (!this.mecaTypes[mecaManuscript]) {
      throw new GuardFailure(
        ` MECA article type not supported: ${mecaManuscript}. Supported types are: ${JSON.stringify(this.mecaTypes)}. `
      );
    }
    const reviewArticleTypeId = reviewArticleTypes.find(
      (rat) => rat.name === this.mecaTypes[mecaManuscript]
    )?.id;

    if (!reviewArticleTypeId) {
      throw new GuardFailure(
        `Unsupported article type found: ${mecaManuscript}. Supported types are: ${this.supportedArticleTypes}. `
      );
    }

    return reviewArticleTypeId;
  }
}

import {
  GuardFailure,
  LoggerBuilder,
  LoggerContract,
  UseCase,
  UseCaseError,
} from '@hindawi/shared';
import {env} from '@hindawi/import-manuscript-validation/env';
import {VError} from 'verror';
import {Manuscript} from '../../models/manuscript';
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
import {MecaFileType} from "@hindawi/import-manuscript-commons";

export enum SubmissionSystemFileType {
  figure = 'figure',
  manuscript = 'manuscript',
  supplementary = 'supplementary',
  coverLetter = 'coverLetter',
  reviewComment = 'reviewComment',
  responseToReviewers = 'responseToReviewers',
}

interface Request {
  manuscript: Manuscript,
  packagePath: string
}

export class SubmitManuscriptUseCase implements UseCase<Request, Promise<string>, null> {
  logger: LoggerContract;

  constructor(private readonly reviewClient: ReviewClientContract) {
    this.logger = new LoggerBuilder('ExtractManuscriptMetadataUseCase', {
      isDevelopment: env.isDevelopment,
      logLevel: env.log.level,
    }).getLogger();
  }

  async execute({manuscript, packagePath}: Request): Promise<string> {
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

    this.logger.info(`Creating draft manuscript into ${destinationJournal.name}`)
    const {manuscriptId, submissionId} = await this.createDraftManuscript(
      destinationJournal
    );
    this.logger.info(`Created manuscriptID: ${manuscriptId} submissionId: ${submissionId}`)

    this.logger.info(`Adding manuscript details for manuscriptID: ${manuscriptId} submissionId: ${submissionId}`)
    await this.addManuscriptDetails(manuscript, sourceJournal, manuscriptId);

    this.logger.info(`Adding authors to manuscriptID: ${manuscriptId} submissionId: ${submissionId}`)
    await this.addAuthorsToManuscript(manuscript, manuscriptId);

    this.logger.info(`Uploading files for manuscriptID: ${manuscriptId} submissionId: ${submissionId}`)
    await this.uploadFiles(manuscript, manuscriptId, packagePath);

    this.logger.info(`Creating submission edit url for manuscriptID: ${manuscriptId} submissionId: ${submissionId}`)
    return `${env.app.reviewAppBasePath}/submit/${submissionId}/${manuscriptId}`;
  }

  private async uploadFiles(request: Manuscript, manuscriptId: string, packagePath: string) {
    for (const file of request.files) {
      const type = this.mapMecaFileTypeToSubmissionSystemFileType(file.type);
      if(type) {
        await this.reviewClient.uploadFile(
          manuscriptId,
          {type: type, size: 1},
          file.path.prefix(packagePath).src
        );
      } else {
        this.logger.debug(`Not uploading ${file.name} as we do not support the ${file.type} file type`);
      }
    }
  }

  private async addAuthorsToManuscript(
    request: Manuscript,
    manuscriptId: string
  ) {
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
    await this.reviewClient.setSubmissionAuthors(manuscriptId, authors);
  }

  private mapMecaFileTypeToSubmissionSystemFileType(mecaFileType: MecaFileType) {
    const mapper: Map<MecaFileType, SubmissionSystemFileType> = new Map<MecaFileType, SubmissionSystemFileType>()

    mapper.set(MecaFileType.coverLetter, SubmissionSystemFileType.coverLetter);
    mapper.set(MecaFileType.manuscript, SubmissionSystemFileType.manuscript);

    mapper.set(MecaFileType.conflictOfInterestStatement, SubmissionSystemFileType.supplementary);
    mapper.set(MecaFileType.supportingInformation, SubmissionSystemFileType.supplementary);
    mapper.set(MecaFileType.reportsAndResponses, SubmissionSystemFileType.supplementary);
    mapper.set(MecaFileType.supplementary, SubmissionSystemFileType.supplementary);

    mapper.set(MecaFileType.reviewMetadata, null);
    mapper.set(MecaFileType.transferMetadata, null);
    mapper.set(MecaFileType.articleMetadata, null);
    mapper.set(MecaFileType.manifestMetadata, null);

    const submissionSystemFileType = mapper.get(mecaFileType);

    this.logger.info(`Mapping ${mecaFileType} to ${submissionSystemFileType} `)
    return submissionSystemFileType
  }

  private async addManuscriptDetails(
    request: Manuscript,
    sourceJournal: SourceJournal,
    manuscriptId: string
  ) {
    const autoSaveInput: UpdateDraftManuscriptInput = {
      meta: {
        title: request.title,
        abstract: request.articleAbstract,
        agreeTc: true, //if a manuscript is imported/transferred then the T&Cs are automatically accepted
        conflictOfInterest: request.conflictOfInterest,
        dataAvailability: request.dataAvailability,
        fundingStatement: `${request.founding.founderName} ${request.founding.recipientName} ${request.founding.founderId}`,
        articleTypeId: request.articleTypeId.toString(),
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
}

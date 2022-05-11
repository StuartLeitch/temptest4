import {GuardFailure, LoggerBuilder, LoggerContract, UseCase, UseCaseError} from "@hindawi/shared";
import {env} from "@hindawi/import-manuscript-validation/env";
import {VError} from "verror";
import {Manuscript} from "../../models/manuscript";
import {AuthorInput, CreateDraftManuscriptInput, ReviewClientContract, UpdateDraftManuscriptInput} from "../../services/contracts/review-client-contract";
import {ActiveJournal, SourceJournal} from "../../models/submission-system-models";

export class ExtractManuscriptMetadataUseCase
  implements UseCase<Manuscript, Promise<string>, null>{

  logger:LoggerContract;

  constructor(private readonly reviewClient: ReviewClientContract) {
    this.logger = new LoggerBuilder('ExtractManuscriptMetadataUseCase', {
      isDevelopment: env.isDevelopment,
      logLevel: env.log.level,
    }).getLogger();

  }

  async execute(request?: Manuscript, context?: null): Promise<string> {
      const sourceJournalName = request.sourceJournal.name;
      const destinationJournalName = request.destinationJournal.name;
      const allSourceJournals = await this.reviewClient.getSourceJournals();

      const sourceJournal = allSourceJournals.find(sj => sj.name === sourceJournalName); //TODO add PISSN and EISSN to review
      if(!sourceJournal){
        throw new GuardFailure(`The source journal ${sourceJournalName} for manuscript ${request.sourceManuscriptId} not found.`);
      }

      const existingJournals = await this.reviewClient.getAllActiveJournals();
      const destinationJournal = existingJournals.find(aj => aj.name === destinationJournalName);
      if(!destinationJournal){
        throw new GuardFailure(`The destination journal ${destinationJournalName} for manuscript ${request.sourceManuscriptId} not found.`);
      }

    const {manuscriptId, submissionId} = await this.createDraftManuscript(destinationJournal);
    await this.addManuscriptDetails(request, sourceJournal, manuscriptId);
    await this.addAuthorsToManuscript(request, manuscriptId);
    await this.uploadFiles(request, manuscriptId);

    return `${this.reviewClient.getRemoteUrl()}/submit/${submissionId}/${manuscriptId}`
  }


  private async uploadFiles(request: Manuscript, manuscriptId: string) {
    for (const file of request.files) {
      await this.reviewClient.uploadFile(manuscriptId, {type: file.type, size: 1}, file.name)
    }
  }

  private async addAuthorsToManuscript(request: Manuscript, manuscriptId: string) {
    const authors: Array<AuthorInput> = request.authors.map((a): AuthorInput => {
      return {
        email: a.email.value,
        givenNames: a.givenName,
        surname: a.surname,
        affRorId: a.affiliationRorId,
        country: a.countryCode,
        isSubmitting: a.isSubmitting,
        isCorresponding: a.isCorresponding,
        aff: a.affiliationName
      }
    })
    await this.reviewClient.setSubmissionAuthors(manuscriptId, authors)
  }

  private async addManuscriptDetails(request: Manuscript, sourceJournal: SourceJournal, manuscriptId: string) {
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
      linkedSubmissionCustomId: null
    };
    await this.reviewClient.updateDraftManuscript(manuscriptId, autoSaveInput)
  }

  private async createDraftManuscript(destinationJournal: ActiveJournal) {
    const input: CreateDraftManuscriptInput = {
      journalId: destinationJournal.id,
      sectionId: null,
      specialIssueId: null,
      customId: null,
    };
    const {manuscriptId, submissionId} = await this.reviewClient.createNewDraftSubmission(input)
    return {manuscriptId, submissionId};
  }
}

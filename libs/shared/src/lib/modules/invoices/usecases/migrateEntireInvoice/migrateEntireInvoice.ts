// * Core Domain
import { flattenEither, AsyncEither } from '../../../../core/logic/AsyncEither';
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize,
} from '../../../../domain/authorization/decorators/Authorize';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

import { PaymentMethodRepoContract } from '../../../payments/repos/paymentMethodRepo';
import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { PaymentRepoContract } from '../../../payments/repos/paymentRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { PaymentStrategy } from '../../../payments/domain/strategies/PaymentStrategy';
import { PaymentFactory } from '../../../payments/domain/strategies/PaymentFactory';
import { PaymentModel } from '../../../payments/domain/contracts/PaymentModel';
import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
import { PaymentMap } from '../../../payments/mapper/Payment';
import { Payment } from '../../../payments/domain/Payment';

import { MigrationPayment } from '../../../payments/domain/strategies/MigrationPayment';
import { Migration } from '../../../payments/domain/strategies/Migration';

import { TransactionId } from '../../../transactions/domain/TransactionId';
import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { AddressId } from '../../../addresses/domain/AddressId';
import { WaiverType } from '../../../waivers/domain/Waiver';
import { Address } from '../../../addresses/domain/Address';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { InvoiceStatus } from '../../domain/Invoice';
import { Payer } from '../../../payers/domain/Payer';
import { InvoiceId } from '../../domain/InvoiceId';
import { Invoice } from '../../domain/Invoice';
import {
  TransactionStatus,
  Transaction,
} from '../../../transactions/domain/Transaction';

import * as PublishInvoiceCreatedErrors from '../publishEvents/publishInvoiceCreated/publishInvoiceCreatedErrors';
import { PublishInvoiceFinalizedUsecase } from '../publishEvents/publishInvoiceFinalized';
import { PublishInvoiceConfirmed } from '../publishEvents/publishInvoiceConfirmed';
import { PublishInvoicePaidUsecase } from '../publishEvents/publishInvoicePaid';
import {
  PublishInvoiceCreatedUsecase,
  PublishInvoiceCreatedDTO,
} from '../publishEvents/publishInvoiceCreated';

import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { GetPaymentsByInvoiceIdUsecase } from '../../../payments/usecases/getPaymentsByInvoiceId';
import { GetPaymentMethodsUseCase } from '../../../payments/usecases/getPaymentMethods';
import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import { CreateAddressRequestDTO } from '../../../addresses/usecases/createAddress/createAddressDTO';
import { CreateAddress } from '../../../addresses/usecases/createAddress/createAddress';
import {
  CreatePayerRequestDTO,
  CreatePayerUsecase,
} from '../../../payers/usecases/createPayer/createPayer';

// * Usecase specific
import { MigrateEntireInvoiceResponse as Response } from './migrateEntireInvoiceResponse';
import { MigrateEntireInvoiceDTO as DTO } from './migrateEntireInvoiceDTO';
import * as Errors from './migrateEntireInvoiceErrors';

import { validateRequest } from './utils';

type Context = AuthorizationContext<Roles>;
export type MigrateEntireInvoiceContext = Context;

export class MigrateEntireInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private sqsPublishService: SQSPublishServiceContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private loggerService: LoggerContract
  ) {
    this.addItemsToInvoice = this.addItemsToInvoice.bind(this);
    this.calculateVatPercentage = this.calculateVatPercentage.bind(this);
    this.confirmInvoice = this.confirmInvoice.bind(this);
    this.createAddress = this.createAddress.bind(this);
    this.createPayer = this.createPayer.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.getInvoiceItemsByInvoiceId = this.getInvoiceItemsByInvoiceId.bind(
      this
    );
    this.getInvoicePaymentInfo = this.getInvoicePaymentInfo.bind(this);
    this.getManuscript = this.getManuscript.bind(this);
    this.getManuscriptWithInvoice = this.getManuscriptWithInvoice.bind(this);
    this.getMigrationPaymentMethod = this.getMigrationPaymentMethod.bind(this);
    this.getPayerByInvoiceId = this.getPayerByInvoiceId.bind(this);
    this.getTransactionDetails = this.getTransactionDetails.bind(this);
    this.getTransactionWithAcceptanceDate = this.getTransactionWithAcceptanceDate.bind(
      this
    );
    this.makeMigrationPayment = this.makeMigrationPayment.bind(this);
    this.saveInvoice = this.saveInvoice.bind(this);
    this.savePayment = this.savePayment.bind(this);
    this.sendInvoiceConfirmedEvent = this.sendInvoiceConfirmedEvent.bind(this);
    this.sendInvoiceCreatedEvent = this.sendInvoiceCreatedEvent.bind(this);
    this.sendInvoicePayedEvent = this.sendInvoicePayedEvent.bind(this);
    this.updateInitialInvoice = this.updateInitialInvoice.bind(this);
    this.updateInvoiceAtQualityPass = this.updateInvoiceAtQualityPass.bind(
      this
    );
    this.updateInvoiceItem = this.updateInvoiceItem.bind(this);
    this.updateInvoicePayed = this.updateInvoicePayed.bind(this);
    this.updateManuscript = this.updateManuscript.bind(this);
    this.updateTransactionDates = this.updateTransactionDates.bind(this);
    this.updateTransactionDetails = this.updateTransactionDetails.bind(this);
    this.updateTransactionStatus = this.updateTransactionStatus.bind(this);
    this.getAddressDetails = this.getAddressDetails.bind(this);
    this.sendInvoiceFinalizedEvent = this.sendInvoiceFinalizedEvent.bind(this);

    this.shouldSendInvoicePayedEvent = this.shouldSendInvoicePayedEvent.bind(
      this
    );
    this.shouldUpdateInvoicePayment = this.shouldUpdateInvoicePayment.bind(
      this
    );
    this.shouldProcessInvoiceCreated = this.shouldProcessInvoiceCreated.bind(
      this
    );
    this.shouldCreatePayer = this.shouldCreatePayer.bind(this);
    this.shouldAddMigrationWaiver = this.shouldAddMigrationWaiver.bind(this);
    this.addMigrationWaiver = this.addMigrationWaiver.bind(this);
    this.markInvoiceAsFinalAfterWaiver = this.markInvoiceAsFinalAfterWaiver.bind(
      this
    );
    this.attachInvoice = this.attachInvoice.bind(this);
    this.shouldSendInvoiceFinalized = this.shouldSendInvoiceFinalized.bind(
      this
    );
    this.getPaymentsByInvoiceId = this.getPaymentsByInvoiceId.bind(this);
    this.getPaymentMethods = this.getPaymentMethods.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const requestExecution = new AsyncEither<null, DTO>(request).then(
      validateRequest
    );

    const maybeRequest = await requestExecution.execute();

    const maybeInitialInvoice = await requestExecution
      .then(this.updateInitialInvoice)
      .then(this.updateTransactionDates)
      .map(() => {
        return;
      })
      .execute();

    const maybeInvoiceCreated = await requestExecution
      .then(async () => maybeInitialInvoice)
      .then(async () => maybeRequest)
      .advanceOrEnd(this.shouldProcessInvoiceCreated)
      .then(this.updateInvoiceAtQualityPass)
      .then(this.getTransactionWithAcceptanceDate)
      .then(this.updateTransactionStatus)
      .then(this.sendInvoiceCreatedEvent)
      .execute();

    const maybeInvoiceConfirmed = await requestExecution
      .then(async () => maybeInvoiceCreated)
      .then(async () => maybeRequest)
      .advanceOrEnd(this.shouldCreatePayer)
      .then(this.createPayer)
      .then(this.confirmInvoice)
      .then(this.sendInvoiceConfirmedEvent)
      .advanceOrEnd(this.shouldAddMigrationWaiver)
      .then(this.addMigrationWaiver(context))
      .then(this.markInvoiceAsFinalAfterWaiver(context))
      .map(() => {
        return;
      })
      .execute();

    const maybeInvoicePayed = await requestExecution
      .then(async () => maybeInvoiceConfirmed)
      .then(async () => maybeRequest)
      .then(this.makeMigrationPayment)
      .advanceOrEnd(this.shouldUpdateInvoicePayment)
      .then(this.updateInvoicePayed)
      .advanceOrEnd(this.shouldSendInvoicePayedEvent)
      .then(this.sendInvoicePayedEvent)
      .map(() => {
        return;
      })
      .execute();

    const maybeInvoiceFinalized = await requestExecution
      .then(async () => maybeInvoiceConfirmed)
      .then(async () => maybeRequest)
      .then(this.attachInvoice(context))
      .advanceOrEnd(this.shouldSendInvoiceFinalized)
      .then(this.sendInvoiceFinalizedEvent(context))
      .map(() => {
        return;
      })
      .execute();

    return flattenEither([
      maybeInvoiceConfirmed,
      maybeInvoiceFinalized,
      maybeInvoiceCreated,
      maybeInitialInvoice,
      maybeInvoicePayed,
    ]).map(() => Result.ok<void>());
  }

  private async getTransactionWithAcceptanceDate(request: DTO) {
    const acceptanceDate = request.acceptanceDate;
    const submissionDate = request.submissionDate;
    const invoiceId = request.invoiceId;

    const transactionExecution = new AsyncEither<null, string>(invoiceId)
      .then((invoiceId) => this.getInvoice(invoiceId))
      .then((invoice) => this.getTransactionDetails(invoice.transactionId))
      .map((transaction) => ({
        acceptanceDate,
        submissionDate,
        transaction,
        invoiceId,
      }));
    return transactionExecution.execute();
  }

  private async getTransactionDetails(
    transactionId: TransactionId
  ): Promise<Either<Errors.TransactionError, Transaction>> {
    const usecase = new GetTransactionUsecase(this.transactionRepo);
    const context = {
      roles: [Roles.ADMIN],
    };
    const response = await usecase.execute(
      {
        transactionId: transactionId.id.toString(),
      },
      context
    );
    if (response.isFailure) {
      const errorMessage = (response.errorValue() as unknown) as string;
      return left(new Errors.TransactionError(errorMessage));
    }
    return right(response.getValue());
  }

  private async updateTransactionStatus(data: {
    transaction: Transaction;
    acceptanceDate: string;
    submissionDate: string;
    invoiceId: string;
  }): Promise<Either<AppError.UnexpectedError, string>> {
    const { acceptanceDate, submissionDate, transaction, invoiceId } = data;

    return await new AsyncEither<null, Transaction>(transaction)
      .map((transaction) => {
        if (transaction.status === TransactionStatus.DRAFT) {
          transaction.props.dateCreated = new Date(submissionDate);
          transaction.props.dateUpdated = new Date(acceptanceDate);
          transaction.props.status = TransactionStatus.ACTIVE;
        }
        return transaction;
      })
      .then((transaction) => this.updateTransactionDetails(transaction))
      .map(() => invoiceId)
      .execute();
  }

  private async updateTransactionDetails(transaction: Transaction) {
    try {
      const result = await this.transactionRepo.update(transaction);
      return right<AppError.UnexpectedError, Transaction>(result);
    } catch (err) {
      return left<AppError.UnexpectedError, Transaction>(
        new AppError.UnexpectedError(err)
      );
    }
  }

  private async updateInitialInvoice(request: DTO) {
    return await new AsyncEither<null, DTO>(request)
      .then((request) => this.getInvoice(request.invoiceId))
      .map((invoice) => {
        invoice.props.dateCreated = new Date(request.submissionDate);
        invoice.props.dateUpdated = new Date(request.submissionDate);

        return invoice;
      })
      .then((invoice) => this.saveInvoice(invoice))
      .execute();
  }

  private async updateTransactionDates(invoice: Invoice) {
    return await new AsyncEither<null, Invoice>(invoice)
      .then((invoice) => this.getTransactionDetails(invoice.transactionId))
      .map((transaction) => {
        if (transaction.status === TransactionStatus.DRAFT) {
          transaction.props.dateCreated = invoice.dateCreated;
          transaction.props.dateUpdated = invoice.props.dateUpdated;
        }

        return transaction;
      })
      .then((transaction) => this.updateTransactionDetails(transaction))
      .execute();
  }

  private async shouldCreatePayer(
    request: DTO
  ): Promise<Either<null, boolean>> {
    if (!request.acceptanceDate || !request.issueDate) {
      return right(false);
    }

    return right(true);
  }

  private async createPayer(request: DTO) {
    const { payer, invoiceId } = request;
    const usecase = new CreatePayerUsecase(this.payerRepo);
    if (!payer) {
      return right<null, { request: DTO; payer: null }>({
        request,
        payer: null,
      });
    }

    const payerExecution = new AsyncEither<null, DTO>(request)
      .then((request) => this.createAddress(request))
      .then((address) => {
        const payerRequest: CreatePayerRequestDTO = {
          vatId: payer.vatRegistrationNumber,
          addressId: address.addressId.id.toString(),
          organization: payer.organization ? payer.organization : ' ',
          invoiceId: invoiceId,
          email: payer.email,
          name: payer.name,
          type: payer.type,
        };
        return usecase.execute(payerRequest);
      })
      .map((result) => result.getValue())
      .map((payer) => ({ payer, request }));
    return payerExecution.execute();
  }

  private async createAddress({ payer: { address } }: DTO) {
    const usecase = new CreateAddress(this.addressRepo);
    const addressRequest: CreateAddressRequestDTO = {
      addressLine1: address.addressLine1,
      country: address.countryCode,
      state: address.state,
      city: address.city,
      postalCode: '',
    };
    const maybeAddress = await usecase.execute(addressRequest);
    return maybeAddress.map((result) => result.getValue());
  }

  private async sendInvoiceCreatedEvent(
    invoiceId: string
  ): Promise<
    Either<
      | AppError.UnexpectedError
      | PublishInvoiceCreatedErrors.InputNotProvidedError,
      void
    >
  > {
    const usecase = new PublishInvoiceCreatedUsecase(this.sqsPublishService);

    const execution = new AsyncEither<null, string>(invoiceId)
      .then((invoiceId) => this.getInvoice(invoiceId))
      .then((invoice) => {
        return this.addItemsToInvoice(invoice);
      })
      .then((invoice) => this.getManuscriptWithInvoice(invoice))
      .map(
        ({ invoice, manuscript }) =>
          ({
            invoiceItems: invoice.invoiceItems.currentItems,
            messageTimestamp: invoice.dateAccepted,
            manuscript,
            invoice,
          } as PublishInvoiceCreatedDTO)
      )
      .then(async (request) => {
        return (await usecase.execute(request)).map((result) =>
          result.getValue()
        );
      });

    return execution.execute();
  }

  private async getInvoice(invoiceId: string) {
    const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const context = {
      roles: [Roles.PAYER],
    };

    const maybeInvoice = await invoiceUsecase.execute({ invoiceId }, context);

    return maybeInvoice.map((result) => result.getValue());
  }

  private async addItemsToInvoice(invoice: Invoice) {
    const itemsUsecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    const maybeItems = await itemsUsecase.execute({
      invoiceId: invoice.id.toString(),
    });
    const maybeInvoiceWithItems = maybeItems.map((result) => {
      for (const item of result.getValue()) {
        invoice.addInvoiceItem(item);
      }
      return invoice;
    });

    return maybeInvoiceWithItems;
  }

  private async getManuscriptWithInvoice(invoice: Invoice) {
    const usecase = new GetManuscriptByInvoiceIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );

    const maybeManuscript = await usecase.execute({
      invoiceId: invoice.id.toString(),
    });

    return maybeManuscript.map((result) => ({
      manuscript: result.getValue()[0],
      invoice,
    }));
  }

  private async saveInvoice(invoice: Invoice) {
    try {
      const result = await this.invoiceRepo.update(invoice);
      return right<Errors.InvoiceSaveFailed, Invoice>(result);
    } catch (err) {
      return left<Errors.InvoiceSaveFailed, Invoice>(
        new Errors.InvoiceSaveFailed(invoice.id.toString(), err)
      );
    }
  }

  private calculateVatPercentage(vatValue: number, total: number) {
    if (!vatValue || !total) {
      return 0;
    }

    const percentage = (vatValue / total) * 100;

    if (!percentage) {
      return 0;
    }

    return percentage;
  }

  private async shouldProcessInvoiceCreated(
    request: DTO
  ): Promise<Either<null, boolean>> {
    if (!request.acceptanceDate) {
      return right(false);
    }

    return right(true);
  }

  private async updateInvoiceAtQualityPass(request: DTO) {
    return new AsyncEither<null, string>(request.invoiceId)
      .then((invoiceId) => this.getInvoice(invoiceId))
      .map((invoice) => {
        if (request.acceptanceDate) {
          const invoiceNumber = Number.parseInt(
            request.apc.invoiceReference,
            10
          ).toString();

          invoice.props.status = InvoiceStatus.DRAFT;
          invoice.props.dateAccepted = new Date(request.acceptanceDate);
          invoice.props.dateUpdated = new Date(request.acceptanceDate);
          invoice.props.invoiceNumber = invoiceNumber;
          invoice.props.charge =
            request.apc.price - request.apc.discount + request.apc.vat;
        }
        return invoice;
      })
      .then((invoice) => this.saveInvoice(invoice))
      .then((invoice) => this.getInvoiceItemsByInvoiceId(invoice.invoiceId))
      .map((items) => {
        items[0].props.price = request.apc.price - request.apc.discount;
        if (items[0].props.price < 0) {
          items[0].props.price = 0;
        }
        const vatPercentage = this.calculateVatPercentage(
          request.apc.vat,
          items[0].props.price
        );
        items[0].props.vat = vatPercentage;

        return items[0];
      })
      .then((item) => this.updateInvoiceItem(item))
      .map(() => request)
      .execute();
  }

  private async updateInvoiceItem(item: InvoiceItem) {
    try {
      const result = await this.invoiceItemRepo.update(item);
      return right<AppError.UnexpectedError, InvoiceItem>(result);
    } catch (err) {
      return left<AppError.UnexpectedError, InvoiceItem>(
        new AppError.UnexpectedError(err)
      );
    }
  }

  private async getInvoiceItemsByInvoiceId(invoiceId: InvoiceId) {
    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    const context = {
      roles: [Roles.PAYER],
    };

    return new AsyncEither(invoiceId.id.toString())
      .then((invoiceId) => usecase.execute({ invoiceId }, context))
      .map((result) => result.getValue())
      .execute();
  }

  private async getPaymentsByInvoiceId(invoiceId: InvoiceId) {
    const usecase = new GetPaymentsByInvoiceIdUsecase(
      this.invoiceRepo,
      this.paymentRepo
    );
    const context = {
      roles: [Roles.PAYER],
    };

    return new AsyncEither(invoiceId.id.toString())
      .then((invoiceId) => usecase.execute({ invoiceId }, context))
      .map((result) => result.getValue())
      .execute();
  }

  private async getPaymentMethods() {
    const usecase = new GetPaymentMethodsUseCase(
      this.paymentMethodRepo,
      this.loggerService
    );
    return new AsyncEither(null)
      .then(() => usecase.execute())
      .map((result) => result.getValue())
      .execute();
  }

  private async confirmInvoice({
    payer,
    request,
  }: {
    payer: Payer;
    request: DTO;
  }) {
    if (!request.acceptanceDate || !request.issueDate) {
      return right<null, { invoice: null; payer: null; request: DTO }>({
        invoice: null,
        payer: null,
        request,
      });
    }
    return new AsyncEither<null, null>(null)
      .then(() => {
        return this.getInvoice(request.invoiceId);
      })
      .map((invoice) => {
        const invoiceNumber = Number.parseInt(
          request.apc.invoiceReference,
          10
        ).toString();
        invoice.props.status = InvoiceStatus.ACTIVE;
        invoice.props.dateAccepted = new Date(request.acceptanceDate);
        invoice.props.dateUpdated = new Date(request.issueDate);
        invoice.props.dateIssued = new Date(request.issueDate);
        invoice.props.erpReference = request.erpReference;
        invoice.props.invoiceNumber = invoiceNumber;
        invoice.payerId = payer ? payer.payerId : null;

        return invoice;
      })
      .then((invoice) => this.saveInvoice(invoice))
      .then(async (invoice) => {
        const maybeManuscript = await this.getManuscript(
          request.apc.manuscriptId
        );
        return maybeManuscript.map((manuscript) => ({ manuscript, invoice }));
      })
      .map(({ invoice, manuscript }) => {
        if (payer) {
          const first = request.payer.name.split(' ')[0];
          const firstName = first.length < 40 ? first : '';
          const surname = request.payer.name.replace(firstName + ' ', '');

          manuscript.props.authorFirstName = firstName;
          manuscript.props.authorSurname = surname;
          manuscript.props.authorEmail = request.payer.email;
          manuscript.props.authorCountry = request.payer.address.countryCode;
        }

        return { invoice, manuscript };
      })
      .then(async ({ invoice, manuscript }) => {
        const maybeSavedManuscript = await this.updateManuscript(manuscript);
        return maybeSavedManuscript.map(() => invoice);
      })
      .map((invoice) => ({ invoice, payer, request }))
      .execute();
  }

  private async getManuscript(customId: string) {
    try {
      const manuscript = await this.manuscriptRepo.findByCustomId(customId);
      return right<AppError.UnexpectedError, Manuscript>(manuscript);
    } catch (err) {
      return left<AppError.UnexpectedError, Manuscript>(
        new AppError.UnexpectedError(err)
      );
    }
  }

  private async updateManuscript(manuscript: Manuscript) {
    try {
      const newManuscript = await this.manuscriptRepo.update(manuscript);
      return right<AppError.UnexpectedError, Manuscript>(newManuscript);
    } catch (err) {
      return left<AppError.UnexpectedError, Manuscript>(
        new AppError.UnexpectedError(err)
      );
    }
  }

  private async sendInvoiceConfirmedEvent({
    invoice,
    request,
    payer,
  }: {
    invoice: Invoice;
    request: DTO;
    payer: Payer;
  }) {
    if (!invoice) {
      return right<null, object>({});
    }

    const usecase = new PublishInvoiceConfirmed(this.sqsPublishService);
    const messageTimestamp = new Date(request.issueDate);

    return new AsyncEither<null, AddressId>(payer?.billingAddressId)
      .then(this.getAddressDetails)
      .then(async (billingAddress) => {
        const maybeResponse = await this.getManuscript(
          request.apc.manuscriptId
        );
        return maybeResponse.map((manuscript) => ({
          manuscript,
          billingAddress,
        }));
      })
      .then(async (data) => {
        const maybeItem = await this.getInvoiceItemsByInvoiceId(
          invoice.invoiceId
        );
        return maybeItem.map((invoiceItems) => ({
          ...data,
          invoiceItems,
        }));
      })
      .then(async ({ billingAddress, manuscript, invoiceItems }) => {
        await usecase.execute(
          invoice,
          invoiceItems,
          manuscript,
          payer,
          billingAddress,
          messageTimestamp
        );
        return right<null, DTO & { invoice: Invoice }>({ ...request, invoice });
      })
      .execute();
  }

  private async getMigrationPaymentMethod() {
    try {
      return right<Errors.MigrationPaymentMethodNotFound, PaymentMethod>(
        await this.paymentMethodRepo.getPaymentMethodByName('Migration')
      );
    } catch (err) {
      return left<Errors.MigrationPaymentMethodNotFound, PaymentMethod>(
        new Errors.MigrationPaymentMethodNotFound()
      );
    }
  }

  private async makeMigrationPayment(request: DTO) {
    if (
      !request.apc.paymentAmount ||
      !request.acceptanceDate ||
      !request.paymentDate ||
      !request.issueDate ||
      !request.payer
    ) {
      return right<null, { payment: null; request: DTO }>({
        request,
        payment: null,
      });
    }

    const migration = new Migration();
    const paymentFactory = new PaymentFactory();
    paymentFactory.registerPayment(migration);
    const paymentStrategy: PaymentStrategy = new PaymentStrategy([
      ['Migration', new MigrationPayment()],
    ]);
    const paymentModel: PaymentModel = paymentFactory.create(
      'MigrationPayment'
    );

    await paymentStrategy.makePayment(paymentModel, request.apc.paymentAmount);

    return new AsyncEither<null, null>(null)
      .then(() => this.getMigrationPaymentMethod())
      .then(async (paymentMethod) => {
        if (!request.payer) {
          return right<null, { paymentMethod: PaymentMethod; payer: null }>({
            paymentMethod,
            payer: null,
          });
        }
        const maybePayer = await this.getPayerByInvoiceId(request.invoiceId);
        return maybePayer.map((payer) => ({ paymentMethod, payer }));
      })
      .then(async ({ paymentMethod, payer }) => {
        const paymentMethodId = paymentMethod.paymentMethodId.id.toString();
        const payerId: string = payer ? payer?.id.toString() : null;
        if (!request.apc.paymentAmount) {
          return right<null, null>(null);
        }
        return right<null, unknown>({
          amount: request.apc.paymentAmount,
          datePaid: request.paymentDate,
          invoiceId: request.invoiceId,
          foreignPaymentId: '',
          paymentMethodId,
          payerId,
        });
      })
      .map((rawPayment) => {
        if (!rawPayment) {
          return null;
        }
        return PaymentMap.toDomain(rawPayment);
      })
      .then((payment) => {
        if (!payment) {
          return Promise.resolve(right<null, null>(null));
        }
        return this.savePayment(payment);
      })
      .map((payment) => ({ payment, request }))
      .execute();
  }

  private async savePayment(payment: Payment) {
    try {
      const result = await this.paymentRepo.save(payment);
      return right<AppError.UnexpectedError, Payment>(result);
    } catch (err) {
      return left<AppError.UnexpectedError, Payment>(
        new AppError.UnexpectedError(err)
      );
    }
  }

  private async getPayerByInvoiceId(id: string) {
    const invoiceId = InvoiceId.create(new UniqueEntityID(id)).getValue();
    try {
      const payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
      return right<AppError.UnexpectedError, Payer>(payer);
    } catch (err) {
      return left<AppError.UnexpectedError, Payer>(
        new AppError.UnexpectedError(err)
      );
    }
  }

  private async shouldUpdateInvoicePayment({
    payment,
    request,
  }: {
    payment: Payment;
    request: DTO;
  }): Promise<Either<null, boolean>> {
    if (!payment && request.apc.price !== request.apc.discount) {
      return right(false);
    }

    return right(true);
  }

  private async updateInvoicePayed({
    payment,
    request,
  }: {
    payment: Payment;
    request: DTO;
  }) {
    if (!payment && request.apc.price !== request.apc.discount) {
      return right<
        null,
        {
          payment: null;
          invoice: null;
          request: DTO;
        }
      >({ invoice: null, payment: null, request });
    }
    return new AsyncEither<null, string>(request.invoiceId)
      .then(this.getInvoice)
      .map((invoice) => {
        invoice.props.status = InvoiceStatus.FINAL;
        invoice.props.dateUpdated = new Date(request.paymentDate);
        invoice.dateMovedToFinal = invoice.props.dateUpdated;

        return invoice;
      })
      .then((invoice) => this.saveInvoice(invoice))
      .map((invoice) => ({ invoice, payment, request }))
      .execute();
  }

  private async getInvoicePaymentInfo(invoiceId: InvoiceId) {
    try {
      const paymentDetails = await this.invoiceRepo.getInvoicePaymentInfo(
        invoiceId
      );
      return right<AppError.UnexpectedError, InvoicePaymentInfo>(
        paymentDetails
      );
    } catch (err) {
      return left<AppError.UnexpectedError, InvoicePaymentInfo>(
        new AppError.UnexpectedError(err)
      );
    }
  }

  private async shouldSendInvoicePayedEvent({
    invoice,
    payment,
    request,
  }: {
    invoice: Invoice;
    payment: Payment;
    request: DTO;
  }): Promise<Either<null, boolean>> {
    if (!invoice) {
      return right(false);
    }

    if (!payment && request.apc.price !== request.apc.discount) {
      return right(false);
    }

    return right(true);
  }

  private async sendInvoicePayedEvent({
    invoice,
    payment,
    request,
  }: {
    invoice: Invoice;
    payment: Payment;
    request: DTO;
  }) {
    const usecase = new PublishInvoicePaidUsecase(this.sqsPublishService);
    const messageTimestamp = request.paymentDate
      ? new Date(request.paymentDate)
      : invoice.dateIssued;

    return new AsyncEither<null, string>(request.apc.manuscriptId)
      .then(async () => {
        const maybeResponse = await this.getManuscript(
          request.apc.manuscriptId
        );

        return maybeResponse;
      })
      .then(async (manuscript) => {
        const maybePaymentInfo = await this.getInvoicePaymentInfo(
          invoice.invoiceId
        );
        return maybePaymentInfo.map((paymentDetails) => ({
          paymentDetails,
          manuscript,
        }));
      })
      .then(async (data) => {
        const maybeInvoice = await this.getInvoiceItemsByInvoiceId(
          invoice.invoiceId
        );
        return maybeInvoice.map((invoiceItems) => ({
          ...data,
          invoiceItems,
        }));
      })
      .then(async (data) => {
        const maybePayer = await this.getPayerByInvoiceId(
          invoice.id.toString()
        );
        return maybePayer.map((payer) => ({ ...data, payer }));
      })
      .then(async (data) => {
        const maybePayments = await this.getPaymentsByInvoiceId(
          invoice.invoiceId
        );
        return maybePayments.map((payments) => ({ ...data, payments }));
      })
      .then(async (data) => {
        const maybePaymentMethods = await this.getPaymentMethods();
        return maybePaymentMethods.map((paymentMethods) => ({
          ...data,
          paymentMethods,
        }));
      })
      .then(async (data) => {
        const aa = await this.getAddressDetails(data.payer.billingAddressId);
        return aa.map((billingAddress) => ({
          ...data,
          billingAddress,
        }));
      })
      .then(
        async ({
          invoiceItems,
          manuscript,
          payer,
          paymentMethods,
          billingAddress,
          payments,
        }) => {
          await usecase.execute({
            messageTimestamp,
            billingAddress,
            paymentMethods,
            invoiceItems,
            manuscript,
            invoice,
            payments,
            payer,
          });
          return right<
            null,
            {
              invoice: Invoice;
              payment: Payment;
              request: DTO;
            }
          >({ request, invoice, payment });
        }
      )
      .execute();
  }

  private async getAddressDetails(id: AddressId) {
    if (!id) {
      return right<null, null>(null);
    }

    const usecase = new GetAddressUseCase(this.addressRepo);
    const maybeAddress = await usecase.execute({
      billingAddressId: id.id.toString(),
    });
    return maybeAddress.map((result) => result.getValue());
  }

  private sendInvoiceFinalizedEvent(context: Context) {
    const usecase = new PublishInvoiceFinalizedUsecase(this.sqsPublishService);

    return async ({ invoice, request }: { invoice: Invoice; request: DTO }) => {
      const execution = new AsyncEither<null, null>(null)
        .then(async () => {
          const maybeManuscript = await this.getManuscript(
            request.apc.manuscriptId
          );
          return maybeManuscript.map((manuscript) => ({ manuscript }));
        })
        .then(async (data) => {
          const maybeInvoiceItems = await this.getInvoiceItemsByInvoiceId(
            invoice.invoiceId
          );

          return maybeInvoiceItems.map((invoiceItems) => ({
            ...data,
            invoiceItems,
          }));
        })
        .then(async (data) => {
          const maybePayer = await this.getPayerByInvoiceId(request.invoiceId);

          return maybePayer.map((payer) => ({ ...data, payer }));
        })
        .then(async (data) => {
          if (!data.payer) {
            return right<
              null,
              {
                invoiceItems: InvoiceItem[];
                payer: Payer;
                manuscript: Manuscript;
                billingAddress: Address;
              }
            >({
              ...data,
              billingAddress: null,
            });
          }
          const maybeAddress = await this.getAddressDetails(
            data.payer.billingAddressId
          );
          return maybeAddress.map((billingAddress) => ({
            ...data,
            billingAddress,
          }));
        })
        .then(async (data) => {
          const maybePayments = await this.getPaymentsByInvoiceId(
            invoice.invoiceId
          );
          return maybePayments.map((payments) => ({ ...data, payments }));
        })
        .then(async (data) => {
          const maybePaymentMethods = await this.getPaymentMethods();
          return maybePaymentMethods.map((paymentMethods) => ({
            ...data,
            paymentMethods,
          }));
        })
        .then(
          async ({
            billingAddress,
            paymentMethods,
            invoiceItems,
            manuscript,
            payments,
            payer,
          }) => {
            const messageTimestamp = new Date(
              request.paymentDate || request.issueDate
            );
            await usecase.execute({
              messageTimestamp,
              billingAddress,
              paymentMethods,
              invoiceItems,
              manuscript,
              invoice,
              payments,
              payer,
            });

            return right<null, DTO>(request);
          }
        );

      return execution.execute();
    };
  }

  private async shouldAddMigrationWaiver({
    status,
  }: DTO & { invoice: Invoice }): Promise<Either<null, boolean>> {
    const WaivedMtsStatus = {
      InvitedContribution: 'InvitedContribution',
      GEWaivedManuscript: 'GEWaivedManuscript',
      FreeSubjectarea: 'FreeSubjectarea',
      WaivedCountry: 'WaivedCountry',
      GrantWaiver: 'GrantWaiver',
      FreePeriod: 'FreePeriod',
      WaivedOnce: 'WaivedOnce',
      FreeTypes: 'FreeTypes',
      NoPolicy: 'NoPolicy',
      Waived: 'Waived',
    };

    if (!(status in WaivedMtsStatus)) {
      return right(false);
    }

    return right(true);
  }

  private markInvoiceAsFinalAfterWaiver(context: Context) {
    return async (request: DTO & { invoice: Invoice }) => {
      const { invoice } = request;

      invoice.status = InvoiceStatus.FINAL;
      invoice.dateMovedToFinal = invoice.dateIssued;

      return new AsyncEither(invoice)
        .then(this.saveInvoice)
        .map(() => request)
        .execute();
    };
  }

  private addMigrationWaiver(context: Context) {
    return async (request: DTO & { invoice: Invoice }) => {
      const uuid = new UniqueEntityID(request.invoiceId);
      const invoiceId = InvoiceId.create(uuid).getValue();

      try {
        this.waiverRepo.attachWaiversToInvoice(
          [WaiverType.WAIVED_MIGRATION],
          invoiceId,
          request.invoice.dateIssued
        );
        return right<Errors.AddingMigrationWaiverError, DTO>(request);
      } catch (e) {
        return left<Errors.AddingMigrationWaiverError, DTO>(
          new Errors.AddingMigrationWaiverError(request.invoiceId, e)
        );
      }
    };
  }

  private async shouldSendInvoiceFinalized({
    invoice,
  }: {
    request: DTO;
    invoice: Invoice;
  }): Promise<Either<null, boolean>> {
    if (invoice.status !== InvoiceStatus.FINAL) {
      return right(false);
    }

    return right(true);
  }

  private attachInvoice(context: Context) {
    return async (request: DTO) => {
      return new AsyncEither(request.invoiceId)
        .then(this.getInvoice)
        .map((invoice) => ({
          request,
          invoice,
        }))
        .execute();
    };
  }
}

// * Core Domain
import { flattenEither, AsyncEither } from '../../../../core/logic/AsyncEither';
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';

// import { PaymentMethodRepoContract } from '../../../payments/repos/paymentMethodRepo';
// import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
// import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
// import { PaymentRepoContract } from '../../../payments/repos/paymentRepo';
// import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
// import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
// import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
// import { PayerRepoContract } from '../../../payers/repos/payerRepo';
// import { InvoiceRepoContract } from '../../repos/invoiceRepo';

// import { PaymentStrategy } from '../../../payments/domain/strategies/PaymentStrategy';
// import { PaymentFactory } from '../../../payments/domain/strategies/PaymentFactory';
// import { PaymentModel } from '../../../payments/domain/contracts/PaymentModel';
// import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
// import { PaymentMap } from '../../../payments/mapper/Payment';
// import { Payment } from '../../../payments/domain/Payment';

// import { MigrationPayment } from '../../../payments/domain/strategies/MigrationPayment';
// import { Migration } from '../../../payments/domain/strategies/Migration';

// import { TransactionId } from '../../../transactions/domain/TransactionId';
// import { InvoicePaymentInfo } from '../../domain/InvoicePaymentInfo';
// import { Manuscript } from '../../../manuscripts/domain/Manuscript';
// import { ManuscriptId } from '../../domain/ManuscriptId';
// import { InvoiceItem } from '../../domain/InvoiceItem';
// import { InvoiceStatus } from '../../domain/Invoice';
// import { Payer } from '../../../payers/domain/Payer';
// import { InvoiceId } from '../../domain/InvoiceId';
// import { Invoice } from '../../domain/Invoice';
// import {
//   STATUS as TransactionStatus,
//   Transaction
// } from '../../../transactions/domain/Transaction';

// import { PublishInvoiceConfirmed } from '../publishInvoiceConfirmed';
// import { PublishInvoicePaid } from '../publishInvoicePaid';
// import {
//   PublishInvoiceCreatedUsecase,
//   PublishInvoiceCreatedDTO
// } from '../publishInvoiceCreated';

// import { GetArticleDetailsUsecase } from '../../../manuscripts/usecases/getArticleDetails/getArticleDetails';
// import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
// import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
// import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
// import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
// import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

// import { CreateAddressRequestDTO } from '../../../addresses/usecases/createAddress/createAddressDTO';
// import { CreateAddress } from '../../../addresses/usecases/createAddress/createAddress';
// import {
//   CreatePayerRequestDTO,
//   CreatePayerUsecase
// } from '../../../payers/usecases/createPayer/createPayer';

// * Usecase specific
import { EpicOnArticlePublishedResponse as Response } from './epicOnArticlePublishedResponse';
import { EpicOnArticlePublishedErrors as Errors } from './epicOnArticlePublishedErrors';
import { EpicOnArticlePublishedDTO as DTO } from './epicOnArticlePublishedDTO';
import {
  MarkManuscriptAsPublishedUsecase,
  MarkManuscriptAsPublishedDTO
} from '../markManuscriptAsPublished';

// import { validateRequest } from './utils';

type Context = AuthorizationContext<Roles>;
export type OnArticlePublishedContext = Context;

export class EpicOnArticlePublishedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    // private paymentMethodRepo: PaymentMethodRepoContract,
    // private sqsPublishService: SQSPublishServiceContract,
    // private invoiceItemRepo: InvoiceItemRepoContract,
    // private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract // private addressRepo: AddressRepoContract, // private invoiceRepo: InvoiceRepoContract, // private paymentRepo: PaymentRepoContract, // private couponRepo: CouponRepoContract, // private waiverRepo: WaiverRepoContract, // private payerRepo: PayerRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { customId, published } = request;

    const requestExecution = new AsyncEither<null, DTO>(request);
    return (
      requestExecution
        .then(() => this.markManuscriptAsPublished(request))
        // .then(autoConfirmInvoiceAtPublication)
        // .then(sendRevenueRecognitionToERP)
        .map(() => {
          console.info('ciubuc!');
          return Result.ok<void>();
        })
        .execute()
    );
  }

  private async markManuscriptAsPublished(request: any) {
    const { customId } = request;
    if (!customId) {
      return right<null, null>(null);
    }

    const { manuscriptRepo } = this;

    const markManuscriptAsPublishedUsecase = new MarkManuscriptAsPublishedUsecase(
      manuscriptRepo
    );
    const context = {
      roles: [Roles.ADMIN]
    };

    const execution = new AsyncEither<null, MarkManuscriptAsPublishedDTO>({
      customId: request.customId,
      publicationDate: request.published
    })
      // .then(invoiceId => this.getInvoice(invoiceId))
      // .then(invoice => {
      //   return this.addItemsToInvoice(invoice);
      // })
      // .then(invoice => this.getManuscriptWithInvoice(invoice))
      // .map(
      //   ({ invoice, manuscript }) =>
      //     ({
      //       invoiceItems: invoice.invoiceItems.currentItems,
      //       messageTimestamp: invoice.dateAccepted,
      //       manuscript,
      //       invoice
      //     } as PublishInvoiceCreatedDTO)
      // )
      .then(async args => {
        return (
          await markManuscriptAsPublishedUsecase.execute(args, context)
        ).map(result => result.getValue());
      });

    return execution.execute();
  }

  // private async getTransactionWithAcceptanceDate(request: DTO) {
  //   if (!request || !request.acceptanceDate) {
  //     return right<null, null>(null);
  //   }

  //   const acceptanceDate = request.acceptanceDate;
  //   const submissionDate = request.submissionDate;
  //   const invoiceId = request.invoiceId;

  //   const transactionExecution = new AsyncEither<null, string>(invoiceId)
  //     .then(invoiceId => this.getInvoice(invoiceId))
  //     .then(invoice => this.getTransactionDetails(invoice.transactionId))
  //     .map(transaction => ({
  //       acceptanceDate,
  //       submissionDate,
  //       transaction,
  //       invoiceId
  //     }));
  //   return transactionExecution.execute();
  // }

  // private async getTransactionDetails(
  //   transactionId: TransactionId
  // ): Promise<Either<Errors.TransactionError, Transaction>> {
  //   const usecase = new GetTransactionUsecase(this.transactionRepo);
  //   const context = {
  //     roles: [Roles.ADMIN]
  //   };
  //   const response = await usecase.execute(
  //     {
  //       transactionId: transactionId.id.toString()
  //     },
  //     context
  //   );
  //   if (response.isFailure) {
  //     const errorMessage = (response.errorValue() as unknown) as string;
  //     return left(new Errors.TransactionError(errorMessage));
  //   }
  //   return right(response.getValue());
  // }

  // private async updateTransactionStatus(data: {
  //   transaction: Transaction;
  //   acceptanceDate: string;
  //   submissionDate: string;
  //   invoiceId: string;
  // }): Promise<Either<AppError.UnexpectedError, string>> {
  //   if (data && data.acceptanceDate) {
  //     const { acceptanceDate, submissionDate, transaction, invoiceId } = data;
  //     return await new AsyncEither<null, Transaction>(transaction)
  //       .map(transaction => {
  //         if (transaction.status === TransactionStatus.DRAFT) {
  //           transaction.props.dateCreated = new Date(submissionDate);
  //           transaction.props.dateUpdated = new Date(acceptanceDate);
  //           transaction.props.status = TransactionStatus.ACTIVE;
  //         }
  //         return transaction;
  //       })
  //       .then(transaction => this.updateTransactionDetails(transaction))
  //       .map(() => invoiceId)
  //       .execute();
  //   }

  //   return right<null, null>(null);
  // }

  // private async updateTransactionDetails(transaction: Transaction) {
  //   try {
  //     const result = await this.transactionRepo.update(transaction);
  //     return right<AppError.UnexpectedError, Transaction>(result);
  //   } catch (err) {
  //     return left<AppError.UnexpectedError, Transaction>(
  //       new AppError.UnexpectedError(err)
  //     );
  //   }
  // }

  // private async updateInitialInvoice(request: DTO) {
  //   return await new AsyncEither<null, DTO>(request)
  //     .then(request => this.getInvoice(request.invoiceId))
  //     .map(invoice => {
  //       invoice.props.dateCreated = new Date(request.submissionDate);
  //       invoice.props.dateUpdated = new Date(request.submissionDate);

  //       return invoice;
  //     })
  //     .then(invoice => this.saveInvoice(invoice))
  //     .execute();
  // }

  // private async updateTransactionDates(invoice: Invoice) {
  //   return await new AsyncEither<null, Invoice>(invoice)
  //     .then(invoice => this.getTransactionDetails(invoice.transactionId))
  //     .map(transaction => {
  //       if (transaction.status === TransactionStatus.DRAFT) {
  //         transaction.props.dateCreated = invoice.dateCreated;
  //         transaction.props.dateUpdated = invoice.props.dateUpdated;
  //       }

  //       return transaction;
  //     })
  //     .then(transaction => this.updateTransactionDetails(transaction))
  //     .execute();
  // }

  // private async createPayer(request: DTO) {
  //   const { payer, invoiceId } = request;
  //   const usecase = new CreatePayerUsecase(this.payerRepo);

  //   if (!payer || !request.acceptanceDate || !request.issueDate) {
  //     return right<null, { request: DTO; payer: null }>({
  //       request,
  //       payer: null
  //     });
  //   }

  //   const payerExecution = new AsyncEither<null, DTO>(request)
  //     .then(request => this.createAddress(request))
  //     .then(address => {
  //       const payerRequest: CreatePayerRequestDTO = {
  //         vatId: payer.vatRegistrationNumber,
  //         addressId: address.addressId.id.toString(),
  //         organization: payer.organization ? payer.organization : ' ',
  //         invoiceId: invoiceId,
  //         email: payer.email,
  //         name: payer.name,
  //         type: payer.type
  //       };
  //       return usecase.execute(payerRequest);
  //     })
  //     .map(result => result.getValue())
  //     .map(payer => ({ payer, request }));
  //   return payerExecution.execute();
  // }

  // private async createAddress({ payer: { address } }: DTO) {
  //   const usecase = new CreateAddress(this.addressRepo);
  //   const addressRequest: CreateAddressRequestDTO = {
  //     addressLine1: address.addressLine1,
  //     country: address.countryCode,
  //     state: address.state,
  //     city: address.city
  //   };
  //   const maybeAddress = await usecase.execute(addressRequest);
  //   return maybeAddress.map(result => result.getValue());
  // }

  // private async sendInvoiceCreatedEvent(invoiceId: string) {
  //   if (!invoiceId) {
  //     return right<null, null>(null);
  //   }

  //   const usecase = new PublishInvoiceCreatedUsecase(this.sqsPublishService);

  //   const execution = new AsyncEither<null, string>(invoiceId)
  //     .then(invoiceId => this.getInvoice(invoiceId))
  //     .then(invoice => {
  //       return this.addItemsToInvoice(invoice);
  //     })
  //     .then(invoice => this.getManuscriptWithInvoice(invoice))
  //     .map(
  //       ({ invoice, manuscript }) =>
  //         ({
  //           invoiceItems: invoice.invoiceItems.currentItems,
  //           messageTimestamp: invoice.dateAccepted,
  //           manuscript,
  //           invoice
  //         } as PublishInvoiceCreatedDTO)
  //     )
  //     .then(async request => {
  //       return (await usecase.execute(request)).map(result =>
  //         result.getValue()
  //       );
  //     });

  //   return execution.execute();
  // }

  // private async getInvoice(invoiceId: string) {
  //   const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
  //   const context = {
  //     roles: [Roles.PAYER]
  //   };

  //   const maybeInvoice = await invoiceUsecase.execute({ invoiceId }, context);

  //   return maybeInvoice.map(result => result.getValue());
  // }

  // private async addItemsToInvoice(invoice: Invoice) {
  //   const itemsUsecase = new GetItemsForInvoiceUsecase(
  //     this.invoiceItemRepo,
  //     this.couponRepo,
  //     this.waiverRepo
  //   );
  //   const maybeItems = await itemsUsecase.execute({
  //     invoiceId: invoice.id.toString()
  //   });
  //   const maybeInvoiceWithItems = maybeItems.map(result => {
  //     for (const item of result.getValue()) {
  //       invoice.addInvoiceItem(item);
  //     }
  //     return invoice;
  //   });

  //   return maybeInvoiceWithItems;
  // }

  // private async getManuscriptWithInvoice(invoice: Invoice) {
  //   const usecase = new GetManuscriptByInvoiceIdUsecase(
  //     this.manuscriptRepo,
  //     this.invoiceItemRepo
  //   );

  //   const maybeManuscript = await usecase.execute({
  //     invoiceId: invoice.id.toString()
  //   });

  //   return maybeManuscript.map(result => ({
  //     manuscript: result.getValue()[0],
  //     invoice
  //   }));
  // }

  // private async saveInvoice(invoice: Invoice) {
  //   try {
  //     const result = await this.invoiceRepo.update(invoice);
  //     return right<Errors.InvoiceSaveFailed, Invoice>(result);
  //   } catch (err) {
  //     return left<Errors.InvoiceSaveFailed, Invoice>(
  //       new Errors.InvoiceSaveFailed(invoice.id.toString(), err)
  //     );
  //   }
  // }

  // private async updateInvoiceAtQualityPass(request: DTO) {
  //   if (!request.acceptanceDate) {
  //     return right<null, null>(null);
  //   }

  //   return new AsyncEither<null, string>(request.invoiceId)
  //     .then(invoiceId => this.getInvoice(invoiceId))
  //     .map(invoice => {
  //       if (request.acceptanceDate) {
  //         invoice.props.dateAccepted = new Date(request.acceptanceDate);
  //         invoice.props.dateUpdated = new Date(request.acceptanceDate);
  //         invoice.props.charge =
  //           request.apc.price - request.apc.discount + request.apc.vat;
  //       }
  //       return invoice;
  //     })
  //     .then(invoice => this.saveInvoice(invoice))
  //     .then(invoice => this.getInvoiceItemsByInvoiceId(invoice.invoiceId))
  //     .map(items => {
  //       items[0].props.price = request.apc.price - request.apc.discount;
  //       const vatPercentage = (request.apc.vat / items[0].props.price) * 100;
  //       items[0].props.vat = vatPercentage;

  //       return items[0];
  //     })
  //     .then(item => this.updateInvoiceItem(item))
  //     .map(() => request)
  //     .execute();
  // }

  // private async updateInvoiceItem(item: InvoiceItem) {
  //   try {
  //     const result = await this.invoiceItemRepo.update(item);
  //     return right<AppError.UnexpectedError, InvoiceItem>(result);
  //   } catch (err) {
  //     return left<AppError.UnexpectedError, InvoiceItem>(
  //       new AppError.UnexpectedError(err)
  //     );
  //   }
  // }

  // private async getInvoiceItemsByInvoiceId(invoiceId: InvoiceId) {
  //   try {
  //     const items = await this.invoiceItemRepo.getItemsByInvoiceId(invoiceId);
  //     return right<AppError.UnexpectedError, InvoiceItem[]>(items);
  //   } catch (err) {
  //     return left<AppError.UnexpectedError, InvoiceItem[]>(
  //       new AppError.UnexpectedError(err)
  //     );
  //   }
  // }

  // private async confirmInvoice(payer: Payer, request: DTO) {
  //   if (!payer) {
  //     return right<null, { invoice: null; payer: null; request: DTO }>({
  //       invoice: null,
  //       payer: null,
  //       request
  //     });
  //   }
  //   return new AsyncEither<null, Payer>(payer)
  //     .then(payer => {
  //       return this.getInvoice(payer.invoiceId.id.toString());
  //     })
  //     .map(invoice => {
  //       const invoiceNumber = Number.parseInt(
  //         request.apc.invoiceReference,
  //         10
  //       ).toString();
  //       invoice.props.status = InvoiceStatus.ACTIVE;
  //       invoice.props.dateAccepted = new Date(request.acceptanceDate);
  //       invoice.props.dateUpdated = new Date(request.issueDate);
  //       invoice.props.dateIssued = new Date(request.issueDate);
  //       invoice.props.erpReference = request.erpReference;
  //       invoice.props.invoiceNumber = invoiceNumber;
  //       invoice.payerId = payer.payerId;

  //       return invoice;
  //     })
  //     .then(invoice => this.saveInvoice(invoice))
  //     .then(async invoice => {
  //       const maybeManuscript = await this.getManuscript(
  //         request.apc.manuscriptId
  //       );
  //       return maybeManuscript.map(manuscript => ({ manuscript, invoice }));
  //     })
  //     .map(({ invoice, manuscript }) => {
  //       console.info('invoice confirm manuscript', manuscript);
  //       manuscript.props.authorFirstName = request.payer.name;
  //       manuscript.props.authorSurname = request.payer.name;
  //       manuscript.props.authorEmail = request.payer.email;
  //       manuscript.props.authorCountry = request.payer.address.countryCode;

  //       return { invoice, manuscript };
  //     })
  //     .then(async ({ invoice, manuscript }) => {
  //       const maybeSavedManuscript = await this.updateManuscript(manuscript);
  //       return maybeSavedManuscript.map(() => invoice);
  //     })
  //     .map(invoice => ({ invoice, payer, request }))
  //     .execute();
  // }

  // private async getManuscript(customId: string) {
  //   try {
  //     const manuscript = await this.manuscriptRepo.findByCustomId(customId);
  //     return right<AppError.UnexpectedError, Manuscript>(manuscript);
  //   } catch (err) {
  //     return left<AppError.UnexpectedError, Manuscript>(
  //       new AppError.UnexpectedError(err)
  //     );
  //   }
  // }

  // private async updateManuscript(manuscript: Manuscript) {
  //   try {
  //     const newManuscript = await this.manuscriptRepo.update(manuscript);
  //     return right<AppError.UnexpectedError, Manuscript>(newManuscript);
  //   } catch (err) {
  //     return left<AppError.UnexpectedError, Manuscript>(
  //       new AppError.UnexpectedError(err)
  //     );
  //   }
  // }

  // private async sendInvoiceConfirmedEvent(
  //   invoice: Invoice,
  //   request: DTO,
  //   payer: Payer
  // ) {
  //   if (!invoice || !payer) {
  //     return right<null, null>(null);
  //   }

  //   const manuscriptUsecase = new GetArticleDetailsUsecase(this.manuscriptRepo);
  //   const usecase = new PublishInvoiceConfirmed(this.sqsPublishService);
  //   const addressUsecase = new GetAddressUseCase(this.addressRepo);
  //   const messageTimestamp = new Date(request.issueDate);
  //   const invoiceItems = invoice.invoiceItems.currentItems;

  //   return new AsyncEither<null, string>(payer.billingAddressId.id.toString())
  //     .then(billingAddressId => addressUsecase.execute({ billingAddressId }))
  //     .map(result => result.getValue())
  //     .then(async billingAddress => {
  //       const maybeResponse = await manuscriptUsecase.execute({
  //         articleId: request.apc.manuscriptId
  //       });
  //       return maybeResponse
  //         .map(response => response.getValue())
  //         .map(manuscript => ({ manuscript, billingAddress }));
  //     })
  //     .then(async ({ billingAddress, manuscript }) => {
  //       const result = await usecase.execute(
  //         invoice,
  //         invoiceItems,
  //         manuscript,
  //         payer,
  //         billingAddress,
  //         messageTimestamp
  //       );
  //       return right<null, void>(result);
  //     })
  //     .execute();
  // }

  // private async getMigrationPaymentMethod() {
  //   try {
  //     return right<Errors.MigrationPaymentMethodNotFound, PaymentMethod>(
  //       await this.paymentMethodRepo.getPaymentMethodByName('Migration')
  //     );
  //   } catch (err) {
  //     return left<Errors.MigrationPaymentMethodNotFound, PaymentMethod>(
  //       new Errors.MigrationPaymentMethodNotFound()
  //     );
  //   }
  // }

  // private async makeMigrationPayment(request: DTO) {
  //   if (
  //     !request.acceptanceDate ||
  //     !request.paymentDate ||
  //     !request.issueDate ||
  //     !request.payer
  //   ) {
  //     return right<null, { payment: null; request: DTO }>({
  //       request,
  //       payment: null
  //     });
  //   }

  //   const migration = new Migration();
  //   const paymentFactory = new PaymentFactory();
  //   paymentFactory.registerPayment(migration);
  //   const paymentStrategy: PaymentStrategy = new PaymentStrategy([
  //     ['Migration', new MigrationPayment()]
  //   ]);
  //   const paymentModel: PaymentModel = paymentFactory.create(
  //     'MigrationPayment'
  //   );

  //   await paymentStrategy.makePayment(paymentModel, request.apc.paymentAmount);

  //   return new AsyncEither<null, null>(null)
  //     .then(() => this.getMigrationPaymentMethod())
  //     .then(async paymentMethod => {
  //       const maybePayer = await this.getPayerByInvoiceId(request.invoiceId);
  //       return maybePayer.map(payer => ({ paymentMethod, payer }));
  //     })
  //     .then(async ({ paymentMethod, payer }) => {
  //       const paymentMethodId = paymentMethod.paymentMethodId.id.toString();
  //       const payerId = payer.id.toString();
  //       return right<null, any>({
  //         amount: request.apc.paymentAmount,
  //         datePaid: request.paymentDate,
  //         invoiceId: request.invoiceId,
  //         foreignPaymentId: '',
  //         paymentMethodId,
  //         payerId
  //       });
  //     })
  //     .map(rawPayment => PaymentMap.toDomain(rawPayment))
  //     .then(payment => this.savePayment(payment))
  //     .map(payment => ({ payment, request }))
  //     .execute();
  // }

  // private async savePayment(payment: Payment) {
  //   try {
  //     const result = await this.paymentRepo.save(payment);
  //     return right<AppError.UnexpectedError, Payment>(result);
  //   } catch (err) {
  //     return left<AppError.UnexpectedError, Payment>(
  //       new AppError.UnexpectedError(err)
  //     );
  //   }
  // }

  // private async getPayerByInvoiceId(id: string) {
  //   const invoiceId = InvoiceId.create(new UniqueEntityID(id)).getValue();
  //   try {
  //     const payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
  //     return right<AppError.UnexpectedError, Payer>(payer);
  //   } catch (err) {
  //     return left<AppError.UnexpectedError, Payer>(
  //       new AppError.UnexpectedError(err)
  //     );
  //   }
  // }

  // private async updateInvoicePayed(payment: Payment, request: DTO) {
  //   if (!payment) {
  //     return right<
  //       null,
  //       {
  //         payment: null;
  //         invoice: null;
  //         request: DTO;
  //       }
  //     >({ invoice: null, payment: null, request });
  //   }
  //   return new AsyncEither<null, Payment>(payment)
  //     .then(payment => this.getInvoice(payment.invoiceId.id.toString()))
  //     .map(invoice => {
  //       invoice.props.status = InvoiceStatus.FINAL;
  //       invoice.props.dateUpdated = new Date(request.paymentDate);

  //       return invoice;
  //     })
  //     .then(invoice => this.saveInvoice(invoice))
  //     .map(invoice => ({ invoice, payment, request }))
  //     .execute();
  // }

  // private async getInvoicePaymentInfo(invoiceId: InvoiceId) {
  //   try {
  //     const paymentDetails = await this.invoiceRepo.getInvoicePaymentInfo(
  //       invoiceId
  //     );
  //     return right<AppError.UnexpectedError, InvoicePaymentInfo>(
  //       paymentDetails
  //     );
  //   } catch (err) {
  //     return left<AppError.UnexpectedError, InvoicePaymentInfo>(
  //       new AppError.UnexpectedError(err)
  //     );
  //   }
  // }

  // private async sendInvoicePayedEvent(
  //   invoice: Invoice,
  //   payment: Payment,
  //   request: DTO
  // ) {
  //   if (!invoice || !payment) {
  //     return right<null, null>(null);
  //   }

  //   const manuscriptUsecase = new GetArticleDetailsUsecase(this.manuscriptRepo);
  //   const usecase = new PublishInvoicePaid(this.sqsPublishService);
  //   const messageTimestamp = new Date(request.paymentDate);
  //   const invoiceItems = invoice.invoiceItems.currentItems;

  //   return new AsyncEither<null, string>(request.apc.manuscriptId)
  //     .map(articleId => ({ articleId }))
  //     .then(request => manuscriptUsecase.execute(request))
  //     .map(result => result.getValue())
  //     .then(async manuscript => {
  //       const maybePaymentInfo = await this.getInvoicePaymentInfo(
  //         invoice.invoiceId
  //       );
  //       return maybePaymentInfo.map(paymentDetails => ({
  //         paymentDetails,
  //         manuscript
  //       }));
  //     })
  //     .then(async ({ paymentDetails, manuscript }) => {
  //       const result = await usecase.execute(
  //         invoice,
  //         invoiceItems,
  //         manuscript,
  //         paymentDetails,
  //         messageTimestamp
  //       );
  //       return right<null, void>(result);
  //     })
  //     .execute();
  // }
}
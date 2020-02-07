// * Core Domain
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither, all, asyncAll } from '../../../../core/logic/AsyncEither';
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

import {
  STATUS as TransactionStatus,
  Transaction
} from '../../../transactions/domain/Transaction';
import { InvoiceStatus } from '../../domain/Invoice';
import { TransactionId } from '../../../transactions/domain/TransactionId';
import { Payer } from '../../../payers/domain/Payer';
import { Invoice } from '../../domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';

import { PublishInvoiceConfirmed } from '../publishInvoiceConfirmed';
import { PublishInvoicePaid } from '../publishInvoicePaid';
import {
  PublishInvoiceCreatedUsecase,
  PublishInvoiceCreatedDTO
} from '../publishInvoiceCreated';

import { GetArticleDetailsUsecase } from '../../../manuscripts/usecases/getArticleDetails/getArticleDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';
import { GetTransactionUsecase } from '../../../transactions/usecases/getTransaction/getTransaction';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import {
  CreatePayerRequestDTO,
  CreatePayerUsecase
} from '../../../payers/usecases/createPayer/createPayer';
import { CreateAddressRequestDTO } from '../../../addresses/usecases/createAddress/createAddressDTO';
import { CreateAddressErrors } from '../../../addresses/usecases/createAddress/createAddressErrors';
import { CreateAddress } from '../../../addresses/usecases/createAddress/createAddress';

// * Usecase specific
import { MigrateEntireInvoiceResponse as Response } from './migrateEntireInvoiceResponse';
import { MigrateEntireInvoiceErrors as Errors } from './migrateEntireInvoiceErrors';
import { MigrateEntireInvoiceDTO as DTO } from './migrateEntireInvoiceDTO';

import { validateRequest } from './utils';
import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
import { InvoiceId } from '../../domain/InvoiceId';

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
    private payerRepo: PayerRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const requestExecution = new AsyncEither<null, DTO>(
      request
    ).chain(request => validateRequest(request));

    const maybeInvoiceCreated = await requestExecution
      .asyncChain(request => this.updateInvoiceAtQualityPass(request))
      .asyncChain(request => this.getTransactionWithAcceptanceDate(request))
      .asyncChain(transaction => this.updateTransactionStatus(transaction))
      .asyncChain(invoiceId => this.sendInvoiceCreatedEvent(invoiceId))
      .execute();

    const maybeInvoiceConfirmed = await requestExecution
      .asyncChain(request => this.createPayer(request))
      .asyncChain(({ request, payer }) => this.confirmInvoice(payer, request))
      .asyncChain(({ request, payer, invoice }) =>
        this.sendInvoiceConfirmedEvent(invoice, request, payer)
      )
      .execute();

    const maybeInvoicePayed = await requestExecution
      .asyncChain(request => this.makeMigrationPayment(request))
      .asyncChain(({ request, payment }) =>
        this.updateInvoicePayed(payment, request)
      )
      .asyncChain(({ request, invoice, payment }) =>
        this.sendInvoicePayedEvent(invoice, payment, request)
      )
      .execute();

    return all([
      maybeInvoiceCreated,
      maybeInvoiceConfirmed,
      maybeInvoicePayed
    ]).map(val => Result.ok<void>());
  }

  private async getTransactionWithAcceptanceDate(request: DTO) {
    const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const acceptanceDate = request.acceptanceDate;
    const submissionDate = request.submissionDate;
    const invoiceId = request.invoiceId;

    const transactionExecution = new AsyncEither<null, string>(invoiceId)
      .map(invoiceId => ({ invoiceId }))
      .asyncChain(invoiceUsecase.execute)
      .map(result => result.getValue())
      .asyncChain(invoice => this.getTransactionDetails(invoice.transactionId))
      .map(transaction => ({
        acceptanceDate,
        submissionDate,
        transaction,
        invoiceId
      }));
    return transactionExecution.execute();
  }

  private async getTransactionDetails(
    transactionId: TransactionId
  ): Promise<Either<Errors.TransactionError, Transaction>> {
    const usecase = new GetTransactionUsecase(this.transactionRepo);
    const response = await usecase.execute({
      transactionId: transactionId.id.toString()
    });
    if (response.isFailure) {
      const errorMessage = (response.errorValue() as unknown) as string;
      return left(new Errors.TransactionError(errorMessage));
    }
    return right(response.getValue());
  }

  private async updateTransactionStatus({
    acceptanceDate,
    submissionDate,
    transaction,
    invoiceId
  }: {
    transaction: Transaction;
    acceptanceDate: string;
    submissionDate: string;
    invoiceId: string;
  }): Promise<Either<AppError.UnexpectedError, string>> {
    if (acceptanceDate) {
      transaction.props.dateCreated = new Date(submissionDate);
      transaction.props.dateUpdated = new Date(acceptanceDate);
      transaction.props.status = TransactionStatus.ACTIVE;

      try {
        await this.transactionRepo.save(transaction);
      } catch (err) {
        return left(new AppError.UnexpectedError(err));
      }
    }

    return right(invoiceId);
  }

  private async createPayer(request: DTO) {
    const { payer, invoiceId } = request;
    const usecase = new CreatePayerUsecase(this.payerRepo);

    if (!payer || !request.acceptanceDate || !request.issueDate) {
      return right<null, { request: DTO; payer: null }>({
        request,
        payer: null
      });
    }

    const payerExecution = new AsyncEither<null, DTO>(request)
      .asyncChain(request => this.createAddress(request))
      .asyncChain(address => {
        const payerRequest: CreatePayerRequestDTO = {
          vatId: payer.vatRegistrationNumber,
          addressId: address.addressId.id.toString(),
          invoiceId: invoiceId,
          name: payer.name,
          type: payer.type
        };
        return usecase.execute(payerRequest);
      })
      .map(result => result.getValue())
      .map(payer => ({ payer, request }));
    return payerExecution.execute();
  }

  private async createAddress({ payer: { address } }: DTO) {
    const usecase = new CreateAddress(this.addressRepo);
    const addressRequest: CreateAddressRequestDTO = {
      addressLine1: address.addressLine1,
      postalCode: address.postalCode,
      country: address.countryCode,
      state: address.state,
      city: address.city
    };
    const maybeAddress = await usecase.execute(addressRequest);
    return maybeAddress.map(result => result.getValue());
  }

  private async sendInvoiceCreatedEvent(invoiceId: string) {
    const usecase = new PublishInvoiceCreatedUsecase(this.sqsPublishService);

    const execution = new AsyncEither<null, string>(invoiceId)
      .asyncChain(invoiceId => this.getInvoice(invoiceId))
      .asyncChain(invoice => this.addItemsToInvoice(invoice))
      .asyncChain(invoice => this.getManuscriptWithInvoice(invoice))
      .map(
        ({ invoice, manuscript }) =>
          ({
            invoiceItems: invoice.invoiceItems.currentItems,
            messageTimestamp: invoice.dateAccepted,
            manuscript,
            invoice
          } as PublishInvoiceCreatedDTO)
      )
      .asyncChain(async request => {
        return (await usecase.execute(request)).map(result =>
          result.getValue()
        );
      });

    return execution.execute();
  }

  private async getInvoice(invoiceId: string) {
    const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

    return (await invoiceUsecase.execute({ invoiceId })).map(result =>
      result.getValue()
    );
  }

  private async addItemsToInvoice(invoice: Invoice) {
    const itemsUsecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );

    const maybeItems = await itemsUsecase.execute({
      invoiceId: invoice.id.toString()
    });
    const maybeInvoiceWithItems = maybeItems.map(result => {
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

    return (
      await usecase.execute({ invoiceId: invoice.id.toString() })
    ).map(result => ({ manuscript: result.getValue()[0], invoice }));
  }

  private async updateInvoiceAtQualityPass(request: DTO) {
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

    return new AsyncEither<null, string>(request.invoiceId)
      .map(invoiceId => ({ invoiceId }))
      .asyncChain(usecaseRequest => usecase.execute(usecaseRequest))
      .map(response => response.getValue())
      .asyncMap(async invoice => {
        if (!request.acceptanceDate) {
          return invoice;
        }

        invoice.props.dateAccepted = new Date(request.acceptanceDate);
        invoice.props.dateCreated = new Date(request.submissionDate);
        invoice.props.dateUpdated = new Date(request.acceptanceDate);

        return this.invoiceRepo.save(invoice);
      })
      .map(() => request)
      .execute();
  }

  private async confirmInvoice(payer: Payer, request: DTO) {
    if (!payer) {
      return right<null, { invoice: null; payer: null; request: DTO }>({
        invoice: null,
        payer: null,
        request
      });
    }
    return new AsyncEither<null, Payer>(payer)
      .asyncChain(payer => {
        return this.getInvoice(payer.invoiceId.id.toString());
      })
      .asyncMap(invoice => {
        invoice.props.status = InvoiceStatus.ACTIVE;
        invoice.props.dateAccepted = new Date(request.acceptanceDate);
        invoice.props.dateUpdated = new Date(request.acceptanceDate);
        invoice.props.erpReference = request.erpReference;

        return this.invoiceRepo.save(invoice);
      })
      .map(invoice => ({ invoice, payer, request }))
      .execute();
  }

  private async sendInvoiceConfirmedEvent(
    invoice: Invoice,
    request: DTO,
    payer: Payer
  ) {
    const manuscriptUsecase = new GetArticleDetailsUsecase(this.manuscriptRepo);
    const usecase = new PublishInvoiceConfirmed(this.sqsPublishService);
    const addressUsecase = new GetAddressUseCase(this.addressRepo);
    const messageTimestamp = new Date(request.issueDate);

    const invoiceItems = invoice.invoiceItems.currentItems;

    if (!invoice || !payer) {
      return right<null, null>(null);
    }

    return new AsyncEither<null, string>(payer.billingAddressId.id.toString())
      .asyncChain(billingAddressId =>
        addressUsecase.execute({ billingAddressId })
      )
      .map(result => result.getValue())
      .asyncChain(async billingAddress => {
        const maybeResponse = await manuscriptUsecase.execute({
          articleId: request.apc.manuscriptId
        });
        return maybeResponse
          .map(response => response.getValue())
          .map(manuscript => ({ manuscript, billingAddress }));
      })
      .asyncMap(({ billingAddress, manuscript }) => {
        return usecase.execute(
          invoice,
          invoiceItems,
          manuscript,
          payer,
          billingAddress,
          messageTimestamp
        );
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
      !request.acceptanceDate ||
      !request.paymentDate ||
      !request.issueDate ||
      !request.payer
    ) {
      return right<null, { payment: null; request: DTO }>({
        request,
        payment: null
      });
    }

    const migration = new Migration();
    const paymentFactory = new PaymentFactory();
    paymentFactory.registerPayment(migration);
    const paymentStrategy: PaymentStrategy = new PaymentStrategy([
      ['Migration', new MigrationPayment()]
    ]);
    const paymentModel: PaymentModel = paymentFactory.create(
      'MigrationPayment'
    );

    await paymentStrategy.makePayment(paymentModel, request.apc.paymentAmount);

    return new AsyncEither<null, null>(null)
      .asyncChain(() => this.getMigrationPaymentMethod())
      .asyncMap(async paymentMethod => {
        const paymentMethodId = paymentMethod.paymentMethodId.id.toString();
        const invoiceIdObj = InvoiceId.create(
          new UniqueEntityID(request.invoiceId)
        ).getValue();
        const payer = await this.payerRepo.getPayerByInvoiceId(invoiceIdObj);
        const payerId = payer.id.toString();
        return {
          amount: request.apc.paymentAmount,
          datePaid: request.paymentDate,
          invoiceId: request.invoiceId,
          foreignPaymentId: '',
          paymentMethodId,
          payerId
        };
      })
      .map(rawPayment => PaymentMap.toDomain(rawPayment))
      .asyncMap(payment => this.paymentRepo.save(payment))
      .map(payment => ({ payment, request }))
      .execute();
  }

  private async updateInvoicePayed(payment: Payment, request: DTO) {
    if (!payment) {
      return right<
        null,
        {
          payment: null;
          invoice: null;
          request: DTO;
        }
      >({ invoice: null, payment: null, request });
    }
    return new AsyncEither<null, Payment>(payment)
      .asyncChain(payment => this.getInvoice(payment.invoiceId.id.toString()))
      .asyncMap(invoice => {
        invoice.props.status = InvoiceStatus.FINAL;
        invoice.props.dateUpdated = new Date(request.paymentDate);

        return this.invoiceRepo.save(invoice);
      })
      .map(invoice => ({ invoice, payment, request }))
      .execute();
  }

  private async sendInvoicePayedEvent(
    invoice: Invoice,
    payment: Payment,
    request: DTO
  ) {
    if (!invoice || !payment) {
      return right<null, null>(null);
    }

    const manuscriptUsecase = new GetArticleDetailsUsecase(this.manuscriptRepo);
    const usecase = new PublishInvoicePaid(this.sqsPublishService);
    const messageTimestamp = new Date(request.paymentDate);
    const invoiceItems = invoice.invoiceItems.currentItems;
    const paymentDetails = await this.invoiceRepo.getInvoicePaymentInfo(
      invoice.invoiceId
    );

    return new AsyncEither<null, string>(request.apc.manuscriptId)
      .map(articleId => ({ articleId }))
      .asyncChain(request => manuscriptUsecase.execute(request))
      .map(result => result.getValue())
      .asyncMap(manuscript =>
        usecase.execute(
          invoice,
          invoiceItems,
          manuscript,
          paymentDetails,
          messageTimestamp
        )
      )
      .execute();
  }
}

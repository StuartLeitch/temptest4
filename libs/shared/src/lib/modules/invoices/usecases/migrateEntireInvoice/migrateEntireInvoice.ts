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

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import {
  STATUS as TransactionStatus,
  Transaction
} from '../../../transactions/domain/Transaction';
import { InvoiceStatus } from '../../domain/Invoice';
import { TransactionId } from '../../../transactions/domain/TransactionId';
import { Payer } from '../../../payers/domain/Payer';
import { Invoice } from '../../domain/Invoice';
import { Address } from '../../../addresses/domain/Address';

import {
  PublishInvoiceCreatedUsecase,
  PublishInvoiceCreatedDTO
} from '../publishInvoiceCreated';
import { PublishInvoiceConfirmed } from '../publishInvoiceConfirmed';
import { PublishInvoicePaid } from '../publishInvoicePaid';

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

type Context = AuthorizationContext<Roles>;
export type MigrateEntireInvoiceContext = Context;

export class MigrateEntireInvoiceUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sqsPublishService: SQSPublishServiceContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
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

    const maybeTransaction = await requestExecution
      .asyncChain(this.getTransactionWithAcceptanceDate.bind(this))
      .asyncChain(this.updateTransactionStatus.bind(this))
      .execute();
    // const maybeTransaction = await transactionExecution.execute();

    const maybePayer = await requestExecution
      .asyncChain(this.createPayer.bind(this))
      .execute();

    return null;
  }

  private async getTransactionWithAcceptanceDate(request: DTO) {
    const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const acceptanceDate = request.acceptanceDate;
    const invoiceId = request.payer.invoiceId;

    const transactionExecution = new AsyncEither<null, string>(invoiceId)
      .map(invoiceId => ({ invoiceId }))
      .asyncChain(invoiceUsecase.execute)
      .map(result => result.getValue())
      .asyncChain(invoice => this.getTransactionDetails(invoice.transactionId))
      .map(transaction => ({ transaction, acceptanceDate: acceptanceDate }));
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
    transaction
  }: {
    acceptanceDate: string;
    transaction: Transaction;
  }): Promise<Either<AppError.UnexpectedError, Transaction>> {
    if (acceptanceDate) {
      transaction.props.dateUpdated = new Date(acceptanceDate);
      transaction.props.status = TransactionStatus.ACTIVE;

      try {
        const newTransaction = await this.transactionRepo.save(transaction);
        return right(newTransaction);
      } catch (err) {
        return left(new AppError.UnexpectedError(err));
      }
    }

    return right(transaction);
  }

  private async createPayer(request: DTO) {
    const { payer } = request;
    const usecase = new CreatePayerUsecase(this.payerRepo);

    if (!payer || !request.acceptanceDate || !request.issueDate) {
      return right<
        CreateAddressErrors.InvalidPostalCode | AppError.UnexpectedError,
        Payer
      >(null);
    }

    const payerExecution = new AsyncEither<null, DTO>(request)
      .asyncChain(request => this.createAddress(request))
      .asyncChain(address => {
        const payerRequest: CreatePayerRequestDTO = {
          vatId: payer.vatRegistrationNumber,
          addressId: address.addressId.id.toString(),
          invoiceId: payer.invoiceId,
          name: payer.name,
          type: payer.type
        };
        return usecase.execute(payerRequest);
      })
      .map(result => result.getValue());
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
    const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

    const a = new AsyncEither<null, string>(invoiceId)
      .map(invoiceId => ({ invoiceId }))
      .asyncChain(invoiceUsecase.execute)
      .map(result => result.getValue())
      .asyncChain(this.addItemsToInvoice.bind(this));

    const usecase = new PublishInvoiceCreatedUsecase(this.sqsPublishService);
    const request: PublishInvoiceCreatedDTO = {
      invoiceItems: null,
      manuscript: null,
      invoice: null
    };
    usecase.execute(request);
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
    });

    return maybeInvoiceWithItems;
  }

  private async getManuscript(invoiceId: string) {
    const usecase = new GetManuscriptByInvoiceIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );

    return (await usecase.execute({ invoiceId })).map(
      result => result.getValue()[0]
    );
  }
}

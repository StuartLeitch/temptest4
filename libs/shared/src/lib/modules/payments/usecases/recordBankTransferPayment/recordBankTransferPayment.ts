/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { left } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  Roles,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import {
  InvoiceRepoContract,
  InvoiceItemRepoContract,
} from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';

import { RecordBankTransferPaymentResponse } from './recordBankTransferPaymentResponse';
import { RecordBankTransferPaymentErrors } from './recordBankTransferPaymentErrors';
import { RecordBankTransferPaymentDTO } from './recordBankTransferPaymentDTO';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';

import { BankTransfer } from './../../domain/strategies/BankTransfer';
import { BankTransferPayment } from './../../domain/strategies/BankTransferPayment';
import { PaymentFactory } from './../../domain/strategies/PaymentFactory';
import { PaymentModel } from './../../domain/contracts/PaymentModel';
import { PaymentStrategy } from './../../domain/strategies/PaymentStrategy';
import { RecordPaymentUsecase } from '../recordPayment';
import { ArticleRepoContract } from '../../../manuscripts/repos';

export class RecordBankTransferPaymentUsecase
  implements
    UseCase<
      RecordBankTransferPaymentDTO,
      Promise<RecordBankTransferPaymentResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      RecordBankTransferPaymentDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract
  ) {}

  public async execute(
    request: RecordBankTransferPaymentDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<RecordBankTransferPaymentResponse> {
    const getInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(
      this.invoiceRepo
    );
    const invoiceDetailsResult = await getInvoiceDetailsUsecase.execute(
      {
        invoiceId: request.invoiceId,
      },
      {
        roles: [Roles.PAYER],
      }
    );
    if (invoiceDetailsResult.isLeft()) {
      return left(
        new RecordBankTransferPaymentErrors.PaymentError(
          `Invalid invoice id {${request.invoiceId}}`
        )
      );
    }
    const invoiceDetails = invoiceDetailsResult.value.getValue();

    const getManuscriptsByInvoiceIdUsecase = new GetManuscriptByInvoiceIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );
    const maybeManuscripts = await getManuscriptsByInvoiceIdUsecase.execute({
      invoiceId: request.invoiceId,
    });
    if (maybeManuscripts.isLeft()) {
      return maybeManuscripts as any;
    }
    const manuscripts = maybeManuscripts.value.getValue();

    const bankTransfer = new BankTransfer();
    const paymentFactory = new PaymentFactory();
    paymentFactory.registerPayment(bankTransfer);
    const paymentStrategy: PaymentStrategy = new PaymentStrategy([
      ['BankTransfer', new BankTransferPayment()],
    ]);
    const paymentModel: PaymentModel = paymentFactory.create(
      'BankTransferPayment'
    );

    const payload = {
      ...request,
      foreignPaymentId: request.paymentReference,
    };

    // const usecase = new RecordPaymentUsecase(
    //   this.paymentRepo,
    //   this.invoiceRepo
    // );

    // return await usecase.execute(payload);

    return null;
  }
}

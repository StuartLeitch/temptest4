import { MockPaymentMethodRepo } from '../../../payments/repos/mocks/mockPaymentMethodRepo';
import { MockTransactionRepo } from '../../../transactions/repos/mocks/mockTransactionRepo';
import { MockArticleRepo } from '../../../manuscripts/repos/mocks/mockArticleRepo';
import { MockInvoiceItemRepo } from '../../repos/mocks/mockInvoiceItemRepo';
import { MockInvoiceRepo } from '../../repos/mocks/mockInvoiceRepo';

import { TransactionId } from '../../../transactions/domain/TransactionId';
import { InvoiceItem, InvoiceItemProps } from '../../domain/InvoiceItem';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { PaymentMethod } from '../../../payments/domain/PaymentMethod';
import { Article } from '../../../manuscripts/domain/Article';
import { Invoice, InvoiceStatus } from '../../domain/Invoice';
import { ManuscriptId } from '../../domain/ManuscriptId';
import { InvoiceId } from '../../domain/InvoiceId';
import {
  STATUS as TransactionStatus,
  Transaction,
} from '../../../transactions/domain/Transaction';

export function addTransactions(transactionRepo: MockTransactionRepo) {
  const transactionsProps = [
    {
      status: TransactionStatus.DRAFT,
      id: '1',
    },
    {
      status: TransactionStatus.DRAFT,
      id: '2',
    },
    {
      status: TransactionStatus.DRAFT,
      id: '3',
    },
  ];

  for (const props of transactionsProps) {
    const transaction = Transaction.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    transactionRepo.addMockItem(transaction);
  }
}

export function addInvoices(invoicesRepo: MockInvoiceRepo) {
  const invoicesProps = [
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 0,
      id: '1',
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('2')),
      charge: 0,
      id: '2',
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('3')),
      charge: 0,
      id: '3',
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('3')),
      charge: 0,
      id: '4',
    },
  ];

  for (const props of invoicesProps) {
    const invoice = Invoice.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    invoicesRepo.addMockItem(invoice);
  }
}

export function addInvoiceItems(invoiceItemRepo: MockInvoiceItemRepo) {
  interface InvoiceItemsPropsWithId extends InvoiceItemProps {
    id: string;
  }

  const invoiceItemsProps: InvoiceItemsPropsWithId[] = [
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('1')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('1')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '1',
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('2')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('2')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '2',
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('3')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('3')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '3',
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('4')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('4')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '4',
    },
  ];

  for (const props of invoiceItemsProps) {
    const invoiceItem = InvoiceItem.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    invoiceItemRepo.addMockItem(invoiceItem);
  }
}

export function addManuscripts(manuscriptRepo: MockArticleRepo) {
  const manuscriptsProps = [
    {
      journalId: '1',
      customId: '1',
      title: 'Test 1',
      articleType: '1',
      created: new Date(),
      id: '1',
    },
    {
      journalId: '2',
      customId: '2',
      title: 'Test 2',
      articleType: '2',
      created: new Date(),
      id: '2',
    },
    {
      journalId: '3',
      customId: '3',
      title: 'Test 3',
      articleType: '3',
      created: new Date(),
      id: '3',
    },
    {
      journalId: '4',
      customId: '4',
      title: 'Test 4',
      articleType: '4',
      created: new Date(),
      id: '4',
    },
  ];

  for (const props of manuscriptsProps) {
    const manuscript = Article.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    manuscriptRepo.addMockItem(manuscript);
  }
}

export function addPaymentMethods(paymentMethodRepo: MockPaymentMethodRepo) {
  const paymentMethodsProps = [
    {
      name: 'Migration',
      isActive: true,
    },
  ];

  for (const props of paymentMethodsProps) {
    const paymentMethod = PaymentMethod.create(props).getValue();
    paymentMethodRepo.addMockItem(paymentMethod);
  }
}

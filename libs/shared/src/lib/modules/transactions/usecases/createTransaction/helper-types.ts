import { CatalogItem } from './../../../journals/domain/CatalogItem';
import { InvoiceItem } from './../../../invoices/domain/InvoiceItem';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Invoice } from './../../../invoices/domain/Invoice';
import { Transaction } from '../../domain/Transaction';

export interface WithTransaction {
  transaction: Transaction;
}

export interface WithManuscript {
  manuscript: Manuscript;
}

export interface WithInvoice {
  invoice: Invoice;
}

export interface WithManuscriptId {
  manuscriptId: string;
}

export interface WithJournalId {
  journalId: string;
}

export interface WithJournal {
  journal: CatalogItem;
}

export interface WithInvoiceItem {
  invoiceItem: InvoiceItem;
}

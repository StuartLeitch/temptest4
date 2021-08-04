export const CREDIT_NOTES_QUERY = `
query fetchCreditNotes(
  $filters: InvoiceFilters,
  $pagination: Pagination
) {
  getRecentCreditNotes(
    filters: $filters
    pagination: $pagination
  ) {
    totalCount
    creditNotes {
      ...creditNoteFragment
    }
  }
}

fragment creditNoteFragment on CreditNote {
  id
  invoiceId
  creationReason
  vat
  price
  persistentReferenceNumber
  dateCreated
  dateIssued
  dateUpdated
}
`;

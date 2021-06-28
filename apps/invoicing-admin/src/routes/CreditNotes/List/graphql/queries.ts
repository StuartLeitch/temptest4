// export const INVOICES_QUERY = `
// query fetchInvoices(
//   $filters: InvoiceFilters,
//   $pagination: Pagination
// ) {
//   invoices(
//     filters: $filters
//     pagination: $pagination
//   ) {
//     totalCount
//     invoices {
//       ...invoiceFragment
//     }
//   }
// }
// fragment invoiceFragment on Invoice {
//   id: invoiceId
//   status
//   dateCreated
//   dateIssued
//   dateAccepted
//   referenceNumber
//   cancelledInvoiceReference
//   payer {
//     ...payerFragment
//   }
//   invoiceItem {
//     id
//     price
//     rate
//     vat
//     vatnote
//     dateCreated
//     coupons {
//       ...couponFragment
//     }
//     waivers {
//       ...waiverFragment
//     }
//     article {
//       ...articleFragment
//     }
//   }
//   creditNote {
//     ...creditNoteFragment
//   }
// }
// fragment payerFragment on Payer {
//   id
//   type
//   name
//   email
//   vatId
//   organization
//   address {
//     ...addressFragment
//   }
// }
// fragment addressFragment on Address {
//   city
//   country
//   state
//   postalCode
//   addressLine1
// }
// fragment couponFragment on Coupon {
//   code
//   reduction
// }
// fragment waiverFragment on Waiver {
//   reduction
//   type_id
// }
// fragment articleFragment on Article {
//   id
//   title
//   created
//   articleType
//   authorCountry
//   authorEmail
//   customId
//   journalTitle
//   authorSurname
//   authorFirstName
//   journalTitle
// }
// fragment creditNoteFragment on CreditNote {
//   invoiceId
//   dateCreated

// }
// `;

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
  id,
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

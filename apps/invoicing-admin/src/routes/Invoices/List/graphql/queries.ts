export const INVOICES_QUERY = `
query fetchInvoices(
  $filters: InvoiceFilters,
  $pagination: Pagination
) {
  invoices(
    filters: $filters
    pagination: $pagination
  ) {
    totalCount
    invoices {
      ...invoiceFragment
    }
  }
}
fragment invoiceFragment on Invoice {
  id: invoiceId
  status
  dateCreated
  dateIssued
  dateAccepted
  referenceNumber
  totalPrice
  vatAmount
  netCharges
  payer {
    ...payerFragment
  }
  invoiceItem {
    id
    price
    rate
    vat
    vatnote
    dateCreated
    taDiscount
    coupons {
      ...couponFragment
    }
    waivers {
      ...waiverFragment
    }
    article {
      ...articleFragment
    }
  }
}
fragment payerFragment on Payer {
  id
  type
  name
  email
  vatId
  organization
  address {
    ...addressFragment
  }
}
fragment addressFragment on Address {
  city
  country
  state
  postalCode
  addressLine1
}
fragment couponFragment on Coupon {
  code
  reduction
}
fragment waiverFragment on Waiver {
  reduction
  type_id
}
fragment articleFragment on InvoicingArticle {
  id
  title
  created
  articleType
  authorCountry
  authorEmail
  customId
  journalTitle
  authorSurname
  authorFirstName
  journalTitle
}
`;

export const INVOICES_AND_CREDIT_NOTES_QUERY = `
query search(
  $filters: InvoiceFilters,
  $pagination: Pagination
) {
  invoices(
    filters: $filters
    pagination: $pagination
  ) {
    totalCount
    invoices {
      ...invoiceFragment
    }
  }
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
fragment invoiceFragment on Invoice {
  id: invoiceId
  status
  dateCreated
  dateIssued
  dateAccepted
  referenceNumber
  totalPrice
  payer {
    ...payerFragment
  }
  invoiceItem {
    id
    price
    rate
    vat
    vatnote
    taDiscount
    dateCreated
    coupons {
      ...couponFragment
    }
    waivers {
      ...waiverFragment
    }
    article {
      ...articleFragment
    }
  }
}
fragment payerFragment on Payer {
  id
  type
  name
  email
  vatId
  organization
  address {
    ...addressFragment
  }
}
fragment addressFragment on Address {
  city
  country
  state
  postalCode
  addressLine1
}
fragment couponFragment on Coupon {
  code
  reduction
}
fragment waiverFragment on Waiver {
  reduction
  type_id
}
fragment articleFragment on InvoicingArticle {
  id
  title
  created
  articleType
  authorCountry
  authorEmail
  customId
  journalTitle
  authorSurname
  authorFirstName
  journalTitle
}
fragment creditNoteFragment on CreditNote {
  id
  invoiceId
  price
  dateCreated
  dateIssued
  dateUpdated
  persistentReferenceNumber
  creationReason
  totalPrice
  invoice {
    invoiceItem {
      id
      type
      vat
      price
      coupons {
       reduction
      }
      waivers {
       reduction
      }
      article {
       customId
      }
    }
  }
}
`;

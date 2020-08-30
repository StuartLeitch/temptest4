export const INVOICE_QUERY = `
  query invoice($id: ID) {
    invoice(invoiceId: $id) {
      ...invoiceFragment
    }
    getPaymentMethods {
      ...paymentMethodFragment
    }
  }
  fragment invoiceFragment on Invoice {
    id: invoiceId
    status
    dateCreated
    dateIssued
    dateAccepted
    dateMovedToFinal
    referenceNumber
    erpReference
    revenueRecognitionReference
    cancelledInvoiceReference
    transaction {
      ...transactionFragment
    }
    payer {
      ...payerFragment
    }
    payments {
      ...paymentFragment
    }
    invoiceItem {
      id
      price
      type
      rate
      vat
      vatnote
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
    creditNote {
      ...creditNoteFragment
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
  fragment paymentFragment on Payment {
    id
    status
    foreignPaymentId
    amount
    datePaid
    paymentMethod {
      ...paymentMethodFragment
    }
  }
  fragment paymentMethodFragment on PaymentMethod {
    id
    name
    isActive
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
  fragment articleFragment on Article {
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
    datePublished
    arxivId
  }
  fragment creditNoteFragment on Invoice {
    invoiceId
    dateCreated
    cancelledInvoiceReference
    referenceNumber
  }
  fragment transactionFragment on Transaction {
    id
    status
  }
`;

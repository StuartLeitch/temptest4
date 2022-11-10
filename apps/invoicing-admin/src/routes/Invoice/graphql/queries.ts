export const INVOICE_QUERY = `
  query invoice($id: ID) {
    invoiceWithAuthorization(invoiceId: $id) {
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
    erpReferences {
      ...erpReferenceFragment
    }
    revenueRecognitionReference
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
      taDiscount
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
  fragment creditNoteFragment on CreditNote {
    id
    invoiceId
    creationReason
    persistentReferenceNumber
    dateIssued
    erpReference {
      ...erpReferenceFragment
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
  fragment erpReferenceFragment on ErpReference {
    entity_id
    type
    vendor
    attribute
    value
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
    datePublished
    preprintValue
  }
  fragment transactionFragment on Transaction {
    id
    status
  }
`;

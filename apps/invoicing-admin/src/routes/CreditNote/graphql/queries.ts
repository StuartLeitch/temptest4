export const CREDIT_NOTE_QUERY = `
  query getCreditNoteById($id: ID) {
    getCreditNoteById(creditNoteId: $id) {
      ...creditNoteFragment
    }
    getPaymentMethods {
      ...paymentMethodFragment
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
    invoice {
     ...invoiceFragment
    }
  }
  fragment invoiceFragment on Invoice {
    id: invoiceId
    referenceNumber
    erpReferences {
      ...erpReferenceFragment
    }
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
      type
      vat
      price
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

import gql from "graphql-tag";

export const invoiceVatFragment = gql`
  fragment invoiceVatFragment on InvoiceVat {
    vatPercentage
    vatNote
    rate
  }
`;

export const addressFragment = gql`
  fragment addressFragment on Address {
    city
    country
    state
    postalCode
    addressLine1
  }
`;

export const payerFragment = gql`
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
  ${addressFragment}
`;

export const articleFragment = gql`
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
    preprintValue
  }
`;

export const couponFragment = gql`
  fragment couponFragment on Coupon {
    code
    reduction
  }
`;

export const waiverFragment = gql`
  fragment waiverFragment on Waiver {
    reduction
    type_id
  }
`;

export const paymentFragment = gql`
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
`;

export const paymentMethodFragment = gql`
  fragment paymentMethodFragment on PaymentMethod {
    id
    name
    isActive
  }
`;

export const invoiceFragment = gql`
  fragment invoiceFragment on Invoice {
    invoiceId
    status
    dateCreated
    dateIssued
    dateAccepted
    referenceNumber
    payer {
      ...payerFragment
    }
    payments {
      ...paymentFragment
    }
    invoiceItem {
      id
      price
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
    transaction {
      status
    }
  }
  ${payerFragment}
  ${couponFragment}
  ${waiverFragment}
  ${articleFragment}
  ${paymentFragment}
  ${paymentMethodFragment}
`;

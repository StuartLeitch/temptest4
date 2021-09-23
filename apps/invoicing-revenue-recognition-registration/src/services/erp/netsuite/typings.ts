export type CustomerPayload = {
  email: string;
  isPerson: boolean;
  companyName: string;
  vatRegNumber: string;
};

export type CustomerPaymentPayload = {
  refName: string;
};

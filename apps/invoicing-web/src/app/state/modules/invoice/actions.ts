import CONSTANTS from "./constants";

export const fetchInvoice = invoiceId => ({
  type: CONSTANTS.FETCH,
  invoiceId,
});

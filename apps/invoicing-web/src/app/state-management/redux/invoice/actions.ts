import CONSTANTS from "./constants";

export const createInvoiceMailAction = (payload: any) => ({
  type: CONSTANTS.CREATE_INVOICE_MAIL,
  payload,
});

import * as payerActions from "../modules/payer/actions";
import { actions as systemActions } from "../modules/system";
import * as invoiceActions from "../modules/invoice/actions";

export default {
  payer: payerActions,
  invoice: invoiceActions,
  system: systemActions,
};

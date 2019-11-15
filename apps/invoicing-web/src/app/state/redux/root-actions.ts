import { actions as systemActions } from "../modules/system";
import { invoiceActions } from "../modules/invoice";
import { paymentsActions } from "../modules/payments";

import { modalActions } from "../../providers/modal";

export default {
  modal: modalActions,
  invoice: invoiceActions,
  payments: paymentsActions,
  system: systemActions,
};

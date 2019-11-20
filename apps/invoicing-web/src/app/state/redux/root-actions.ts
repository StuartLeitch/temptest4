import { actions as systemActions } from "../modules/system";
import { paymentActions } from "../modules/payment";
import { invoiceActions } from "../modules/invoice";

import { modalActions } from "../../providers/modal";

export default {
  invoice: invoiceActions,
  payment: paymentActions,
  system: systemActions,
  modal: modalActions,
};

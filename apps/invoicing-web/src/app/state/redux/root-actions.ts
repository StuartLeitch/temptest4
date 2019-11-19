import { actions as systemActions } from "../modules/system";
import * as invoiceActions from "../modules/invoice/actions";
import * as paymentActions from "../modules/payment/actions";

import { modalActions } from "../../providers/modal";

export default {
  modal: modalActions,
  invoice: invoiceActions,
  system: systemActions,
  payment: paymentActions,
};

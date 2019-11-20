import { actions as systemActions } from "../modules/system";
import * as paymentActions from "../modules/payment/actions";
import { invoiceActions } from "../modules/invoice";
import { paymentsActions } from "../modules/payments";

import { modalActions } from "../../providers/modal";

export default {
  modal: modalActions,
  invoice: invoiceActions,
  payments: paymentsActions,
  system: systemActions,
  payment: paymentActions,
};

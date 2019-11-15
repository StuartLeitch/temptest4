import { actions as systemActions } from "../modules/system";
import * as invoiceActions from "../modules/invoice/actions";

import { modalActions } from "../../providers/modal";

export default {
  modal: modalActions,
  invoice: invoiceActions,
  system: systemActions,
};

import { connect } from "react-redux";
import { RootState } from "typesafe-actions";
import {
  invoicesMap,
  invoicesTotalCount,
} from "../../state/redux/root-reducer";
import { invoiceActions, invoiceSelectors } from "../../state/modules/invoice";

import { InvoicesList as UnconnectedInvoicesList } from "./components/InvoicesList";

const mapStateToProps = (state: RootState) => ({
  invoices: invoicesMap(state),
  totalCount: invoicesTotalCount(state),
  invoicesLoading: invoiceSelectors.invoicesLoading(state),
});

export default connect(mapStateToProps, {
  getInvoices: invoiceActions.getInvoices.request,
})(UnconnectedInvoicesList);

import { connect } from "react-redux";
import { RootState } from "typesafe-actions";
import { invoicesMap } from "../../state/redux/root-reducer";

import { InvoicesList as UnconnectedInvoicesList } from "./components/InvoicesList";

const mapStateToProps = (state: RootState) => ({
  invoices: invoicesMap(state),
});

export default connect(mapStateToProps, {})(UnconnectedInvoicesList);

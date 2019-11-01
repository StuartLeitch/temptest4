import React, { useState, useEffect, useReducer } from "react";
import { produce } from "immer";
import { connect } from "react-redux";
import { Route, useParams, useRouteMatch, useHistory } from "react-router-dom";

import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Card from "antd/lib/card";

import { Charges } from "../../components/charges/charges";
import { PaymentSteps } from "../../components/payment-steps/payment-steps";
import { InvoiceDetails } from "../../components/invoice-details/invoice-details";
import { ManuscriptDetails } from "../../components/manuscript-details/manuscript-details";

import { Payment } from "./payment";
import { Index } from "../index/index";
import { BillingAddress } from "../billing-address/billing-address";

import { manuscriptRedux, invoiceRedux, payerRedux } from "../../state-management/redux";

const { fetchInvoiceAction } = invoiceRedux;
const { selectAuthor, selectManuscript } = manuscriptRedux;
const {
  selectPayer,
  createPayer,
  updateCreditCard,
  updatePayerAction,
  createPaypalPayment,
  createPaymentAction,
  updateBillingAddress,
  paypalPaymentFulfilled,
} = payerRedux;

const initialState = {
  payer: {
    name: "",
    email: "",
    country: "",
  },
  billingAddress: {
    address: "",
    city: "",
    country: "",
    postalCode: "",
  },
  cardDetails: {
    name: "",
    number: "",
    expiration: "",
    cvc: "",
  },
};

const CHANGE_VALUE = "CHANGE_VALUE";
const SET_PAYER = "SET_PAYER";

function formReducer(state, action) {
  switch (action.type) {
    case CHANGE_VALUE:
      return produce(state, draft => {
        draft[action.step][action.name] = action.value;
      });
    case SET_PAYER:
      return produce(state, draft => {
        draft.payer = action.payer;
      });
    default:
      return state;
  }
}

function usePaymentWizard() {
  const [formState, dispatch] = useReducer(formReducer, initialState);

  const changeHandler = step => event => {
    const v = event.target.value;
    dispatch({
      type: CHANGE_VALUE,
      step,
      name: event.target.name,
      value: v,
    });
  };

  const setPayer = payer =>
    dispatch({
      type: SET_PAYER,
      payer,
    });

  return { formState, changeHandler, setPayer };
}

const routes = ["/payer", "/billing-address", "/card-details"];

const PaymentWizard = ({
  author,
  createPayer,
  updatePayer,
  fetchInvoice,
  createPayment,
  updateCreditCard,
  createPaypalPayment,
  updateBillingAddress,
  paypalPaymentFulfilled,
}) => {
  const { invoiceId } = useParams();
  const match = useRouteMatch();
  const history = useHistory();

  const { formState, setPayer, changeHandler } = usePaymentWizard();
  const [wizardStep, setWizardStep] = useState(0);

  useEffect(() => {
    fetchInvoice(invoiceId);
  }, [invoiceId]);

  useEffect(() => {
    setPayer(author);
  }, [author]);

  const changeStep = (step: number) => {
    setWizardStep(step);
    history.replace(`${match.url}${routes[step]}`);
  };

  const handleSubmit = (step: number, formData: any) => {
    switch (step) {
      case 1:
        changeStep(step);
        createPayer(formData);
        break;
      case 2:
        changeStep(step);
        updateBillingAddress(formData);
        break;
      default:
        updateCreditCard(formData);
      // createPayment();
    }
  };

  return (
    <main>
      <PaymentSteps current={wizardStep} onChange={changeStep} />

      <Row>
        <Col span={12}>
          <Card>
            <Route
              exact
              path={`${match.path}${routes[0]}`}
              render={() => (
                <Index
                  payer={formState.payer}
                  onSubmit={handleSubmit}
                  onChange={changeHandler("payer")}
                />
              )}
            />
            <Route
              path={`${match.path}${routes[1]}`}
              render={() => (
                <BillingAddress
                  onSubmit={handleSubmit}
                  billingAddress={formState.billingAddress}
                  onChange={changeHandler("billingAddress")}
                />
              )}
            />
            <Route
              path={`${match.path}${routes[2]}`}
              render={() => (
                <Payment
                  onSubmit={handleSubmit}
                  paypalPaymentFulfilled={paypalPaymentFulfilled}
                  createPaypalPayment={createPaypalPayment}
                  cardDetails={formState.cardDetails}
                  onChange={changeHandler("cardDetails")}
                />
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ManuscriptDetails title="ARTICLE DETAILS" />
            <InvoiceDetails title="INVOICE DETAILS" />
            <Charges title="CHARGES" />
          </Card>
        </Col>
      </Row>
    </main>
  );
};

const mapStateToProps = state => ({
  author: selectAuthor(state),
  manuscript: selectManuscript(state),
  payer: selectPayer(state),
});

const mapDispatchToProps = dispatch => ({
  createPayer: payer => dispatch(createPayer(payer)),
  updatePayer: payer => dispatch(updatePayerAction(payer)),
  createPayment: () => dispatch(createPaymentAction()),
  fetchInvoice: invoiceId => dispatch(fetchInvoiceAction(invoiceId)),
  createPaypalPayment: payment => dispatch(createPaypalPayment(payment)),
  updateCreditCard: creditCard => dispatch(updateCreditCard(creditCard)),
  paypalPaymentFulfilled: payment => dispatch(paypalPaymentFulfilled(payment)),
  updateBillingAddress: billingAddress => dispatch(updateBillingAddress(billingAddress)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PaymentWizard);

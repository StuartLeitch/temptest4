import React, { useState, useEffect, useReducer } from "react";
import { produce } from "immer";
import { connect } from "react-redux";
import { Route, useParams, useRouteMatch, useHistory } from "react-router-dom";

import Row from "antd/es/row";
import Col from "antd/es/col";
import Card from "antd/es/card";

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
const { updatePayerAction, createPaymentAction } = payerRedux;

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
    dispatch({
      type: CHANGE_VALUE,
      step,
      name: event.target.name,
      value: event.target.value,
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
const PaymentWizard = ({ author, createPayment, fetchInvoice, updatePayer }) => {
  const { invoiceId } = useParams();
  const match = useRouteMatch();
  const history = useHistory();

  const { formState, setPayer, changeHandler } = usePaymentWizard();
  const [wizardStep, setWizardStep] = useState(0);

  useEffect(() => {
    fetchInvoice(invoiceId);
  }, []);

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
        updatePayer(formData);
        break;
      case 2:
        changeStep(step);
        updatePayer({ billingAddress: formData });
        break;
      default:
        updatePayer({ cardDetails: formData });
        createPayment();
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
});

const mapDispatchToProps = dispatch => ({
  fetchInvoice: invoiceId => dispatch(fetchInvoiceAction(invoiceId)),
  updatePayer: payer => dispatch(updatePayerAction(payer)),
  createPayment: () => dispatch(createPaymentAction()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PaymentWizard);

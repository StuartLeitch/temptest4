import React from "react";
// const client = require("braintree-web/client");

import { environment } from "../../../environments/environment";

import Avatar from "antd/es/avatar";
import Tabs from "antd/es/tabs";
import Icon from "antd/es/icon";

import { Panel } from "../../components/panel/panel";
import Paypal from "../../components/paypal/paypal";
// import { createPaypalPayment } from "../../state-management/redux/payer";
import CreditCardForm from "../../components/credit-card-payment-form/credit-card-payment-form";

const { TabPane } = Tabs;

// client
//   .create({
//     authorization: (window as any)._env_.BT_TOKENIZATION_KEY,
//   });

const dummyPayload = {
  paid: true,
  cancelled: false,
  payerID: "KTPABCEEW92NA",
  paymentID: "PAYID-LW4YA5A45D12593SE205670G",
  paymentToken: "EC-72K73389X86790054",
  returnUrl:
    "https://www.paypal.com/checkoutnow/error?paymentId=PAYID-LW4YA5A45D12593SE205670G&token=EC-72K73389X86790054&PayerID=KTPABCEEW92NA",
};

export const Payment = props => (
  <React.Fragment>
    <Panel title="INVOICE">
      <Avatar size={64} icon="file-pdf" /> Download Invoice
    </Panel>
    <Panel title="PAYMENT METHODS">
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <Icon style={{ fontSize: 36 }} theme="filled" type="credit-card" />
            </span>
          }
          key="1"
        >
          <CreditCardForm
            onSubmit={props.onSubmit}
            onChange={props.onChange}
            cardDetails={props.cardDetails}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon style={{ fontSize: 36 }} type="dollar" />
            </span>
          }
          key="2"
        >
          <button onClick={() => props.createPaypalPayment(dummyPayload)}>FAKE PAYPAL</button>
          <Paypal
            total={0.01}
            currency="EUR"
            onCancel={(...args) => {
              console.log("payment canceled ->", args);
            }}
            onError={err => {
              console.error("payment error -> ", err);
            }}
            onSuccess={props.createPaypalPayment}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon style={{ fontSize: 36 }} theme="filled" type="bank" />
            </span>
          }
          key="3"
        >
          Bank Transfer Payment Method
        </TabPane>
      </Tabs>
    </Panel>
  </React.Fragment>
);

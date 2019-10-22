import React from "react";
import Avatar from "antd/es/avatar";
import Tabs from "antd/es/tabs";
import Icon from "antd/es/icon";

import { Panel } from "../../components/panel/panel";
import CreditCardForm from "../../components/credit-card-payment-form/credit-card-payment-form";

const { TabPane } = Tabs;

export const Payment = () => (
  <div>
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
          <CreditCardForm />
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon style={{ fontSize: 36 }} type="dollar" />
            </span>
          }
          key="2"
        >
          PayPal Payment Method
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
  </div>
);

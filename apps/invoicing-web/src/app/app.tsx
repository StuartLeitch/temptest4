import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from "react-router-dom";

// * Antd components
import Row from "antd/es/row";
import Col from "antd/es/col";
import Card from "antd/es/card";
import List from "antd/es/list";
import Typography from "antd/es/typography";
import Avatar from "antd/es/avatar";
import Tabs from "antd/es/tabs";
import Icon from "antd/es/icon";

// * components
import { Panel } from "./components/panel/panel";
import { PaymentSteps } from "./components/payment-steps/payment-steps";
import CreditCardForm from "./components/credit-card-payment-form/credit-card-payment-form";

// * pages
import { Index } from "./pages/index/index";
import { BillingAddress } from "./pages/billing-address/billing-address";

const { Text } = Typography;
const { TabPane } = Tabs;

// * app styles
import "./app.scss";

const articleDetails = [
  ["Journal Title", "Advances in Condensed Matter Physics"],
  ["Article Title", "RNA detection based on graphene field effect transistor biosensor"],
  ["Article ID", "8146765"],
  ["Article Type", "Research Article"],
  ["CC License", "CC-BY 4.0"],
  ["Corresponding Author", "Shicai Xu"],
  ["Additional Authors", "view author list"],
];

const invoiceDetails = [
  ["Invoice Issue Date", "19 September 2019"],
  ["Date of Supply", "19 September 2019"],
  ["Reference Number", "483/2019"],
  ["Terms", "Payable upon Receipt"],
];

const charges = [
  ["Article Processing Charges", 1250.0],
  ["Net Charges", 1250.0],
  ["VAT (+20%)", 250.0],
  ["Total", 1500.0],
];

export const App = () => {
  let history = useHistory();
  let routes = ["/", "/billing-address", "/invoice-payment"];

  const state = {
    current: 0,
  };

  const onChange = current => {
    console.log("onChange:", current);
    this.setState({ current });
    history.push(routes[current]);
  };
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./${fileName}.${style} file.
   */
  return (
    <div className="app">
      <header className="flex">
        <a href="#" className="logo">
          <img src="/assets/images/hindawi.svg" alt="Hindawi Publishing Corporation"></img>
        </a>
        <h1>Payment Details</h1>
      </header>
      <main>
        <PaymentSteps current={1} onChange={onChange} />

        <Row>
          <Col span={12}>
            <Card>
              <Router>
                <Switch>
                  <Route exact path="/">
                    <BillingAddress />
                  </Route>
                  <Route path="/billing-address">
                    <BillingAddress />
                  </Route>
                  <Route path="/invoice-payment">
                    <BillingAddress />
                  </Route>
                </Switch>
              </Router>
            </Card>
          </Col>
          {/*<Col span={12}>
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
                </Col>*/}
          <Col span={12}>
            <Card>
              <Card type="inner" title="ARTICLE DETAILS">
                <List
                  dataSource={articleDetails}
                  renderItem={item => (
                    <List.Item>
                      <Text strong>{item[0]}</Text> {item[1]}
                    </List.Item>
                  )}
                />
              </Card>
              <Card type="inner" title="INVOICE DETAILS">
                <List
                  dataSource={invoiceDetails}
                  renderItem={item => (
                    <List.Item>
                      <Text strong>{item[0]}</Text> {item[1]}
                    </List.Item>
                  )}
                />
              </Card>
              <Card type="inner" title="CHARGES">
                <List
                  dataSource={charges}
                  renderItem={item => (
                    <List.Item>
                      <Text strong>{item[0]}</Text> <Text strong>$</Text>
                      {item[1]}
                    </List.Item>
                  )}
                />
              </Card>
            </Card>
          </Col>
        </Row>
      </main>

      <Route
        path="/"
        exact
        render={() => (
          <div>
            <Link to="/billing-address">Click here for billing address.</Link>
          </div>
        )}
      />
      <Route
        path="/billing-address"
        exact
        render={() => (
          <div>
            <Link to="/">Click here to go back to landing page.</Link>
          </div>
        )}
      />
      {/* END: routes */}
    </div>
  );
};

export default App;

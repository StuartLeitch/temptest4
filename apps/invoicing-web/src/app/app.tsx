import React, { useEffect } from "react";
import { Link, Route } from "react-router-dom";
import { connect } from "react-redux";
import { RootState } from "typesafe-actions";
import styled from "styled-components";

import { config } from "../config";

import { Header } from "./components/Header";
import { PaymentDetails } from "./pages/PaymentDetails";
import { invoicesMap } from "./state/redux/root-reducer";
import Axios from 'axios';

export const App = ({ invoices }) => {
  useEffect(() => {
    document.title = config.appName;
  });

  return (
    <div>
      <Header path="Payment Details" />
      <Route
        path="/"
        exact
        component={() => {
          return (
            <InvoicesList>
              {invoices.map(invoice => (
                <InvoiceItem key={invoice.id}>
                  <div style={{ width: "100%" }}>
                    <InvoiceLink to={"/payment-details/" + invoice.id}>
                      Invoice #{invoice.id}
                    </InvoiceLink>
                    <InvoiceSubtitle>
                      <dt>STATUS:</dt>
                      <dd className={invoice.status.toLowerCase()}>
                        {invoice.status}
                      </dd>
                      <dt>Manuscript Custom ID:</dt>
                      <dd>{invoice.customId}</dd>
                      <dt>Manuscript Title:</dt>
                      <dd>{invoice.manuscriptTitle}</dd>
                      <dt>Type:</dt>
                      <dd>{invoice.type}</dd>
                      <dt>Amount:</dt>
                      <dd>{invoice.price} 💲</dd>
                      {invoice.status === 'DRAFT'&&<dd><button onClick={()=>{
                        Axios.post('/api/acceptManuscript', {invoiceId: invoice.id})
                      }}>Accept manuscript</button></dd>}
                    </InvoiceSubtitle>
                  </div>
                </InvoiceItem>
              ))}
            </InvoicesList>
          );
        }}
      />

      <Route path="/payment-details/:invoiceId" component={PaymentDetails} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  invoices: invoicesMap(state), // invoicesSelectors.invoice(state),
  // invoicesError: invoicesSelectors.invoiceError(state),
  // invoicesLoading: invoiceSelectors.invoiceLoading(state),
});

export default connect(mapStateToProps, {
  // getInvoice: invoiceActions.getInvoice.request,
  // updatePayer: invoiceActions.updatePayerAsync.request,
})(App);

const InvoicesList = styled.ul`
  counter-reset: index;
  padding: 0;
  max-width: 100%;
`;

const InvoiceItem = styled.li`
  counter-increment: index;
  display: flex;
  align-items: center;
  padding: 12px 0;
  box-sizing: border-box;

  &::before {
    content: counters(index, ".", decimal-leading-zero);
    font-size: 1.5rem;
    text-align: right;
    font-weight: bold;
    min-width: 50px;
    padding-right: 12px;
    font-variant-numeric: tabular-nums;
    align-self: flex-start;
    background-image: linear-gradient(to bottom, #00718f, #6db33f);
    background-attachment: fixed;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  & + li {
    border-top: 1px solid rgba(204, 204, 204, 0.55);
  }
`;

const InvoiceLink = styled(Link)`
  font-size: 1.4rem;
  display: block;

  &:hover {
    color: #00718f;
  }
`;

const InvoiceSubtitle = styled.dl`
  display: flex;
  flex-flow: row wrap;
  font-size: 1.1rem;
  max-height: 3em;

  dt {
    padding: 2px 7px;
    max-width: 200px;
    text-align: right;
  }

  dt:first-of-type {
    padding-left: 0;
  }

  dd {
    margin: 0;
    padding: 2px 7px;
    min-height: 1em;
    font-weight: bold;
    border-right: 1px solid rgba(120, 120, 120, 0.5);
  }

  dd.draft {
    color: #a8a8a8;
  }

  dd.active {
    color: #10aae2;
  }

  dd.final {
    color: #088a3c;
  }

  dd:last-of-type {
    border-right: none;
  }
`;

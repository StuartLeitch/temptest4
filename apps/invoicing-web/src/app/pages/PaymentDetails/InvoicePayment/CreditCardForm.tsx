import React from "react";
import styled from "styled-components";
import PaymentIcon from "./PaymentIcon";
import { Flex, Label, Button, Text, th } from "@hindawi/react-components";
import { Braintree, HostedField } from "react-braintree-fields";

interface Props {
  handleSubmit: any;
  loading: boolean;
  ccToken: string;
  numberField?: any;
  braintree?: any;
  paymentMethodId: string;
  payerId: string;
  total: number;
  clearServerErrors: () => void;
}

class CreditCardForm extends React.PureComponent<Props, {}> {
  numberField: React.RefObject<unknown>;
  braintree: React.RefObject<unknown>;

  constructor(props: any) {
    super(props);

    this.numberField = React.createRef();
    this.braintree = React.createRef();

    ["onError", "getToken", "onAuthorizationSuccess"].forEach(
      prop => (this[prop] = this[prop].bind(this)),
    );
  }

  state = {
    isBraintreeReady: false,
    numberFocused: false,
    error: null
  };

  onError(error: any) {
    this.setState({ error });
  }

  getToken() {
    (this as any)
      .tokenize()
      .then((token: any) => {
        this.setState(
          state => ({ ...state, token, error: null }),
          () => {
            const ccPayload = {
              paymentMethodNonce: token.nonce,
              paymentMethodId: this.props.paymentMethodId,
              payerId: this.props.payerId,
              amount: this.props.total,
            };
            this.props.handleSubmit(ccPayload);
          },
        );
      })
      .catch(error => this.setState({ token: null, error }));
  }

  renderResult(title: string, obj: any) {
    if (!obj) {
      return null;
    }
    return (
      <div>
        <b>{title}:</b>
        <pre>{JSON.stringify(obj, null, 4)}</pre>
      </div>
    );
  }

  renderError(title: string, obj: any) {
    if (!obj) {
      return null;
    }

    this.props.clearServerErrors();

    if (obj.code && obj.code === 'HOSTED_FIELDS_FIELDS_EMPTY') {
      return (
        <Text type="warning">{'All fields are empty'}</Text>
        );
      }

      if (obj.code && obj.code === 'HOSTED_FIELDS_FIELDS_INVALID') {
      const map = []
      if (obj.details && 'invalidFields' in obj.details) {
        const invalids = Object.values(obj.details.invalidFieldKeys).reduce((acc: any[], invalidFieldKey) => {
          let txt = '';
          if (invalidFieldKey === 'number') {
            txt = '\u2022 Please enter a valid credit card number'
          }
          if (invalidFieldKey === 'expirationDate') {
            txt = '\u2022 Please enter a valid expiration date'
          }
          if (invalidFieldKey === 'cvv') {
            txt = '\u2022 Please enter a valid CVV'
          }
          if (invalidFieldKey === 'postalCode') {
            txt = '\u2022 Please enter a valid postal code'
          }
          acc.push(<Text type="warning">{txt}</Text>)
          return acc;
        }, []);

        return ([
          <Text key={'msg'} type="warning">{'Some payment input fields are invalid: '}</Text>
        ] as any).concat(invalids)
      }
    }
  }

  onAuthorizationSuccess() {
    this.setState({ isBraintreeReady: true });
    // (this.numberField.current as any).focus();
  }

  render() {
    return (
      <Flex vertical>
        <Flex justifyContent="flex-start">
          <Label>Credit Card Details</Label>
          <PaymentIcon id="visa" style={{ margin: 3, width: 36 }} />
          <PaymentIcon id="maestro" style={{ margin: 3, width: 36 }} />
          <PaymentIcon id="mastercard" style={{ margin: 3, width: 36 }} />
          <PaymentIcon id="discover" style={{ margin: 3, width: 36 }} />
        </Flex>

        <Braintree
          ref={this.braintree}
          authorization={this.props.ccToken}
          onAuthorizationSuccess={this.onAuthorizationSuccess}
          onError={this.onError}
          // onCardTypeChange={this.onCardTypeChange}
          getTokenRef={(t: any) => ((this as any).tokenize = t)}
          styles={{
            input: {
              "font-size": "14px",
              "font-family": "courier, monospace",
              "letter-spacing": "2px",
              "word-spacing": "4px",
              width: "100%",
              color: "rgb(161, 161, 161)",
            },
            "#credit-card-number": {
              "text-align": "left",
              "margin-bottom": "10px",
            },
            ":focus": {
              color: "rgb(51, 51, 51)",
            },
          }}
        >
          <CardContainer
            mt={2}
            mb={2}
            className={this.state.isBraintreeReady ? "" : "disabled"}
          >
            <Flex vertical mr={4}>
              <Label required htmlFor="cardNumber">
                Card Number
              </Label>
              <HostedField
                placeholder={
                  "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022"
                }
                type="number"
                ref={this.numberField}
              />
            </Flex>
            <Flex vertical mr={4}>
              <Label required htmlFor="expirationDate">
                Expiration Date
              </Label>
              <HostedField placeholder={"MM/YYYY"} type="expirationDate" />
            </Flex>
            <Flex vertical mr={4}>
              <Label required htmlFor="cvv">
                CVV
              </Label>
              <HostedField placeholder={"\u2022\u2022\u2022"} type="cvv" />
            </Flex>
            <Flex vertical mr={4}>
              <Label required htmlFor="postalCode">
                Postal Code
              </Label>
              <HostedField type="postalCode" />
            </Flex>

            <Button
              mt={6}
              mb={2}
              size="medium"
              onClick={this.getToken}
              loading={this.props.loading}
            >
              Pay
            </Button>
          </CardContainer>
        </Braintree>

        {this.renderError('Error', this.state.error)}
      </Flex>
    );
  }
}

export default CreditCardForm;

const CardContainer = styled(Flex)`
  background-color: ${th("colors.background")};
  border-radius: ${th("gridUnit")};
  padding: 0 calc(${th("gridUnit")} * 4);
  padding-top: calc(${th("gridUnit")} * 3);
  padding-bottom: calc(${th("gridUnit")} * 3);

  &.disabled {
    pointer-events: none;

    /* for "disabled" effect */
    opacity: 0.5;
    background: #ccc;
  }

  .braintree-hosted-field {
    background-color: rgb(255, 255, 255);
    border-radius: 4px;
    height: calc(4px * 8);
    padding: calc(4px * 2);
    height: 32px;
    border: 1px solid rgb(201, 201, 201);
    padding: 0 1rem;
  }
  .braintree-hosted-field.braintree-hosted-field-focused {
    border-color: rgb(51, 51, 51);
  }
  .braintree-hosted-field.error {
    border-color: rgb(254, 186, 172);
  }
`;

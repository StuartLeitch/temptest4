import * as React from "react";
import Form, { FormComponentProps } from "antd/lib/form";
// import Icon from "antd/es/icon";
import Input from "antd/lib/input";
import Button from "antd/lib/button";
import ReactCreditCard from "@repay/react-credit-card";

type FOCUS_TYPE = "number" | "cvc" | "expiration" | "name";

interface Props {
  onChange?: any;
  cardDetails?: any;
  onSubmit?(step: number, formValues: any): void;
}

const CreditCardForm: React.FC<Props> = ({ cardDetails, onChange, onSubmit }) => {
  const [focused, setFocus] = React.useState<FOCUS_TYPE | undefined>(undefined);
  const handleFocus = React.useCallback(event => setFocus(event.target.name as FOCUS_TYPE), [
    setFocus,
  ]);
  const handleBlur = React.useCallback(() => setFocus(undefined), [setFocus]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(undefined, cardDetails);
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item {...creditCardItemLayout}>
        <ReactCreditCard {...cardDetails} focused={focused} />
      </Form.Item>
      <Form.Item label="Name on card">
        <Input
          placeholder="name"
          name="name"
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={cardDetails.name}
        />
      </Form.Item>
      <Form.Item label="Card number">
        <Input
          name="number"
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={cardDetails.number}
        />
      </Form.Item>
      <Form.Item label="Expiration Date">
        <Input
          name="expiration"
          placeholder="MM/YY"
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={cardDetails.expiration}
        />
      </Form.Item>
      <Form.Item label="CVC">
        <Input
          name="cvc"
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={cardDetails.cvc}
        />
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Show me the money!
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreditCardForm;

export // #region styles
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const creditCardItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 3,
    },
  },
};

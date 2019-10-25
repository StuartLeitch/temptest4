import React from "react";
import Form, { FormComponentProps } from "antd/es/form";
// import Icon from "antd/es/icon";
import Input from "antd/es/input";
import Button from "antd/es/button";
import ReactCreditCard from "@repay/react-credit-card";

type FOCUS_TYPE = "number" | "cvc" | "expiration" | "name";

const styles: React.CSSProperties = {
  padding: "40px",
  margin: "40px",
  display: "flex",
  flexDirection: "column",
};

interface Props {
  onSubmit?(v: any, cardValues: any): void;
}

const CreditCardForm: React.FC<Props> = props => {
  const [values, setValues] = React.useState({
    name: "",
    number: "",
    expiration: "",
    cvc: "",
  });
  const handleChange = React.useCallback(
    event => {
      const { name, value } = event.target;
      setValues(v => ({ ...v, [name]: value }));
    },
    [setValues],
  );

  const [focused, setFocus] = React.useState<FOCUS_TYPE | undefined>(undefined);
  const handleFocus = React.useCallback(event => setFocus(event.target.name as FOCUS_TYPE), [
    setFocus,
  ]);
  const handleBlur = React.useCallback(() => setFocus(undefined), [setFocus]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.onSubmit(undefined, values);
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item {...creditCardItemLayout}>
        <ReactCreditCard {...values} focused={focused} />
      </Form.Item>
      <Form.Item label="Name on card">
        <Input
          placeholder="name"
          name="name"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={values.name}
        />
      </Form.Item>
      <Form.Item label="Card number">
        <Input
          name="number"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={values.number}
        />
      </Form.Item>
      <Form.Item label="Expiration Date">
        <Input
          name="expiration"
          placeholder="MM/YY"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={values.expiration}
        />
      </Form.Item>
      <Form.Item label="CVC">
        <Input
          name="cvc"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={values.cvc}
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
// #endregion

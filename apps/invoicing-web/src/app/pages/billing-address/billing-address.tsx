import React, { useState, useCallback } from "react";
import Form from "antd/es/form";
import Input from "antd/es/input";
import Button from "antd/es/button";

interface Props {
  onSubmit?(step: number, formValues: any): void;
}

export const BillingAddress: React.FC<Props> = props => {
  const [values, setValues] = useState({
    street: "",
    zip: "",
    city: "",
    country: "",
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.onSubmit(2, values);
  };

  const handleChange = useCallback(
    event => {
      const { name, value } = event.target;
      setValues(v => ({ ...v, [name]: value }));
    },
    [setValues],
  );

  return (
    <Form {...formItemLayout} style={{ marginTop: "30px" }} onSubmit={handleSubmit}>
      <Form.Item label="Street Address">
        <Input placeholder="street" name="street" value={values.street} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="Zip Code">
        <Input name="zip" value={values.zip} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="City">
        <Input name="city" placeholder="City" value={values.city} onChange={handleChange} />
      </Form.Item>
      <Form.Item label="Country">
        <Input name="country" value={values.country} onChange={handleChange} />
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

// #region styles
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
// #endregion

import React, { useState, useEffect, useCallback } from "react";

import Form from "antd/lib/form";
import Checkbox from "antd/lib/checkbox";
import Input from "antd/lib/input";
import Button from "antd/lib/button";

// import styles from "./index.css";
interface Props {
  author?: any;
  payer: any;
  onChange?: any;
  onSubmit?(step: number, formValues: any): void;
}

export const Index: React.FC<Props> = ({ payer, onSubmit, onChange }) => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(1, payer);
  };

  const label = "Individual";

  return (
    payer && (
      <Form {...formItemLayout} style={{ marginTop: "30px" }} onSubmit={handleSubmit}>
        <Form.Item label="Name">
          <Input placeholder="name" name="name" value={payer.name} onChange={onChange} />
        </Form.Item>
        <Form.Item label="E-mail">
          <Input name="email" value={payer.email} onChange={onChange} />
        </Form.Item>
        <Form.Item label="Country">
          <Input name="country" value={payer.country} readOnly />
        </Form.Item>
        <Form.Item label="Is Individual?">
          <Checkbox name="isIndividual" checked={true} onChange={onChange}>
            {label}
          </Checkbox>
        </Form.Item>
        {/* {values.isIndividual ? null : (
        <Form.Item hasFeedback validateStatus="validating" label="VAT number">
          <Input name="vatNumber" value={values.vatNumber} />
        </Form.Item>
      )} */}
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    )
  );
};

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

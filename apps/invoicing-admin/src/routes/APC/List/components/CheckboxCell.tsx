import React from 'react';

import { Switch } from 'antd';
import { Form } from '@hindawi/phenom-ui';

interface CheckboxCellProps extends React.HTMLAttributes<HTMLElement> {
  dataIndex: string;
  handleDisabled: any;
}

const CheckboxCell: React.FC<CheckboxCellProps> = ({
  dataIndex,
  handleDisabled,
}) => {
  return (
    <Form.Item valuePropName='checked' style={{ margin: 0 }} name={dataIndex}>
      <Switch size='small' onClick={handleDisabled} />
    </Form.Item>
  );
};

export default CheckboxCell;

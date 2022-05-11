import React, { useState } from 'react';

import { Input, Form } from '@hindawi/phenom-ui';

interface AmountCellProps extends React.HTMLAttributes<HTMLElement> {
  dataIndex: string;
  index: number;
  formState: any;
}

const AmountCell: React.FC<AmountCellProps> = ({
  dataIndex,
  index,
  formState,
  ...restProps
}) => {
  const [value, setValue] = useState('');
  const zeroPricedStatus = formState.getFieldValue('zeroPriced');

  const handleChange = (e) => {
    if (zeroPricedStatus) {
      setValue('0');
    }
    setValue(e.target.value.replace(/[^\w\s]/gi, ''));
  };

  return (
    <React.Fragment>
      <Form.Item
        className='amount-field'
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[
          {
            required: true,
            pattern: new RegExp(/^[1-9][0-9]*$/),
            message: '',
            whitespace: false,
          },
        ]}
      >
        <Input
          className='amount-input'
          prefix={'$'}
          maxLength={6}
          onChange={handleChange}
          value={value}
          disabled={zeroPricedStatus}
          style={{ width: 80 }}
        />
      </Form.Item>
    </React.Fragment>
  );
};

export default AmountCell;

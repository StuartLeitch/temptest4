import React, { useState } from 'react';

import {
  Select,
  Input,
  Form,
  IconCaretUp,
  IconCaretDown,
} from '@hindawi/phenom-ui';

import { Item } from '../../types';

import _ from 'lodash';

const { Option } = Select;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  publishers: any;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  publishers,
  ...restProps
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value.replace(/[^\w\s]/gi, ''));
  };
  return (
    <td {...restProps}>
      {editing ? (
        <React.Fragment>
          {dataIndex === 'amount' ? (
            <Form.Item
              className='amount-field'
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  pattern: new RegExp(/^[0-9]+$/),
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
                style={{ width: 80 }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name={dataIndex}
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                onClick={() => setOpen(!open)}
                suffixIcon={
                  open ? (
                    <IconCaretUp onClick={() => setOpen(!open)} />
                  ) : (
                    <IconCaretDown onClick={() => setOpen(!open)} />
                  )
                }
                open={open}
                style={{ width: 100 }}
              >
                {publishers &&
                  publishers.map((publisher, index) => {
                    const { name, id } = publisher;

                    return (
                      <Option key={index} value={name}>
                        {' '}
                        {name}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          )}
        </React.Fragment>
      ) : (
        children
      )}
    </td>
  );
};

export default EditableCell;

import React from 'react';

import { Select, Input, Form } from '@hindawi/phenom-ui';

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
                },
              ]}
            >
              <Input maxLength={6} style={{ width: 80, textAlign: 'right' }} />
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
              <Select style={{ width: 100 }}>
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

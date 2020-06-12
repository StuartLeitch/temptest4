import React, { useState } from 'react';

import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DropdownMenu } from 'reactstrap';

import {
  Button,
  ButtonToolbar,
  DropdownToggle,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalFooter,
  UncontrolledButtonDropdown,
} from '..';

export const ModalDropdown: React.FC<ModalDropdownProps> = ({
  className,
  dropdownToggle,
  onSave,
  onSaveAndMarkInvoiceAsFinal,
  children,
  ...otherProps
}) => {
  const [modalState, setModalState] = useState({
    open: false,
    options: [
      { text: 'doNothing', value: 'doNothing' },
      { text: 'openModal', value: 'openModal' }
    ]
  });
  const classes = classNames(className, 'extended-dropdown');

  const onClose = () => setModalState({ ...modalState, open: false });
  const onChange = event => {
    const role = event.target.getAttribute('role');
    if (role === 'menuitem') {
      setModalState({ ...modalState, open: true });
    }
  };

  return (
    <React.Fragment>
      <UncontrolledButtonDropdown className='mr-2' onClick={onChange}>
        {dropdownToggle}
        <DropdownMenu>
          <DropdownItem header>Payment Methods</DropdownItem>
          <DropdownItem>
            <i className='fas fa-fw fa-landmark mr-2'></i>
            Bank Transfer
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
      <Modal centered isOpen={modalState.open} toggle={onClose}>
        <ModalHeader tag='h4'>Add Payment: Bank Transfer</ModalHeader>
        {children}
        <ModalFooter>
          <Button color='link' onClick={onClose}>
            <i className='fas fa-times mr-2'></i>
            Cancel
          </Button>
          <ButtonToolbar className='ml-auto'>
            <UncontrolledButtonDropdown className='mr-3'>
              <DropdownToggle color='primary' caret>
                <i className='fas fa-save mr-2'></i>
                Save Payment
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem
                  tag={Button}
                  color='secondary'
                  onClick={() => {
                    onClose();
                    onSave();
                  }}
                >
                  Save Payment
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem
                  tag={Button}
                  color='primary'
                  onClick={() => {
                    onClose();
                    onSaveAndMarkInvoiceAsFinal();
                  }}
                >
                  Save Payment & Set Invoice to FINAL
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </ButtonToolbar>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};
ModalDropdown.propTypes = {
  className: PropTypes.string,
  dropdownToggle: PropTypes.any,
  onSave: PropTypes.func
};

interface ModalDropdownProps {
  children: any;
  className?: string;
  dropdownToggle: any;
  onSave(): void;
  onSaveAndMarkInvoiceAsFinal(): void;
}

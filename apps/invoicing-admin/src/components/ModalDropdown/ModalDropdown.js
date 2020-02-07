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
  ModalBody,
  ModalFooter,
  UncontrolledButtonDropdown,
  UncontrolledModal
} from '../';

export const ModalDropdown = ({
  className,
  dropdownToggle,
  onSave,
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

  const onClose = () => setModalState({ open: false });
  const onChange = event => {
    const role = event.target.getAttribute('role');
    if (role === 'menuitem') {
      setModalState({ open: true });
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
          {/* <Button
            color='primary'
            onClick={() => {
              onClose();
              onSave();
            }}
          >
            <i className='fas fa-check mr-2'></i>
            Save
          </Button> */}
          <ButtonToolbar className='ml-auto'>
            <UncontrolledButtonDropdown className='mr-3'>
              <DropdownToggle color='primary' caret>
                <i className='fas fa-save mr-2'></i>
                Save Payment
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem
                  tag={Button}
                  color='primary'
                  onClick={() => {
                    onClose();
                    onSave();
                  }}
                >
                  Save Payment
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem>Save Payment & Set Invoice to FINAL</DropdownItem>
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

// export class Demo extends React.Component<{}, {}> {
//   state = {
//     options: [
//       { text: 'doNothing', value: 'doNothing' },
//       { text: 'openModal', value: 'openModal' }
//     ],
//     open: false
//   };

//   onClose = () => setModalState({ open: false });
//   onChange = selected => {
//     // if the correct one is selected then...
//     // this.setState({open: true});
//   };

//   render() {
//     return (
//       <div>
//         <Dropdown
//           fluid
//           selection
//           options={modalState.options}
//           onChange={onChange}
//           defaultValue={modalState.options[0].value}
//         />

//         <Modal open={modalState.open} onClose={onClose}>
//           <Modal.Header>Select a Photo</Modal.Header>
//           <Modal.Content image>
//             <Modal.Description>
//               <p>Some contents.</p>
//             </Modal.Description>
//           </Modal.Content>
//         </Modal>
//       </div>
//     );
//   }
// }

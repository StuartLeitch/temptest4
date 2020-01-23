import React from 'react';

import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from './../../../components';

const ChatCardHeader = () => (
    <React.Fragment>
    <h6 className="align-self-center mb-0">
        Chat with Romaine Weber
    </h6>
    <UncontrolledButtonDropdown className="align-self-center ml-auto">
    <DropdownToggle color="link" size="sm" className="text-decoration-none">
        <i className="fas fa-gear"></i><i className="fas fa-angle-down ml-2"></i>
    </DropdownToggle>
    <DropdownMenu right>
        <DropdownItem>
            <i className="fas fa-fw fa-comment mr-2"></i>
            Private Message
        </DropdownItem>
        <DropdownItem>
            <i className="fas fa-fw fa-search mr-2"></i>
            Search this Thread
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem>
            <i className="fas fa-fw fa-ban mr-2"></i>
            Block this User
        </DropdownItem>
    </DropdownMenu>
    </UncontrolledButtonDropdown>
    </React.Fragment>
)

export { ChatCardHeader };

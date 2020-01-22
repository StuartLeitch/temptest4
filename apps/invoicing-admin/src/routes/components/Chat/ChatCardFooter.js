import React from 'react';
import { Link } from 'react-router-dom';

import {
    InputGroup,
    InputGroupAddon,
    Button,
    Input
} from './../../../components';

const ChatCardFooter = () => (
    <React.Fragment>
        <InputGroup>
            <InputGroupAddon addonType="prepend">
                <Button color="secondary" outline>
                    <i className="fas fa-paperclip"></i>
                </Button>
            </InputGroupAddon>
            <Input placeholder="Your message..." />
            <InputGroupAddon addonType="append">
                <Button color="primary" tag={ Link } to="/apps/chat">
                    <i className="fas fa-send"></i>
                </Button>
            </InputGroupAddon>
        </InputGroup>
    </React.Fragment>
)

export { ChatCardFooter };

// SetupTests.js - Imports globals into Jest tests

import 'jest-prop-type-error';

import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({adapter: new Adapter()});

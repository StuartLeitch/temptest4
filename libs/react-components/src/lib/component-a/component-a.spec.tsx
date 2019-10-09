import React from 'react';

import {shallow} from 'enzyme';
import {ComponentA} from './component-a';

describe('Component A', () => {
  it('should create new instances', () => {
    const component = shallow<typeof ComponentA>(<ComponentA />);
    // Snapshot demo
    expect(component.instance()).toBeDefined();
  });
});

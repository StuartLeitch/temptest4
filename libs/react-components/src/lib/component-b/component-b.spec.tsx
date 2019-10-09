import React from 'react';
import {shallow} from 'enzyme';
import {ComponentB} from './component-b';

describe('Component B', () => {
  it('should create new instances', () => {
    const component = shallow<typeof ComponentB>(<ComponentB />);
    // Snapshot demo
    expect(component.instance()).toBeDefined();
  });
});

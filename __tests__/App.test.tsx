import React from 'react';
import { render } from '@testing-library/react-native';
import Component from '../App';

describe('App.tsx', () => {
  it('renders without crashing', () => {
    const screen = render(<Component />);
    expect(screen.toJSON()).toBeTruthy();
  });
});

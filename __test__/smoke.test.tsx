import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

describe('smoke test', () => {
  it('renders text', () => {
    render(<Text>hello</Text>);
    expect(screen.getByText('hello')).toBeTruthy();
  });
});
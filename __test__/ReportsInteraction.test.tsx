import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('../src/services/supabase', () => {
  const mockResult = Promise.resolve({ data: [], error: null });

  const mockQueryBuilder: any = {
    select: jest.fn(() => mockQueryBuilder),
    insert: jest.fn(() => mockResult),
    update: jest.fn(() => mockQueryBuilder),
    delete: jest.fn(() => mockQueryBuilder),
    eq: jest.fn(() => mockQueryBuilder),
    neq: jest.fn(() => mockQueryBuilder),
    order: jest.fn(() => mockResult),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  };

  return {
    supabase: {
      auth: {
        getSession: jest.fn(() =>
          Promise.resolve({ data: { session: null }, error: null })
        ),
        onAuthStateChange: jest.fn(() => ({
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        })),
        signOut: jest.fn(() => Promise.resolve({ error: null })),
      },
      from: jest.fn(() => mockQueryBuilder),
    },
  };
});

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'admin',
    },
    session: null,
    loading: false,
    signOut: jest.fn(),
  }),
}));

import { ReportsScreen } from '../src/screens/admin/ReportsScreen';

describe('ReportsScreen interactions', () => {
  it('renders Generate buttons that can be pressed', () => {
    render(<ReportsScreen />);
    const buttons = screen.getAllByText('Generate');
    expect(buttons.length).toBeGreaterThan(0);

    fireEvent.press(buttons[0]);
  });
});
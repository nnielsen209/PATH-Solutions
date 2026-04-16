import React from 'react';
import { render, screen } from '@testing-library/react-native';

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
      id: 'dev-user-id',
      email: 'dev@example.com',
      role: 'developer',
    },
    session: null,
    loading: false,
    signOut: jest.fn(),
  }),
}));

import { DevUsersScreen } from '../src/screens/dev/UsersScreen';

describe('DevUsersScreen', () => {
  it('renders without crashing', () => {
    render(<DevUsersScreen />);
  });

  it('shows at least one Users label', () => {
    render(<DevUsersScreen />);
    expect(screen.getAllByText(/Users/i).length).toBeGreaterThan(0);
  });
});
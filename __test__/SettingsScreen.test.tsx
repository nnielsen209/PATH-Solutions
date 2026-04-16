import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('../src/services/supabase', () => {
  const mockQueryBuilder: any = {
    select: jest.fn(() => mockQueryBuilder),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => mockQueryBuilder),
    delete: jest.fn(() => mockQueryBuilder),
    eq: jest.fn(() => mockQueryBuilder),
    neq: jest.fn(() => mockQueryBuilder),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
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

import { SettingsScreen } from '../src/screens/admin/SettingsScreen';

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    render(<SettingsScreen />);
  });

  it('shows the Settings heading', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('shows Change password text', () => {
    render(<SettingsScreen />);
    expect(screen.getByText(/Change password/i)).toBeTruthy();
  });

  it('shows Sign out text', () => {
    render(<SettingsScreen />);
    expect(screen.getAllByText(/Sign out/i).length).toBeGreaterThan(0);
  });
});
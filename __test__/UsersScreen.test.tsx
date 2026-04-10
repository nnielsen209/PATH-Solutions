jest.mock('../src/services/supabase', () => ({
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
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    },
  }));
  
  jest.mock('../src/context/AuthContext', () => ({
    useAuth: () => ({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
      session: null,
      loading: false,
      signOut: jest.fn(),
    }),
  }));
  
  import React from 'react';
  import { render, screen } from '@testing-library/react-native';
  import { UsersScreen } from '../src/screens/admin/UsersScreen';
  
  describe('Admin UsersScreen', () => {
    it('renders without crashing', () => {
      render(<UsersScreen />);
    });
  
    it('shows the Users heading', () => {
      render(<UsersScreen />);
      expect(screen.getByText('Users')).toBeTruthy();
    });
  });
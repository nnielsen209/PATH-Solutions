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
          order: jest.fn(() =>
            Promise.resolve({ data: [], error: null })
          ),
          eq: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({ data: [], error: null })
            ),
          })),
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
  import { ReportsScreen } from '../src/screens/admin/ReportsScreen';
  
  describe('ReportsScreen', () => {
    it('renders without crashing', () => {
      render(<ReportsScreen />);
    });
  
    it('shows the Reports heading', () => {
      render(<ReportsScreen />);
      expect(screen.getByText('Reports')).toBeTruthy();
    });
  
    it('shows Generate buttons', () => {
      render(<ReportsScreen />);
      expect(screen.getAllByText('Generate').length).toBeGreaterThan(0);
    });
  });
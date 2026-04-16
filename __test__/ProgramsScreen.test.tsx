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
        insert: jest.fn(() =>
          Promise.resolve({ data: null, error: null })
        ),
        update: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({ data: null, error: null })
          ),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({ data: null, error: null })
          ),
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
  import { ProgramsScreen } from '../src/screens/admin/ProgramsScreen';
  
  describe('ProgramsScreen', () => {
    it('renders without crashing', () => {
      render(<ProgramsScreen />);
    });
  
    it('shows the Programs heading', () => {
      render(<ProgramsScreen />);
      expect(screen.getByText('Programs')).toBeTruthy();
    });
  });
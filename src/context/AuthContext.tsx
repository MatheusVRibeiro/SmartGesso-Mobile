import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  AuthContextData,
  AuthState,
  LoginRequest,
  User,
} from '../types/auth';
import { authApi } from '../api/auth';
import {
  clearTokens,
  getAccessToken,
  saveTokens,
} from '../api/client';
import { config } from '../constants/config';

type AuthAction =
  | { type: 'RESTORE_TOKEN'; accessToken: string; user: User }
  | { type: 'LOGIN'; accessToken: string; refreshToken: string; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'UPDATE_USER'; user: User };

interface AuthProviderProps {
  children: React.ReactNode;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        accessToken: action.accessToken,
        user: action.user,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN':
      return {
        ...state,
        accessToken: action.accessToken,
        refreshToken: action.refreshToken,
        user: action.user,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    async function restoreToken() {
      try {
        const accessToken = await getAccessToken();

        if (accessToken) {
          try {
            const user = await authApi.me();
            dispatch({
              type: 'RESTORE_TOKEN',
              accessToken,
              user,
            });
            return;
          } catch {
            // Token expired or invalid, clear it
            await clearTokens();
          }
        }
      } catch {
        // SecureStore error or network error
      }

      dispatch({ type: 'SET_LOADING', isLoading: false });
    }

    restoreToken();
  }, []);

  const authContext = useMemo<AuthContextData>(
    () => ({
      ...state,

      login: async (data: LoginRequest) => {
        dispatch({ type: 'SET_LOADING', isLoading: true });

        try {
          const response = await authApi.login(data);

          await saveTokens(response.accessToken, response.refreshToken);

          dispatch({
            type: 'LOGIN',
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
          });
        } catch (error) {
          dispatch({ type: 'SET_LOADING', isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await clearTokens();
        dispatch({ type: 'LOGOUT' });
      },

      updateUser: (user: User) => {
        dispatch({ type: 'UPDATE_USER', user });
      },
    }),
    [state]
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardingScreen } from '../screens/OnboardingScreen';

// Mock the hooks
jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

const mockRoute = {
  key: 'onboarding',
  name: 'Onboarding',
  params: {},
};

describe('OnboardingScreen', () => {
  let queryClient: QueryClient;
  let mockUseAuth: jest.Mock;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseAuth = require('../hooks/useAuth').useAuth;

    // Default mock implementation
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
      logout: jest.fn(),
      loginError: null,
      registerError: null,
      updateProfileError: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <OnboardingScreen navigation={mockNavigation} route={mockRoute} />
      </QueryClientProvider>
    );
  };

  it('should render onboarding screen', () => {
    const { getByTestId } = renderScreen();
    
    expect(getByTestId('onboarding-screen')).toBeTruthy();
    expect(getByTestId('welcome-title')).toBeTruthy();
    expect(getByTestId('welcome-description')).toBeTruthy();
  });

  it('should show login form by default', () => {
    const { getByTestId } = renderScreen();
    
    expect(getByTestId('login-form')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('should switch to register form when register tab is pressed', () => {
    const { getByTestId } = renderScreen();
    
    fireEvent.press(getByTestId('register-tab'));
    
    expect(getByTestId('register-form')).toBeTruthy();
    expect(getByTestId('name-input')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('register-button')).toBeTruthy();
  });

  it('should switch back to login form when login tab is pressed', () => {
    const { getByTestId } = renderScreen();
    
    // Switch to register first
    fireEvent.press(getByTestId('register-tab'));
    expect(getByTestId('register-form')).toBeTruthy();
    
    // Switch back to login
    fireEvent.press(getByTestId('login-tab'));
    expect(getByTestId('login-form')).toBeTruthy();
  });

  it('should handle login form submission', async () => {
    const mockLogin = jest.fn().mockResolvedValue({});
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: jest.fn(),
      updateProfile: jest.fn(),
      logout: jest.fn(),
      loginError: null,
      registerError: null,
      updateProfileError: null,
    });

    const { getByTestId } = renderScreen();
    
    // Fill in login form
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    
    // Submit form
    fireEvent.press(getByTestId('login-button'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should handle register form submission', async () => {
    const mockRegister = jest.fn().mockResolvedValue({});
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: mockRegister,
      updateProfile: jest.fn(),
      logout: jest.fn(),
      loginError: null,
      registerError: null,
      updateProfileError: null,
    });

    const { getByTestId } = renderScreen();
    
    // Switch to register form
    fireEvent.press(getByTestId('register-tab'));
    
    // Fill in register form
    fireEvent.changeText(getByTestId('name-input'), 'Test User');
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    
    // Submit form
    fireEvent.press(getByTestId('register-button'));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show loading state during login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
      logout: jest.fn(),
      loginError: null,
      registerError: null,
      updateProfileError: null,
    });

    const { getByTestId } = renderScreen();
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should display login error', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
      logout: jest.fn(),
      loginError: new Error('Invalid credentials'),
      registerError: null,
      updateProfileError: null,
    });

    const { getByTestId } = renderScreen();
    
    expect(getByTestId('error-message')).toHaveTextContent('Invalid credentials');
  });

  it('should display register error', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
      logout: jest.fn(),
      loginError: null,
      registerError: new Error('Email already exists'),
      updateProfileError: null,
    });

    const { getByTestId } = renderScreen();
    
    // Switch to register form to see the error
    fireEvent.press(getByTestId('register-tab'));
    expect(getByTestId('error-message')).toHaveTextContent('Email already exists');
  });

  it('should validate email format', async () => {
    const { getByTestId } = renderScreen();
    
    // Enter invalid email
    fireEvent.changeText(getByTestId('email-input'), 'invalid-email');
    fireEvent.press(getByTestId('login-button'));
    
    await waitFor(() => {
      expect(getByTestId('email-error')).toHaveTextContent('Please enter a valid email');
    });
  });

  it('should validate password length', async () => {
    const { getByTestId } = renderScreen();
    
    // Enter short password
    fireEvent.changeText(getByTestId('password-input'), '123');
    fireEvent.press(getByTestId('login-button'));
    
    await waitFor(() => {
      expect(getByTestId('password-error')).toHaveTextContent('Password must be at least 6 characters');
    });
  });

  it('should validate required fields in register form', async () => {
    const { getByTestId } = renderScreen();
    
    // Switch to register form
    fireEvent.press(getByTestId('register-tab'));
    
    // Submit without filling required fields
    fireEvent.press(getByTestId('register-button'));
    
    await waitFor(() => {
      expect(getByTestId('name-error')).toHaveTextContent('Name is required');
      expect(getByTestId('email-error')).toHaveTextContent('Email is required');
      expect(getByTestId('password-error')).toHaveTextContent('Password is required');
    });
  });

  it('should navigate to main screen after successful login', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
      logout: jest.fn(),
      loginError: null,
      registerError: null,
      updateProfileError: null,
    });

    const { getByTestId } = renderScreen();
    
    // Should automatically navigate to main screen when authenticated
    await waitFor(() => {
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    });
  });

  it('should show password visibility toggle', () => {
    const { getByTestId } = renderScreen();
    
    const passwordInput = getByTestId('password-input');
    const toggleButton = getByTestId('password-toggle');
    
    // Password should be hidden by default (showPassword = false, so secureTextEntry = true)
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    fireEvent.press(toggleButton);
    // After toggle, password should be visible (showPassword = true, so secureTextEntry = false)
    expect(passwordInput.props.secureTextEntry).toBe(false);
    
    fireEvent.press(toggleButton);
    // After second toggle, password should be hidden again (showPassword = false, so secureTextEntry = true)
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});

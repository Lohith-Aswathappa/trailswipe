import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface OnboardingScreenProps {
  navigation: any;
  route: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user, isAuthenticated, isLoading, login, register, loginError, registerError } = useAuth();

  // Navigate to main screen when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TrailDiscovery' }],
      });
    }
  }, [isAuthenticated, user, navigation]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'register' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (activeTab === 'login') {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCurrentError = () => {
    return activeTab === 'login' ? loginError : registerError;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View testID="onboarding-screen" style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text testID="welcome-title" style={styles.title}>
              Welcome to TrailSwipe
            </Text>
            <Text testID="welcome-description" style={styles.subtitle}>
              Discover amazing hiking trails and connect with friends
            </Text>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              testID="login-tab"
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="register-tab"
              style={[styles.tab, activeTab === 'register' && styles.activeTab]}
              onPress={() => setActiveTab('register')}
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View testID="loading-indicator" style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976d2" />
            </View>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <View testID="login-form" style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  testID="email-input"
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && (
                  <Text testID="email-error" style={styles.errorText}>
                    {errors.email}
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    testID="password-input"
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    testID="password-toggle"
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text testID="password-error" style={styles.errorText}>
                    {errors.password}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                testID="login-button"
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <View testID="register-form" style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  testID="name-input"
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Full Name"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {errors.name && (
                  <Text testID="name-error" style={styles.errorText}>
                    {errors.name}
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  testID="email-input"
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && (
                  <Text testID="email-error" style={styles.errorText}>
                    {errors.email}
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    testID="password-input"
                    style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    testID="password-toggle"
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text testID="password-error" style={styles.errorText}>
                    {errors.password}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                testID="register-button"
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Message */}
          {getCurrentError() && (
            <View testID="error-message" style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {getCurrentError()?.message || 'An error occurred'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#1976d2',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff5252',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  passwordToggleText: {
    fontSize: 20,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
});

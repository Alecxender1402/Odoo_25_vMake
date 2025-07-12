import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/components/layout/Header";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: (user: User, token?: string) => void;
}

export const Login = ({ onLogin }: LoginPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('mode') === 'admin';
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-populate admin credentials if in admin mode
  useEffect(() => {
    if (isAdminMode && !isSignUp) {
      setFormData(prev => ({
        ...prev,
        email: 'admin@stackit.com',
        password: 'admin123'
      }));
    }
  }, [isAdminMode, isSignUp]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up logic
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        if (formData.username.trim() === '' || formData.password.trim() === '' || formData.email.trim() === '') {
          setError('All fields are required');
          setIsLoading(false);
          return;
        }
        
        await apiClient.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        toast({
          title: "Registration Successful!",
          description: "Please login with your credentials.",
        });

        setIsSignUp(false);
        resetForm();
      } else {
        // Sign in logic
        const response = await apiClient.login({
          email: formData.email,
          password: formData.password
        });
        
        // Store the token
        localStorage.setItem('token', response.token);
        
        // Call onLogin with user data and token
        onLogin({ 
          username: response.user.username, 
          role: response.user.role || 'user' 
        }, response.token);
        
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${response.user.username}!`,
        });
        
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login/Register error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={goBack}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Main Login Card */}
        <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-r from-primary to-primary-hover rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              {isAdminMode ? 'Admin Login' : (isSignUp ? 'Create Account' : 'Welcome Back')}
            </CardTitle>
            <CardDescription className="text-lg">
              {isAdminMode ? 'Sign in with admin credentials' : (isSignUp ? 'Join our community of developers' : 'Sign in to your account')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username (Sign Up only) */}
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <Input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11 border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="h-11 pr-10 border-gray-300 focus:border-primary focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            {!isAdminMode && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    onClick={toggleMode}
                    className="ml-1 text-primary hover:text-primary-hover font-medium transition-colors"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            )}

            {/* Admin Mode Indicator */}
            {isAdminMode && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Admin Mode • Use: admin@stackit.com / admin123
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

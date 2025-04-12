import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create context for authentication
export const AuthContext = createContext(null);

// Configure axios defaults
axios.defaults.withCredentials = true;

// Create Auth Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  
  const apiBaseUrl = "/api"; // Change to match your API URL

  // Set up axios interceptor for authentication
  useEffect(() => {
    // Add request interceptor for token
    const interceptor = axios.interceptors.request.use(
      (config) => {
        // Add token to headers if available
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Clean up
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check local storage for token
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
        try {
          // Verify token by getting user data
          const response = await axios.get(`${apiBaseUrl}/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });
          
          // Set user data
          setCurrentUser(response.data);
          setIsAuthenticated(true);
          setIsSubscribed(response.data.isSubscribed);
        } catch (error) {
          console.error("Authentication verification failed:", error);
          // Clear invalid token
          localStorage.removeItem("authToken");
          setToken(null);
        }
      }
      
      // Finished loading regardless of outcome
      setIsLoading(false);
    };

    checkAuth();
  }, [apiBaseUrl]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/login`, {
        email,
        password
      });

      if (response.data.success) {
        // Store token
        const responseToken = response.data.token;
        localStorage.setItem("authToken", responseToken);
        setToken(responseToken);
        
        // Update auth state
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        setIsSubscribed(response.data.user.isSubscribed);
        
        return { success: true };
      } else {
        return { success: false, error: "Login failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed. Please try again."
      };
    }
  };

  // Register function
  const register = async (email, password) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/register`, {
        email,
        password
      });

      if (response.data.success) {
        // Store token
        const responseToken = response.data.token;
        localStorage.setItem("authToken", responseToken);
        setToken(responseToken);
        
        // Update auth state
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        setIsSubscribed(false); // New users are not subscribed by default
        
        return { success: true };
      } else {
        return { success: false, error: "Registration failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed. Please try again."
      };
    }
  };

  // Register and subscribe in one step
  const registerAndSubscribe = async (email, password, paymentMethodId) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/register-and-subscribe`, {
        email,
        password,
        paymentMethodId
      });

      if (response.data.success) {
        // Store token
        const responseToken = response.data.token;
        localStorage.setItem("authToken", responseToken);
        setToken(responseToken);
        
        // Update auth state
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        setIsSubscribed(true);
        
        return {
          success: true,
          clientSecret: response.data.clientSecret,
          subscriptionId: response.data.subscriptionId
        };
      } else {
        return { success: false, error: "Registration and subscription failed" };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration and subscription failed. Please try again."
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional since we're using JWT tokens)
      await axios.post(`${apiBaseUrl}/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local token regardless of server response
      localStorage.removeItem("authToken");
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsSubscribed(false);
    }
  };

  // Check subscription status
  const checkSubscription = async () => {
    if (!isAuthenticated || !token) {
      return false;
    }

    try {
      const response = await axios.get(`${apiBaseUrl}/check-subscription`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const subStatus = response.data.isSubscribed;
      setIsSubscribed(subStatus);
      return subStatus;
    } catch (error) {
      console.error("Check subscription error:", error);
      return false;
    }
  };

  // Context value
  const contextValue = {
    currentUser,
    isAuthenticated,
    isSubscribed,
    isLoading,
    token,
    login,
    register,
    registerAndSubscribe,
    logout,
    checkSubscription
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
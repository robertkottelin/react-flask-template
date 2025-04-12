import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import ReactMarkdown from "react-markdown";

// Import authentication context
import { AuthContext } from './AuthContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

// Import components 
import { Icons } from './components/Icons';

import SubscriptionForm from './components/SubscriptionForm';


// Initialize Stripe with public key
const stripePromise = loadStripe('your_stripe_public_key'); // Replace with your Stripe public key

// Configure axios to include credentials with all requests
axios.defaults.withCredentials = true;

const App = () => {
  // Authentication context
  const { currentUser, isAuthenticated, isSubscribed, isLoading, logout, token } = useContext(AuthContext);

  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [isHowToUseVisible, setIsHowToUseVisible] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [serverHealth, setServerHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [serverHealthDetails, setServerHealthDetails] = useState(null);

  // Content state
  const [howToUseContent, setHowToUseContent] = useState("");
  const [aboutContent, setAboutContent] = useState("");
  
  const apiBaseUrl = "/api"; // Update to match your API URL

  // Check mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Load documentation from public directory
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/how-to-use.md`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Documentation file not found');
        }
        return response.text();
      })
      .then(text => setHowToUseContent(text))
      .catch(error => {
        console.error("Failed to load documentation:", error);
        // Fallback content
        setHowToUseContent("# How To Use\n\nDocumentation is currently unavailable.");
      });
  }, []);

  useEffect(() => {
    // Load about us content
    fetch(`${process.env.PUBLIC_URL}/about.md`)
      .then(response => {
        if (!response.ok) {
          throw new Error('About content not found');
        }
        return response.text();
      })
      .then(text => setAboutContent(text))
      .catch(error => {
        console.error("Failed to load about content:", error);
        // Fallback content
        setAboutContent("# About\n\nInformation is currently unavailable.");
      });
  }, []);

  const handleShowHowToUse = () => {
    setIsHowToUseVisible(true);
    setIsAboutVisible(false);
    setIsMobileMenuOpen(false);
  };

  const handleShowAbout = () => {
    setIsHowToUseVisible(false);
    setIsAboutVisible(true);
    setIsMobileMenuOpen(false);
  };

  const handleClosePopup = () => {
    setIsHowToUseVisible(false);
    setIsAboutVisible(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const checkServerHealth = async () => {
    setIsCheckingHealth(true);
    setServerHealthDetails(null);

    try {
      const response = await axios.get(`${apiBaseUrl}/health`);
      setServerHealth(response.data.status === "healthy");
      setServerHealthDetails({
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      setTimeout(() => {
        setServerHealth(null);
        setServerHealthDetails(null);
      }, 5000); // Extended display time to 5 seconds for better readability
    } catch (error) {
      console.error("Error checking server health:", error);
      setServerHealth(false);

      // Capture detailed error information
      setServerHealthDetails({
        status: error.response?.status || 'Network Error',
        statusText: error.response?.statusText || error.message,
        data: error.response?.data || {}
      });

      setTimeout(() => {
        setServerHealth(null);
        setServerHealthDetails(null);
      }, 5000);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    // Reload user data from context to update subscription status
    window.location.reload();
  };

  const handleCancelSubscription = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel your subscription? This action cannot be undone."
    );

    if (!confirmCancel) return;

    setIsCancelLoading(true);

    try {
      // Token is handled by axios interceptor in AuthContext
      const response = await axios.post(`${apiBaseUrl}/cancel-subscription`, {});

      if (response.data.success) {
        alert("Your subscription has been canceled.");
        // Refresh page to update auth context
        window.location.reload();
      } else {
        alert("Failed to cancel subscription. Please try again.");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert("Error canceling subscription. Check the console for details.");
    } finally {
      setIsCancelLoading(false);
    }
  };

  // Toggle auth modal visibility
  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
  };

  // Display loading indicator while auth state is determined
  if (isLoading) {
    return (
      <div className="loading-container">
        <div>
          <div className="spinner" />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Main App render - works for both authenticated and guest users
  return (
    <div className={`app ${isMobile ? 'mobile-app' : ''}`}>
      {/* Attribution element with bouncing animation */}
      <div className="attribution">
        Built by <a
          href="https://yourwebsite.com"
          target="_blank"
          rel="noopener noreferrer"
          className="attribution-link"
        >
          @YourName
        </a>
        <a
          href="https://twitter.com/YourTwitterHandle"
          target="_blank"
          rel="noopener noreferrer"
          className="attribution-sublink"
        >
          Send me a message about improvements and bug fixes
        </a>
      </div>
      <div className="decorative-bg"></div>
      {/* Decorative animated lines for cyberpunk effect */}
      <div className="decorative-line" style={{ top: "15%", animationDelay: "0s" }}></div>
      <div className="decorative-line" style={{ top: "35%", animationDelay: "0.5s" }}></div>
      <div className="decorative-line" style={{ top: "65%", animationDelay: "1s" }}></div>
      <div className="decorative-line" style={{ top: "85%", animationDelay: "1.5s" }}></div>

      <div className="container">
        {/* Top Action Buttons - Move before header for mobile */}
        <div className={`top-buttons-container ${isMobile ? 'mobile-center' : ''}`}>
          <button
            onClick={handleShowHowToUse}
            className="how-to-use-button float"
          >
            <span className="how-to-use-icon"><Icons.book /></span>
            How To Use
          </button>

          <button
            onClick={handleShowAbout}
            className="how-to-use-button float about-us-button"
          >
            <span className="how-to-use-icon"><Icons.info /></span>
            About
          </button>

          <button
            onClick={checkServerHealth}
            disabled={isCheckingHealth}
            className={`health-check-button float ${serverHealth === true ? 'health-success' :
              serverHealth === false ? 'health-error' : ''}`}
          >
            {isCheckingHealth ? (
              <>
                <span className="spin">
                  <Icons.spinner />
                </span>
                Checking...
              </>
            ) : (
              <>
                <div className="health-status-indicator">
                  {serverHealth === true && <span><Icons.checkmark /></span>}
                  {serverHealth === false && <span><Icons.warning /></span>}
                  {serverHealth === null && <span><Icons.info /></span>}
                  Server Health
                </div>

                {serverHealthDetails && (
                  <div className="health-details">
                    <div>Status: {serverHealthDetails.status}</div>
                    <div>
                      {serverHealthDetails.statusText}
                    </div>
                  </div>
                )}
              </>
            )}
          </button>

          {/* Conditional login/logout buttons */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="button logout-button float"
            >
              <Icons.close />
              Logout
            </button>
          ) : (
            <button
              onClick={toggleAuthModal}
              className="button login-button float"
            >
              <Icons.verified />
              Login / Register
            </button>
          )}

          {isSubscribed && (
            <button
              onClick={handleCancelSubscription}
              disabled={isCancelLoading}
              className={`cancel-subscription-button float ${isCancelLoading ? 'disabled' : ''}`}
            >
              {isCancelLoading ? (
                <>
                  <span className="spin cancel-subscription-icon">
                    <Icons.spinner />
                  </span>
                  Cancelling...
                </>
              ) : (
                <>
                  <span className="cancel-subscription-icon"><Icons.cancel /></span>
                  Cancel Subscription
                </>
              )}
            </button>
          )}
        </div>

        {/* App Header - Now comes after buttons in the DOM */}
        <header className="header">
          <h1 className="header-title">Your Application Name</h1>
          <p className="header-subtitle">
            Your application description or tagline
          </p>
        </header>

        {/* Subscription Form or Welcome Message */}
        <div className={`fade-in glass card ${isSubscribed ? 'card-with-glow' : ''} ${isMobile ? 'mobile-smaller-padding' : ''}`}>
          {!isSubscribed ? (
            <div className={`subscription-form ${isMobile ? 'mobile-smaller-padding' : ''}`}>
              <Elements stripe={stripePromise}>
                <SubscriptionForm
                  onSuccess={handleSubscriptionSuccess}
                  isMobile={isMobile}
                  isAuthenticated={isAuthenticated}
                />
              </Elements>
            </div>
          ) : (
            <div className={`welcome-message ${isMobile ? 'mobile-stack mobile-text-center' : ''}`}>
              <div className="welcome-icon">
                <Icons.verified />
              </div>
              <p>Welcome, <strong>{currentUser.email}</strong>! You have full access to all premium features with your subscription.</p>
            </div>
          )}
        </div>

        {/* Main Content Section */}
        <section className="section">
          <h2 className="section-title">
            Main Content Area
            <span className="section-title-underline"></span>
          </h2>
          
          {/* Your main application content goes here */}
          <div className="content-wrapper glass">
            <div className="content-area">
              <h3>Your Application Content</h3>
              <p>This is where the main features of your application would be displayed.</p>
              <p>Replace this with your actual application content.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
        >
          <Icons.menu />
        </button>
      )}

      {/* Mobile Navigation Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-nav">
          <button
            className="mobile-nav-button"
            onClick={handleShowHowToUse}
          >
            <span className="mobile-nav-icon"><Icons.book /></span>
            How To Use
          </button>
          <button
            className="mobile-nav-button"
            onClick={handleShowAbout}
          >
            <span className="mobile-nav-icon"><Icons.info /></span>
            About
          </button>
          <button
            className="mobile-nav-button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              checkServerHealth();
            }}
            disabled={isCheckingHealth}
          >
            <span className="mobile-nav-icon">
              {isCheckingHealth ? <Icons.spinner /> :
                (serverHealth === true ? <Icons.checkmark /> :
                  (serverHealth === false ? <Icons.warning /> : <Icons.info />))}
            </span>
            Health
            {serverHealthDetails && (
              <div className="health-tooltip">
                {serverHealthDetails.status}: {serverHealthDetails.statusText}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Authentication Modal for Login/Register */}
      {showAuthModal && (
        <div className="popup">
          <div
            className={`popup-content glass ${isMobile ? 'mobile-smaller-padding' : ''}`}
          >
            <button
              onClick={toggleAuthModal}
              className="popup-close"
            >
              <Icons.close />
            </button>

            <div className="popup-scroll">
              {showLoginForm ? (
                <LoginForm
                  toggleForm={() => setShowLoginForm(false)}
                  onAuthSuccess={toggleAuthModal}
                />
              ) : (
                <RegisterForm
                  toggleForm={() => setShowLoginForm(true)}
                  onAuthSuccess={toggleAuthModal}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* How To Use Popup */}
      {isHowToUseVisible && (
        <div className="popup">
          <div
            className={`popup-content glass ${isMobile ? 'mobile-smaller-padding' : ''}`}
          >
            <button
              onClick={handleClosePopup}
              className="popup-close"
            >
              <Icons.close />
            </button>

            <div className="popup-scroll">
              <ReactMarkdown>
                {howToUseContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* About Popup */}
      {isAboutVisible && (
        <div className="popup">
          <div
            className={`popup-content glass ${isMobile ? 'mobile-smaller-padding' : ''}`}
          >
            <button
              onClick={handleClosePopup}
              className="popup-close"
            >
              <Icons.close />
            </button>

            <div className="popup-scroll">
              <ReactMarkdown>
                {aboutContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
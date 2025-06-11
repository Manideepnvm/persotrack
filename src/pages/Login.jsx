import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner,
  InputGroup,
  Modal
} from 'react-bootstrap';
import { 
  FaEye, 
  FaEyeSlash, 
  FaGoogle, 
  FaFacebook, 
  FaEnvelope, 
  FaLock,
  FaUser,
  FaExclamationTriangle
} from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { 
    login, 
    loginWithGoogle, 
    loginWithFacebook, 
    resetPassword, 
    currentUser, 
    loading, 
    error, 
    clearError 
  } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Reset password modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard'); // Change to your desired route
    }
  }, [currentUser, navigate]);

  // Clear error when component mounts or form changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('lastLoginEmail', formData.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('lastLoginEmail');
        }
        
        navigate('/dashboard'); // Change to your desired route
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Facebook login
  const handleFacebookLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithFacebook();
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Facebook login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }
    
    setResetLoading(true);
    setResetError('');
    
    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        setResetMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setShowResetModal(false);
          setResetMessage('');
          setResetEmail('');
        }, 3000);
      }
    } catch (err) {
      setResetError('Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('lastLoginEmail');
    const shouldRemember = localStorage.getItem('rememberMe') === 'true';
    
    if (shouldRemember && rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '60px', height: '60px' }}>
                  <FaUser className="text-white" size={24} />
                </div>
                <h2 className="fw-bold text-primary mb-2">Welcome Back!</h2>
                <p className="text-muted">Please sign in to your account</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="danger" className="d-flex align-items-center mb-4" dismissible onClose={clearError}>
                  <FaExclamationTriangle className="me-2" />
                  <div>
                    <strong>Login Failed:</strong> {error.message}
                  </div>
                </Alert>
              )}

              {/* Login Form */}
              <Form onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaEnvelope className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      isInvalid={!!formErrors.email}
                      className="border-start-0 ps-0"
                      disabled={isSubmitting || loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.email}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaLock className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      isInvalid={!!formErrors.password}
                      className="border-start-0 border-end-0 ps-0"
                      disabled={isSubmitting || loading}
                    />
                    <InputGroup.Text 
                      className="bg-light border-start-0 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                    >
                      {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                    </InputGroup.Text>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Remember Me & Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isSubmitting || loading}
                  />
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={() => {
                      setShowResetModal(true);
                      setResetEmail(formData.email);
                    }}
                    disabled={isSubmitting || loading}
                  >
                    Forgot Password?
                  </Button>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 mb-3 rounded-pill fw-semibold"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Form>

              {/* Divider */}
              <div className="text-center my-4">
                <div className="d-flex align-items-center">
                  <hr className="flex-grow-1" />
                  <span className="px-3 text-muted small">OR</span>
                  <hr className="flex-grow-1" />
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="d-grid gap-2 mb-4">
                <Button
                  variant="outline-danger"
                  size="lg"
                  className="rounded-pill fw-semibold"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || loading}
                >
                  <FaGoogle className="me-2" />
                  Continue with Google
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="rounded-pill fw-semibold"
                  onClick={handleFacebookLogin}
                  disabled={isSubmitting || loading}
                >
                  <FaFacebook className="me-2" />
                  Continue with Facebook
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="mb-0 text-muted">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary text-decoration-none fw-semibold">
                    Sign up here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Password Reset Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resetMessage ? (
            <Alert variant="success" className="d-flex align-items-center">
              <FaEnvelope className="me-2" />
              {resetMessage}
            </Alert>
          ) : (
            <>
              <p className="text-muted mb-3">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <Form.Group>
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetError('');
                  }}
                  placeholder="Enter your email"
                  isInvalid={!!resetError}
                  disabled={resetLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {resetError}
                </Form.Control.Feedback>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        {!resetMessage && (
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowResetModal(false)}
              disabled={resetLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePasswordReset}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </Container>
  );
};

export default Login;
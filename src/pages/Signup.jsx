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
  ProgressBar
} from 'react-bootstrap';
import { 
  FaEye, 
  FaEyeSlash, 
  FaGoogle, 
  FaFacebook, 
  FaEnvelope, 
  FaLock,
  FaUser,
  FaPhone,
  FaCalendar,
  FaUserPlus,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const Signup = () => {
  const navigate = useNavigate();
  const { 
    signup, 
    loginWithGoogle, 
    loginWithFacebook, 
    currentUser, 
    loading, 
    error, 
    clearError 
  } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (passwordStrength < 75) {
      errors.password = 'Password is too weak. Include uppercase, lowercase, numbers, and special characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms agreement validation
    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
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
    
    // Calculate password strength for password field
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
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
      // Create user account with enhanced options
      const result = await signup(formData.email, formData.password, {
        displayName: `${formData.firstName} ${formData.lastName}`,
        sendVerificationEmail: true,
        enforceStrongPassword: true
      });
      
      if (result.success) {
        // Save additional user profile data to Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email,
          phone: formData.phone || '',
          dateOfBirth: formData.dateOfBirth || '',
          displayName: `${formData.firstName} ${formData.lastName}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          profileCompleted: true,
          emailVerified: false,
          preferences: {
            notifications: true,
            theme: 'light',
            language: 'en'
          }
        });
        
        // Navigate to verification page or dashboard
        navigate('/verify-email'); // Change to your desired route
      }
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google signup
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        // If it's a new user, create profile in Firestore
        if (result.isNewUser) {
          const names = result.user.displayName ? result.user.displayName.split(' ') : ['', ''];
          await setDoc(doc(db, 'users', result.user.uid), {
            firstName: names[0] || 'User',
            lastName: names.slice(1).join(' ') || '',
            email: result.user.email,
            displayName: result.user.displayName || 'User',
            photoURL: result.user.photoURL || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            profileCompleted: true,
            emailVerified: result.user.emailVerified,
            provider: 'google',
            preferences: {
              notifications: true,
              theme: 'light',
              language: 'en'
            }
          });
        }
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Facebook signup
  const handleFacebookSignup = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithFacebook();
      if (result.success) {
        // If it's a new user, create profile in Firestore
        if (result.isNewUser) {
          const names = result.user.displayName ? result.user.displayName.split(' ') : ['', ''];
          await setDoc(doc(db, 'users', result.user.uid), {
            firstName: names[0] || 'User',
            lastName: names.slice(1).join(' ') || '',
            email: result.user.email,
            displayName: result.user.displayName || 'User',
            photoURL: result.user.photoURL || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            profileCompleted: true,
            emailVerified: result.user.emailVerified,
            provider: 'facebook',
            preferences: {
              notifications: true,
              theme: 'light',
              language: 'en'
            }
          });
        }
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Facebook signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get password strength color and text
  const getPasswordStrengthInfo = () => {
    if (passwordStrength === 0) return { color: 'secondary', text: '' };
    if (passwordStrength < 25) return { color: 'danger', text: 'Very Weak' };
    if (passwordStrength < 50) return { color: 'warning', text: 'Weak' };
    if (passwordStrength < 75) return { color: 'info', text: 'Good' };
    return { color: 'success', text: 'Strong' };
  };

  const strengthInfo = getPasswordStrengthInfo();

  return (
    <div 
      className="min-vh-100 d-flex align-items-center py-5"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} md={10} sm={12}>
            {/* Header */}
            <div className="text-center mb-4">
              <div 
                className="d-inline-block rounded-circle p-3 mb-3"
                style={{
                  background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
              >
                <FaUserPlus className="text-white" size={32} />
              </div>
              <h2 className="text-white fw-bold mb-2">Join PersoTrack!</h2>
              <p className="text-white-50">Create your account and start managing your finances</p>
            </div>

            <Card 
              className="shadow-lg border-0"
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-dark">Create Account</h3>
                  <p className="text-muted">Fill in your details to get started</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4" dismissible onClose={clearError}>
                    <FaExclamationTriangle className="me-2" />
                    <div>
                      <strong>Registration Failed:</strong> {error.message}
                    </div>
                  </Alert>
                )}

                {/* Social Signup Buttons */}
                <div className="d-grid gap-2 mb-4">
                  <Button
                    variant="outline-danger"
                    size="lg"
                    className="rounded-pill fw-semibold"
                    onClick={handleGoogleSignup}
                    disabled={isSubmitting || loading}
                  >
                    <FaGoogle className="me-2" />
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="rounded-pill fw-semibold"
                    onClick={handleFacebookSignup}
                    disabled={isSubmitting || loading}
                  >
                    <FaFacebook className="me-2" />
                    Continue with Facebook
                  </Button>
                </div>

                {/* Divider */}
                <div className="text-center my-4">
                  <div className="d-flex align-items-center">
                    <hr className="flex-grow-1" />
                    <span className="px-3 text-muted small">OR</span>
                    <hr className="flex-grow-1" />
                  </div>
                </div>

                {/* Signup Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">First Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <FaUser className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter first name"
                            isInvalid={!!formErrors.firstName}
                            className="border-start-0 ps-0"
                            disabled={isSubmitting || loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.firstName}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Last Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <FaUser className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter last name"
                            isInvalid={!!formErrors.lastName}
                            className="border-start-0 ps-0"
                            disabled={isSubmitting || loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.lastName}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

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

                  {/* Phone and Date of Birth */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Phone Number <small className="text-muted">(Optional)</small></Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <FaPhone className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            isInvalid={!!formErrors.phone}
                            className="border-start-0 ps-0"
                            disabled={isSubmitting || loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formErrors.phone}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Date of Birth <small className="text-muted">(Optional)</small></Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <FaCalendar className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="border-start-0 ps-0"
                            disabled={isSubmitting || loading}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Password Fields */}
                  <Row>
                    <Col md={6}>
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
                            placeholder="Create password"
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
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="mt-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">Password Strength:</small>
                              <small className={`text-${strengthInfo.color} fw-semibold`}>
                                {strengthInfo.text}
                              </small>
                            </div>
                            <ProgressBar 
                              variant={strengthInfo.color} 
                              now={passwordStrength} 
                              style={{ height: '4px' }}
                            />
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-end-0">
                            <FaLock className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm password"
                            isInvalid={!!formErrors.confirmPassword}
                            className="border-start-0 border-end-0 ps-0"
                            disabled={isSubmitting || loading}
                          />
                          <InputGroup.Text 
                            className="bg-light border-start-0 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ cursor: 'pointer' }}
                          >
                            {showConfirmPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                          </InputGroup.Text>
                          <Form.Control.Feedback type="invalid">
                            {formErrors.confirmPassword}
                          </Form.Control.Feedback>
                        </InputGroup>
                        {/* Password Match Indicator */}
                        {formData.confirmPassword && (
                          <div className="mt-1">
                            <small className={formData.password === formData.confirmPassword ? 'text-success' : 'text-danger'}>
                              <FaCheckCircle className="me-1" />
                              {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                            </small>
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Terms and Conditions */}
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (formErrors.terms) {
                          setFormErrors(prev => ({ ...prev, terms: '' }));
                        }
                      }}
                      isInvalid={!!formErrors.terms}
                      label={
                        <span>
                          I agree to the{' '}
                          <Link to="/terms" className="text-primary text-decoration-none">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-primary text-decoration-none">
                            Privacy Policy
                          </Link>
                        </span>
                      }
                      disabled={isSubmitting || loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.terms}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 mb-3 rounded-pill fw-semibold"
                    disabled={isSubmitting || loading}
                    style={{
                      background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
                    }}
                  >
                    {isSubmitting || loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="me-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                {/* Login Link */}
                <div className="text-center">
                  <p className="mb-0 text-muted">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-primary text-decoration-none fw-semibold"
                    >
                      Sign In Here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0">
                © 2025 PersoTrack. Your financial journey starts here.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;
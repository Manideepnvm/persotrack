import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { signUp } from '../firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Create user account
      const userCredential = await signUp(formData.email, formData.password);
      
      // Save user profile data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        createdAt: new Date(),
        profileCompleted: true
      });

    } catch (error) {
      console.error('Signup error:', error);
      setError('Failed to create account. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center py-5"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg={6} md={8} sm={10}>
            {/* Logo/Brand Section */}
            <div className="text-center mb-4">
              <div 
                className="d-inline-block rounded-circle p-3 mb-3"
                style={{
                  background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
              >
                <h1 className="text-white mb-0" style={{ fontSize: '2.5rem' }}>🚀</h1>
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

                {error && (
                  <Alert 
                    variant="danger" 
                    className="border-0"
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)'
                    }}
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">
                          <i className="bi bi-person-fill me-2 text-primary"></i>
                          First Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                          required
                          className="border-0 shadow-sm"
                          style={{
                            borderRadius: '12px',
                            padding: '12px 16px',
                            background: '#f8f9ff'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">
                          <i className="bi bi-person-fill me-2 text-success"></i>
                          Last Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                          required
                          className="border-0 shadow-sm"
                          style={{
                            borderRadius: '12px',
                            padding: '12px 16px',
                            background: '#f8f9ff'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">
                      <i className="bi bi-envelope-fill me-2 text-info"></i>
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="border-0 shadow-sm"
                      style={{
                        borderRadius: '12px',
                        padding: '12px 16px',
                        background: '#f8f9ff'
                      }}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">
                          <i className="bi bi-phone-fill me-2 text-warning"></i>
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className="border-0 shadow-sm"
                          style={{
                            borderRadius: '12px',
                            padding: '12px 16px',
                            background: '#f8f9ff'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">
                          <i className="bi bi-calendar-fill me-2 text-danger"></i>
                          Date of Birth
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="border-0 shadow-sm"
                          style={{
                            borderRadius: '12px',
                            padding: '12px 16px',
                            background: '#f8f9ff'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-dark">
                          <i className="bi bi-lock-fill me-2 text-primary"></i>
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create password"
                          required
                          className="border-0 shadow-sm"
                          style={{
                            borderRadius: '12px',
                            padding: '12px 16px',
                            background: '#f8f9ff'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-dark">
                          <i className="bi bi-shield-check-fill me-2 text-success"></i>
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          required
                          className="border-0 shadow-sm"
                          style={{
                            borderRadius: '12px',
                            padding: '12px 16px',
                            background: '#f8f9ff'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 border-0 fw-semibold"
                    style={{
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '16px',
                      background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                      boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus-fill me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-decoration-none fw-semibold"
                      style={{ color: '#4ECDC4' }}
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


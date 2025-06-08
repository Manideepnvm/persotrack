import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { signIn } from '../firebase/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      await signIn(formData.email, formData.password);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to log in. Please check your credentials.');
    }

    setLoading(false);
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg={5} md={7} sm={9}>
            {/* Logo/Brand Section */}
            <div className="text-center mb-4">
              <div 
                className="d-inline-block rounded-circle p-3 mb-3"
                style={{
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
              >
                <h1 className="text-white mb-0" style={{ fontSize: '2.5rem' }}>💰</h1>
              </div>
              <h2 className="text-white fw-bold mb-2">Welcome Back!</h2>
              <p className="text-white-50">Sign in to your PersoTrack account</p>
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
                  <h3 className="fw-bold text-dark">Sign In</h3>
                  <p className="text-muted">Enter your credentials to continue</p>
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
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">
                      <i className="bi bi-envelope-fill me-2 text-primary"></i>
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
                        fontSize: '16px',
                        background: '#f8f9ff'
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">
                      <i className="bi bi-lock-fill me-2 text-success"></i>
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="border-0 shadow-sm"
                      style={{
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        background: '#f8f9ff'
                      }}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 border-0 fw-semibold"
                    style={{
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '16px',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="text-decoration-none fw-semibold"
                      style={{ color: '#667eea' }}
                    >
                      Sign Up Here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <p className="text-white-50 small mb-0">
                © 2025 PersoTrack. Manage your finances with style.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
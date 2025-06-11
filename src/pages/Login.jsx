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
      className="min-vh-100 d-flex align-items-center position-relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 70%, #0e3460 100%)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif"
      }}
    >
      {/* Electric Lightning Background Effects */}
      <div 
        className="position-absolute w-100 h-100"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 10%, rgba(77, 208, 225, 0.08) 0%, transparent 50%)
          `,
          zIndex: 1
        }}
      />
      
      {/* Animated Lightning Streaks */}
      <div 
        className="position-absolute"
        style={{
          top: '10%',
          left: '15%',
          width: '2px',
          height: '30%',
          background: 'linear-gradient(180deg, transparent 0%, #00d4ff 50%, transparent 100%)',
          boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff',
          animation: 'lightning 3s ease-in-out infinite alternate',
          zIndex: 2
        }}
      />
      
      <div 
        className="position-absolute"
        style={{
          top: '60%',
          right: '20%',
          width: '1px',
          height: '25%',
          background: 'linear-gradient(180deg, transparent 0%, #4dd0e1 50%, transparent 100%)',
          boxShadow: '0 0 15px #4dd0e1, 0 0 30px #4dd0e1',
          animation: 'lightning 4s ease-in-out infinite alternate-reverse',
          zIndex: 2
        }}
      />

      <Container className="position-relative" style={{ zIndex: 3 }}>
        <Row className="justify-content-center">
          <Col lg={5} md={7} sm={9}>
            {/* Logo/Brand Section */}
            <div className="text-center mb-5">
              <div 
                className="d-inline-block rounded-circle p-4 mb-4 position-relative"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0f4c75 100%)',
                  boxShadow: '0 0 40px rgba(0, 212, 255, 0.4), 0 10px 30px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(0, 255, 255, 0.3)'
                }}
              >
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 rounded-circle"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                />
                <h1 className="text-white mb-0 position-relative" style={{ fontSize: '3rem', textShadow: '0 0 20px #00d4ff' }}>
                  ⚡
                </h1>
              </div>
              <h2 className="text-white fw-bold mb-2 position-relative" style={{ 
                fontSize: '2.5rem',
                textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
              }}>
                Welcome Back!
              </h2>
              <p className="mb-0" style={{ 
                color: '#4dd0e1',
                fontSize: '1.1rem',
                textShadow: '0 0 10px rgba(77, 208, 225, 0.3)'
              }}>
                Sign in to your PersoTrack account
              </p>
            </div>

            <Card 
              className="shadow-lg border-0 position-relative overflow-hidden"
              style={{
                borderRadius: '24px',
                background: 'rgba(10, 10, 10, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                boxShadow: '0 0 60px rgba(0, 212, 255, 0.1), 0 20px 40px rgba(0,0,0,0.3)'
              }}
            >
              {/* Card Glow Effect */}
              <div 
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }}
              />
              
              <Card.Body className="p-5 position-relative">
                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-2" style={{ 
                    color: '#00d4ff',
                    fontSize: '1.8rem',
                    textShadow: '0 0 15px rgba(0, 212, 255, 0.3)'
                  }}>
                    Sign In
                  </h3>
                  <p style={{ color: '#4dd0e1', fontSize: '1rem' }}>
                    Enter your credentials to continue
                  </p>
                </div>

                {error && (
                  <Alert 
                    variant="danger" 
                    className="border-0 mb-4"
                    style={{
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(238, 90, 36, 0.2) 100%)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      color: '#ff6b6b',
                      boxShadow: '0 0 20px rgba(255, 107, 107, 0.1)'
                    }}
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold mb-3" style={{ color: '#4dd0e1', fontSize: '1rem' }}>
                      <i className="bi bi-envelope-fill me-2" style={{ color: '#00d4ff' }}></i>
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
                        borderRadius: '16px',
                        padding: '16px 20px',
                        fontSize: '16px',
                        background: 'rgba(22, 33, 62, 0.6)',
                        color: '#ffffff',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid #00d4ff';
                        e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3), inset 0 2px 10px rgba(0,0,0,0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(0, 212, 255, 0.2)';
                        e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.3)';
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label className="fw-semibold mb-3" style={{ color: '#4dd0e1', fontSize: '1rem' }}>
                      <i className="bi bi-lock-fill me-2" style={{ color: '#00d4ff' }}></i>
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
                        borderRadius: '16px',
                        padding: '16px 20px',
                        fontSize: '16px',
                        background: 'rgba(22, 33, 62, 0.6)',
                        color: '#ffffff',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '1px solid #00d4ff';
                        e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3), inset 0 2px 10px rgba(0,0,0,0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(0, 212, 255, 0.2)';
                        e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.3)';
                      }}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 border-0 fw-semibold position-relative overflow-hidden"
                    style={{
                      borderRadius: '16px',
                      padding: '16px',
                      fontSize: '16px',
                      background: 'linear-gradient(135deg, #00d4ff 0%, #0f4c75 100%)',
                      boxShadow: '0 0 30px rgba(0, 212, 255, 0.4), 0 10px 20px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      textShadow: '0 0 10px rgba(255,255,255,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 0 40px rgba(0, 212, 255, 0.6), 0 15px 25px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.4), 0 10px 20px rgba(0,0,0,0.2)';
                    }}
                  >
                    {/* Button Glow Effect */}
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                      }}
                    />
                    
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

                <div className="position-relative my-4">
                  <hr style={{ 
                    border: 'none',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.3) 50%, transparent 100%)'
                  }} />
                  <div 
                    className="position-absolute top-50 start-50 translate-middle px-3"
                    style={{ 
                      background: 'rgba(10, 10, 10, 0.7)',
                      color: '#4dd0e1'
                    }}
                  >
                    <i className="bi bi-lightning-charge"></i>
                  </div>
                </div>

                <div className="text-center">
                  <p className="mb-0" style={{ color: '#4dd0e1' }}>
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="text-decoration-none fw-semibold position-relative"
                      style={{ 
                        color: '#00d4ff',
                        textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.textShadow = '0 0 15px rgba(0, 212, 255, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.textShadow = '0 0 10px rgba(0, 212, 255, 0.3)';
                      }}
                    >
                      Sign Up Here
                      <span 
                        className="position-absolute bottom-0 start-0 w-100"
                        style={{
                          height: '1px',
                          background: 'linear-gradient(90deg, transparent 0%, #00d4ff 50%, transparent 100%)',
                          transform: 'scaleX(0)',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <p className="small mb-0" style={{ 
                color: 'rgba(77, 208, 225, 0.6)',
                textShadow: '0 0 5px rgba(77, 208, 225, 0.2)'
              }}>
                <i className="bi bi-shield-lock me-2"></i>
                © 2025 PersoTrack. Manage your finances with electric precision.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @keyframes lightning {
          0% { opacity: 0.4; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0.6; transform: scaleY(0.9); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
        
        .form-control::placeholder {
          color: rgba(77, 208, 225, 0.5) !important;
        }
        
        .form-control:focus {
          background: rgba(22, 33, 62, 0.8) !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
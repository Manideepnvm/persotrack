// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { updateProfile, updatePassword } from 'firebase/auth';

const UserProfile = ({ show, handleClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    displayName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    occupation: '',
    bio: '',
    profilePicture: ''
  });
  
  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData({
              displayName: userData.displayName || currentUser.displayName || '',
              phone: userData.phone || '',
              address: userData.address || '',
              dateOfBirth: userData.dateOfBirth || '',
              occupation: userData.occupation || '',
              bio: userData.bio || '',
              profilePicture: userData.profilePicture || ''
            });
          } else {
            // Initialize with current user data
            setProfileData(prev => ({
              ...prev,
              displayName: currentUser.displayName || ''
            }));
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };

    if (show && currentUser) {
      loadUserProfile();
    }
  }, [currentUser, show]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: profileData.displayName
      });

      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...profileData,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(currentUser, passwordData.newPassword);
      setMessage('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Failed to update password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-gradient text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <Modal.Title>
          <i className="fas fa-user-circle me-2"></i>
          User Profile
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        {/* Profile Header Card */}
        <Card className="border-0 rounded-0">
          <Card.Body className="bg-light text-center py-4">
            <div className="profile-avatar mb-3">
              <div 
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                  fontSize: '2rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : 
                 currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <h5 className="mb-1">{profileData.displayName || 'User'}</h5>
            <p className="text-muted mb-2">{currentUser?.email}</p>
            <Badge bg="success" className="mb-2">
              <i className="fas fa-check-circle me-1"></i>
              Verified Account
            </Badge>
          </Card.Body>
        </Card>

        {/* Navigation Tabs */}
        <div className="px-3 pt-3">
          <ul className="nav nav-pills nav-justified mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
                style={{
                  background: activeTab === 'profile' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'profile' ? 'white' : '#6c757d'
                }}
              >
                <i className="fas fa-user me-2"></i>
                Profile Info
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
                style={{
                  background: activeTab === 'security' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'security' ? 'white' : '#6c757d'
                }}
              >
                <i className="fas fa-lock me-2"></i>
                Security
              </button>
            </li>
          </ul>
        </div>

        {/* Messages */}
        <div className="px-3">
          {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        </div>

        {/* Tab Content */}
        <div className="px-3 pb-3">
          {activeTab === 'profile' && (
            <Form onSubmit={handleProfileUpdate}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">
                      <i className="fas fa-user me-2"></i>Display Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      placeholder="Enter your display name"
                      className="form-control-lg"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">
                      <i className="fas fa-phone me-2"></i>Phone Number
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="form-control-lg"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">
                      <i className="fas fa-calendar me-2"></i>Date of Birth
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-control-lg"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">
                      <i className="fas fa-briefcase me-2"></i>Occupation
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="occupation"
                      value={profileData.occupation}
                      onChange={handleInputChange}
                      placeholder="Enter your occupation"
                      className="form-control-lg"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-primary">
                  <i className="fas fa-map-marker-alt me-2"></i>Address
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className="form-control-lg"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold text-primary">
                  <i className="fas fa-info-circle me-2"></i>Bio
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  className="form-control-lg"
                />
              </Form.Group>

              <div className="d-grid">
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}

          {activeTab === 'security' && (
            <Form onSubmit={handlePasswordChange}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-primary">
                  <i className="fas fa-key me-2"></i>New Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter new password"
                  className="form-control-lg"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-primary">
                  <i className="fas fa-key me-2"></i>Confirm New Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Confirm new password"
                  className="form-control-lg"
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shield-alt me-2"></i>
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          size="lg"
        >
          <i className="fas fa-times me-2"></i>Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserProfile;
import React, { useState, useEffect } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown, Badge, Button, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { db } from '../firebase/firebaseConfig';


const Navbar = ({ onShowProfile }) => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    return currentUser?.email || 'User';
  };

  return (
    <>
      <BootstrapNavbar 
        expand="lg" 
        className="shadow-sm border-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Container>
          <BootstrapNavbar.Brand 
            href="#" 
            className="fw-bold text-white d-flex align-items-center"
            style={{ fontSize: '1.5rem' }}
          >
            <span 
              className="me-2 p-2 rounded-circle"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              💰
            </span>
            PersoTrack
          </BootstrapNavbar.Brand>

          <BootstrapNavbar.Toggle 
            aria-controls="offcanvasNavbar" 
            className="border-0"
            style={{ boxShadow: 'none' }}
            onClick={() => setShowOffcanvas(true)}
          />

          <BootstrapNavbar.Collapse id="basic-navbar-nav" className="d-none d-lg-block">
            <Nav className="me-auto">
              <Nav.Link 
                href="#dashboard" 
                className="text-white fw-semibold mx-2"
                style={{ transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Nav.Link>
            </Nav>

            <Nav className="align-items-center">
              {/* Notification Bell */}
              <Button
                variant="outline-light"
                className="me-3 border-0 position-relative"
                style={{
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <i className="bi bi-bell"></i>
                <Badge 
                  pill 
                  bg="danger" 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.6rem' }}
                >
                  3
                </Badge>
              </Button>

              {/* User Profile Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="outline-light"
                  id="dropdown-user"
                  className="border-0 d-flex align-items-center"
                  style={{
                    borderRadius: '50px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {getInitials()}
                  </div>
                  <span className="d-none d-md-inline text-white">
                    {userProfile?.firstName || 'User'}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu 
                  className="border-0 shadow-lg"
                  style={{
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    minWidth: '250px'
                  }}
                >
                  <div className="px-3 py-2 border-bottom">
                    <div className="fw-bold text-dark">{getDisplayName()}</div>
                    <small className="text-muted">{currentUser?.email}</small>
                  </div>

                  <Dropdown.Item 
                    onClick={onShowProfile}
                    className="py-2"
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-person-circle me-2 text-primary"></i>
                    View Profile
                  </Dropdown.Item>

                  <Dropdown.Item 
                    href="#settings" 
                    className="py-2"
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-gear me-2 text-success"></i>
                    Settings
                  </Dropdown.Item>

                  <Dropdown.Item 
                    href="#help" 
                    className="py-2"
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-question-circle me-2 text-info"></i>
                    Help & Support
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item 
                    onClick={handleLogout}
                    className="py-2 text-danger"
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas 
        show={showOffcanvas} 
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        className="d-lg-none"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Offcanvas.Header closeButton className="text-white">
          <Offcanvas.Title className="text-white fw-bold">
            <span className="me-2">💰</span>
            PersoTrack
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column h-100">
            {/* User Info */}
            <div className="text-center mb-4 p-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
              >
                {getInitials()}
              </div>
              <div className="text-white fw-bold">{getDisplayName()}</div>
              <small className="text-white-50">{currentUser?.email}</small>
            </div>

            {/* Menu Items */}
            <Nav className="flex-column">
              <Nav.Link 
                href="#dashboard" 
                className="text-white py-3 border-bottom border-white-50"
                onClick={() => setShowOffcanvas(false)}
              >
                <i className="bi bi-speedometer2 me-3"></i>
                Dashboard
              </Nav.Link>
              <Nav.Link 
                onClick={() => {
                  onShowProfile();
                  setShowOffcanvas(false);
                }}
                className="text-white py-3 border-bottom border-white-50"
              >
                <i className="bi bi-person-circle me-3"></i>
                Profile
              </Nav.Link>
              <Nav.Link 
                href="#settings" 
                className="text-white py-3 border-bottom border-white-50"
                onClick={() => setShowOffcanvas(false)}
              >
                <i className="bi bi-gear me-3"></i>
                Settings
              </Nav.Link>
              <Nav.Link 
                href="#help" 
                className="text-white py-3 border-bottom border-white-50"
                onClick={() => setShowOffcanvas(false)}
              >
                <i className="bi bi-question-circle me-3"></i>
                Help
              </Nav.Link>
            </Nav>

            {/* Logout Button */}
            <div className="mt-auto">
              <Button 
                variant="outline-light" 
                className="w-100 fw-semibold"
                onClick={handleLogout}
                style={{
                  borderRadius: '12px',
                  padding: '12px'
                }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Button>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Navbar;
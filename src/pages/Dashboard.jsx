// src/pages/Dashboard.jsx - Enhanced Colorful Dashboard
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Charts from '../components/Charts';
import UserProfile from '../components/UserProfile';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  });

  // Load transactions
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('transactionDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionList = [];
      querySnapshot.forEach((doc) => {
        transactionList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTransactions(transactionList);
      calculateStats(transactionList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Calculate statistics
  const calculateStats = (transactionList) => {
    const totalIncome = transactionList
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactionList
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    setStats({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactionList.length
    });
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}></div>
          <h5 className="text-muted">Loading your dashboard...</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar onShowProfile={() => setShowProfile(true)} />
      
      {/* Welcome Header */}
      <div 
        className="py-5 mb-4 text-white"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '200px'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="display-4 fw-bold mb-2">
                {getGreeting()}, {currentUser?.displayName || 'User'}! 👋
              </h1>
              <p className="lead mb-0">
                Welcome back to your personal finance dashboard
              </p>
            </Col>
            <Col md={4} className="text-end">
              <div className="d-inline-block text-center">
                <div 
                  className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.2)',
                    fontSize: '2rem'
                  }}
                >
                  💰
                </div>
                <Badge bg="light" text="dark" className="px-3 py-2">
                  <i className="fas fa-calendar me-1"></i>
                  {new Date().toLocaleDateString()}
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container fluid className="px-4">
        {/* Statistics Cards */}
        <Row className="mb-4" style={{marginTop: '-60px'}}>
          <Col lg={3} md={6} className="mb-4">
            <Card className="border-0 shadow-lg h-100" style={{borderRadius: '15px'}}>
              <Card.Body className="text-center">
                <div 
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    color: 'white'
                  }}
                >
                  <i className="fas fa-arrow-up fa-lg"></i>
                </div>
                <h6 className="text-muted text-uppercase mb-2">Total Income</h6>
                <h3 className="text-success fw-bold mb-0">
                  ₹{stats.totalIncome.toLocaleString()}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="border-0 shadow-lg h-100" style={{borderRadius: '15px'}}>
              <Card.Body className="text-center">
                <div 
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #fa709a, #fee140)',
                    color: 'white'
                  }}
                >
                  <i className="fas fa-arrow-down fa-lg"></i>
                </div>
                <h6 className="text-muted text-uppercase mb-2">Total Expenses</h6>
                <h3 className="text-danger fw-bold mb-0">
                  ₹{stats.totalExpenses.toLocaleString()}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="border-0 shadow-lg h-100" style={{borderRadius: '15px'}}>
              <Card.Body className="text-center">
                <div 
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                    color: '#333'
                  }}
                >
                  <i className="fas fa-wallet fa-lg"></i>
                </div>
                <h6 className="text-muted text-uppercase mb-2">Balance</h6>
                <h3 className={`fw-bold mb-0 ${stats.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                  ₹{stats.balance.toLocaleString()}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-4">
            <Card className="border-0 shadow-lg h-100" style={{borderRadius: '15px'}}>
              <Card.Body className="text-center">
                <div 
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white'
                  }}
                >
                  <i className="fas fa-list fa-lg"></i>
                </div>
                <h6 className="text-muted text-uppercase mb-2">Transactions</h6>
                <h3 className="text-primary fw-bold mb-0">
                  {stats.transactionCount}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Balance Alert */}
        {stats.balance < 0 && (
          <Alert variant="warning" className="mb-4 border-0 shadow-sm" style={{borderRadius: '10px'}}>
            <Alert.Heading className="h5">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Low Balance Alert
            </Alert.Heading>
            <p className="mb-0">
              Your expenses exceed your income by ₹{Math.abs(stats.balance).toLocaleString()}. 
              Consider reviewing your spending habits.
            </p>
          </Alert>
        )}

        <Row>
          {/* Transaction Form */}
          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-lg h-100" style={{borderRadius: '15px'}}>
              <Card.Header 
                className="border-0 text-white text-center py-3"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                  borderRadius: '15px 15px 0 0'
                }}
              >
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-plus-circle me-2"></i>
                  Add New Transaction
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <TransactionForm />
              </Card.Body>
            </Card>
          </Col>

          {/* Charts */}
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-lg h-100" style={{borderRadius: '15px'}}>
              <Card.Header 
                className="border-0 text-white text-center py-3"
                style={{
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  borderRadius: '15px 15px 0 0'
                }}
              >
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-chart-pie me-2"></i>
                  Financial Overview
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Charts transactions={transactions} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Transactions & Full Transaction List */}
        <Row>
          {/* Recent Transactions */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-lg" style={{borderRadius: '15px'}}>
              <Card.Header 
                className="border-0 text-white text-center py-3"
                style={{
                  background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                  borderRadius: '15px 15px 0 0',
                  color: '#333 !important'
                }}
              >
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-clock me-2"></i>
                  Recent Transactions
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                {recentTransactions.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentTransactions.map((transaction, index) => (
                      <div key={transaction.id} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                              style={{
                                width: '40px',
                                height: '40px',
                                background: transaction.type === 'income' 
                                  ? 'linear-gradient(135deg, #4facfe, #00f2fe)' 
                                  : 'linear-gradient(135deg, #fa709a, #fee140)',
                                color: 'white'
                              }}
                            >
                              <i className={`fas ${transaction.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                            </div>
                            <div>
                              <h6 className="mb-1">{transaction.description}</h6>
                              <small className="text-muted">{transaction.category}</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className={`fw-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                            </div>
                            <small className="text-muted">
                              {new Date(transaction.transactionDate).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No transactions yet</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-lg" style={{borderRadius: '15px'}}>
              <Card.Header 
                className="border-0 text-white text-center py-3"
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '15px 15px 0 0'
                }}
              >
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-bolt me-2"></i>
                  Quick Actions
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col md={6} className="mb-3">
                    <Button 
                      variant="outline-success" 
                      size="lg" 
                      className="w-100 fw-bold"
                      style={{borderRadius: '10px', minHeight: '60px'}}
                    >
                      <i className="fas fa-download me-2"></i>
                      Export Data
                    </Button>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Button 
                      variant="outline-info" 
                      size="lg" 
                      className="w-100 fw-bold"
                      style={{borderRadius: '10px', minHeight: '60px'}}
                      onClick={() => setShowProfile(true)}
                    >
                      <i className="fas fa-user-cog me-2"></i>
                      Profile Settings
                    </Button>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Button 
                      variant="outline-warning" 
                      size="lg" 
                      className="w-100 fw-bold"
                      style={{borderRadius: '10px', minHeight: '60px'}}
                    >
                      <i className="fas fa-chart-line me-2"></i>
                      View Reports
                    </Button>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Button 
                      variant="outline-danger" 
                      size="lg" 
                      className="w-100 fw-bold"
                      style={{borderRadius: '10px', minHeight: '60px'}}
                    >
                      <i className="fas fa-bell me-2"></i>
                      Set Alerts
                    </Button>
                  </Col>
                </Row>

                {/* Financial Health Score */}
                <div className="mt-4 p-3 rounded" style={{background: 'linear-gradient(135deg, #ffecd2, #fcb69f)'}}>
                  <h6 className="fw-bold mb-2 text-dark">
                    <i className="fas fa-heartbeat me-2"></i>
                    Financial Health Score
                  </h6>
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="progress" style={{height: '10px', borderRadius: '5px'}}>
                        <div 
                          className="progress-bar"
                          style={{
                            width: `${Math.min(100, Math.max(0, (stats.balance / (stats.totalIncome || 1)) * 100))}%`,
                            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)'
                          }}
                        ></div>
                      </div>
                    </div>
                    <Badge 
                      bg={stats.balance >= 0 ? 'success' : 'danger'} 
                      className="ms-3"
                    >
                      {stats.balance >= 0 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Full Transaction List */}
        <Row>
          <Col lg={12} className="mb-4">
            <Card className="border-0 shadow-lg" style={{borderRadius: '15px'}}>
              <Card.Header 
                className="border-0 text-white text-center py-3"
                style={{
                  background: 'linear-gradient(135deg, #fa709a, #fee140)',
                  borderRadius: '15px 15px 0 0'
                }}
              >
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-list-alt me-2"></i>
                  All Transactions
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <TransactionList transactions={transactions} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Footer */}
        <div className="text-center py-4 mt-5">
          <p className="text-muted mb-0">
            <i className="fas fa-heart text-danger me-1"></i>
            Made with love for better financial management
          </p>
        </div>
      </Container>

      {/* User Profile Modal */}
      <UserProfile 
        show={showProfile} 
        handleClose={() => setShowProfile(false)} 
      />
    </>
  );
};

export default Dashboard;
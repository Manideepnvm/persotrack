import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Alert, Modal } from 'react-bootstrap';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const TransactionList = ({ refresh }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.uid),
      orderBy('transactionDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionData.push({
          id: doc.id,
          ...data,
          transactionDate: data.transactionDate?.toDate() || new Date()
        });
      });
      setTransactions(transactionData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, refresh]);

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'transactions', transactionToDelete.id));
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction');
    }
    setDeleting(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <h5 className="mb-0">Recent Transactions</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {transactions.length === 0 ? (
            <p className="text-muted text-center">No transactions found. Add your first transaction above!</p>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.transactionDate)}</td>
                    <td>{transaction.description || '-'}</td>
                    <td>{transaction.category}</td>
                    <td>
                      <Badge 
                        bg={transaction.type === 'income' ? 'success' : 'danger'}
                      >
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(transaction)}
                        title="Delete Transaction"
                      >
                        🗑️ Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this transaction?</p>
          {transactionToDelete && (
            <div className="bg-light p-3 rounded">
              <strong>Date:</strong> {formatDate(transactionToDelete.transactionDate)}<br/>
              <strong>Description:</strong> {transactionToDelete.description || '-'}<br/>
              <strong>Category:</strong> {transactionToDelete.category}<br/>
              <strong>Amount:</strong> {formatCurrency(transactionToDelete.amount)}
            </div>
          )}
          <p className="text-danger mt-2 mb-0">
            <small>This action cannot be undone.</small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Transaction'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TransactionList;
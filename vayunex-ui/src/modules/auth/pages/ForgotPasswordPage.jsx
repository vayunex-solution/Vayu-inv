import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiClient from '../../../lib/apiClient';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await apiClient.post('/api/v1/auth/forgot-password', { email });
      setMessage('Password reset link has been sent to your email.');
    } catch (err) {
      setError(err?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-overlay"></div>
      <Container className="h-100 d-flex align-items-center justify-content-center position-relative" style={{ zIndex: 1, minHeight: '100vh' }}>
        <Row className="w-100 justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="text-center mb-4">
               {/* Use same logo as login page if available, or text */}
               <h2 className="text-white fw-bold mb-0">Vayunex Solution</h2>
               <p className="text-white-50">Forgot Password</p>
            </div>
            
            <Card className="login-card shadow-lg border-0 rounded-4 overflow-hidden">
               {/* Glassmorphism effect overlay inside card if needed, leveraging same CSS as Login */}
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h4 className="fw-bold text-dark">Reset Password</h4>
                  <p className="text-muted small">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="email">
                    <Form.Label className="fw-semibold text-secondary small text-uppercase">Email Address</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-control-lg bg-light border-0"
                    />
                  </Form.Group>

                  <div className="d-grid mb-4">
                    <Button variant="primary" size="lg" type="submit" disabled={loading} className="fw-bold shadow-sm">
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none fw-semibold text-primary">
                      <i className="bi bi-arrow-left me-1"></i> Back to Login
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <small className="text-white-50">&copy; {new Date().getFullYear()} Vayunex Solution. All rights reserved.</small>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;

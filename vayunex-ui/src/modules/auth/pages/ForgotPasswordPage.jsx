import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Mail, ArrowRight, ArrowLeft, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../../lib/apiClient';
import { companyConfig } from '../../../config/company';

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
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <Container className="position-relative" style={{ zIndex: 10 }}>
        <Row className="justify-content-center align-items-center min-vh-100 py-5">
          <Col xs={11} sm={10} md={8} lg={5} xl={4}>

            {/* Logo Section */}
            <div className="text-center mb-5">
              <div className="logo-container">
                <div className="logo-glow"></div>
                <div className="logo-icon">
                  <Leaf size={36} strokeWidth={2} />
                </div>
              </div>
              <h1 className="brand-title">{companyConfig.name}</h1>
              <p className="brand-subtitle">{companyConfig.tagline}</p>
            </div>

            {/* Auth Card */}
            <div className="auth-card">
              <div className="card-shine"></div>

              <div className="auth-card-header">
                <h2>Forgot Password?</h2>
                <p>Enter your email to receive a reset link</p>
              </div>

              {message && (
                <Alert variant="success" className="auth-alert border-success bg-success-subtle text-success">
                  <span className="alert-icon">✅</span>
                  {message}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="auth-alert">
                  <span className="alert-icon">⚠️</span>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="form-group-premium">
                  <Form.Label>Email Address</Form.Label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Mail size={18} /></span>
                    <Form.Control
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="premium-input"
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-premium mb-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={18} className="ms-2" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="forgot-link d-inline-flex align-items-center gap-2">
                    <ArrowLeft size={16} /> Back to Login
                  </Link>
                </div>
              </Form>
            </div>

            {/* Copyright */}
            <p className="auth-copyright">
              © {new Date().getFullYear()} {companyConfig.name}. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Lock, Eye, EyeOff, ArrowRight, Leaf } from 'lucide-react';
import apiClient from '../../../lib/apiClient';
import { companyConfig } from '../../../config/company';

const ResetPasswordPage = () => {
  // Native URL search params
  const [token, setToken] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for token after mount
    const params = new URLSearchParams(window.location.search);
    if (!params.get('token')) {
      setError('Invalid or missing reset token.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/api/v1/auth/reset-password', { 
        token, 
        newPassword: password 
      });
      setMessage('Password reset successfully. Redirecting to login...');
      
      setTimeout(() => {
        navigateTo('/login');
      }, 3000);

    } catch (err) {
      setError(err?.message || 'Failed to reset password. Token might be expired.');
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
                <h2>Set New Password</h2>
                <p>Create a strong password for your account</p>
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

              {!message && (
                <Form onSubmit={handleSubmit} className="auth-form">
                  <Form.Group className="form-group-premium">
                    <Form.Label>New Password</Form.Label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Lock size={18} /></span>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="premium-input"
                      />
                      <button 
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </Form.Group>

                  <Form.Group className="form-group-premium">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Lock size={18} /></span>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="premium-input"
                      />
                    </div>
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="btn-premium mb-4"
                    disabled={loading || !token}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight size={18} className="ms-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <a 
                      href="/login" 
                      className="forgot-link"
                      onClick={(e) => {
                         e.preventDefault();
                         navigateTo('/login');
                      }}
                    >
                      Back to Login
                    </a>
                  </div>
                </Form>
              )}
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

export default ResetPasswordPage;

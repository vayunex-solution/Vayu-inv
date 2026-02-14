// src/modules/auth/pages/LoginPage.jsx
import { useState } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { AppUser } from '../../../lib';
import { companyConfig } from '../../../config/company';
import { login } from '../services/authService';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        AppUser.setUser(res.data.user, {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken
        });
        onLogin();
      } else {
        setError(res.error?.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
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

            {/* Login Card */}
            <div className="auth-card">
              <div className="card-shine"></div>

              <div className="auth-card-header">
                <h2>Welcome Back</h2>
                <p>Sign in to continue to your dashboard</p>
              </div>

              <Form onSubmit={handleSubmit} className="auth-form">
                {error && (
                  <Alert variant="danger" className="auth-alert">
                    <span className="alert-icon">⚠️</span>
                    {error}
                  </Alert>
                )}

                <Form.Group className="form-group-premium">
                  <Form.Label>Email Address</Form.Label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Mail size={18} /></span>
                    <Form.Control
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="premium-input"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="form-group-premium">
                  <Form.Label>Password</Form.Label>
                  <div className="input-wrapper">
                    <span className="input-icon"><Lock size={18} /></span>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

                <div className="form-options">
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    className="premium-checkbox"
                  />
                  <a
                    href="/forgot-password"
                    className="forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', '/forgot-password');
                      // Trigger popstate to update App.jsx state
                      window.dispatchEvent(new Event('popstate'));
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="btn-premium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} className="ms-2" />
                    </>
                  )}
                </Button>
              </Form>

              <div className="auth-footer">
                <span>Don't have an account?</span>
                <a
                  href="/signup"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/signup');
                    window.location.reload();
                  }}
                >
                  Create Account
                </a>
              </div>
            </div>

            {/* Bottom */}
            <p className="auth-copyright">
              © 2026 {companyConfig.name}. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;

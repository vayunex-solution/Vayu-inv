// src/modules/auth/pages/SignupPage.jsx
import { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Leaf, User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { AppUser } from '../../../lib';
import { companyConfig } from '../../../config/company';
import { register } from '../services/authService';

const SignupPage = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (res.success) {
        setSuccess(true);
        AppUser.setUser(res.data.user, {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken
        });
        setTimeout(() => onSignup(), 2000);
      } else {
        setError(res.error?.message || 'Registration failed');
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
          <Col xs={11} sm={10} md={8} lg={6} xl={5}>

            {/* Logo Section */}
            <div className="text-center mb-4">
              <div className="logo-container">
                <div className="logo-glow"></div>
                <div className="logo-icon">
                  <Leaf size={36} strokeWidth={2} />
                </div>
              </div>
              <h1 className="brand-title">{companyConfig.name}</h1>
              <p className="brand-subtitle">{companyConfig.tagline}</p>
            </div>

            {/* Signup Card */}
            <div className="auth-card">
              <div className="card-shine"></div>

              <div className="auth-card-header">
                <h2>Create Account</h2>
                <p>Join us and start managing your inventory</p>
              </div>

              {success ? (
                <div className="success-state">
                  <div className="success-icon">
                    <Check size={40} />
                  </div>
                  <h3>Welcome Aboard! 🎉</h3>
                  <p>Your account has been created successfully. Redirecting...</p>
                </div>
              ) : (
                <Form onSubmit={handleSubmit} className="auth-form">
                  {error && (
                    <Alert variant="danger" className="auth-alert">
                      <span className="alert-icon">⚠️</span>
                      {error}
                    </Alert>
                  )}

                  <Form.Group className="form-group-premium">
                    <Form.Label>Full Name</Form.Label>
                    <div className="input-wrapper">
                      <span className="input-icon"><User size={18} /></span>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="premium-input"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="form-group-premium">
                    <Form.Label>Email Address</Form.Label>
                    <div className="input-wrapper">
                      <span className="input-icon"><Mail size={18} /></span>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="premium-input"
                      />
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="form-group-premium">
                        <Form.Label>Password</Form.Label>
                        <div className="input-wrapper">
                          <span className="input-icon"><Lock size={18} /></span>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="premium-input"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="form-group-premium">
                        <Form.Label>Confirm Password</Form.Label>
                        <div className="input-wrapper">
                          <span className="input-icon"><Lock size={18} /></span>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                    </Col>
                  </Row>

                  <Form.Check
                    type="checkbox"
                    label={<span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>}
                    className="premium-checkbox mt-3"
                    required
                  />

                  <Button
                    type="submit"
                    className="btn-premium"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={18} className="ms-2" />
                      </>
                    )}
                  </Button>
                </Form>
              )}

              <div className="auth-footer">
                <span>Already have an account?</span>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/');
                    window.location.reload();
                  }}
                >
                  Sign In
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

export default SignupPage;

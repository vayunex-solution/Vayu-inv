import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../lib/apiClient';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Protect route if no token
    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

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
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err?.message || 'Failed to reset password. Token might be expired.');
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
                            <h2 className="text-white fw-bold mb-0">Vayunex Solution</h2>
                            <p className="text-white-50">Set New Password</p>
                        </div>

                        <Card className="login-card shadow-lg border-0 rounded-4 overflow-hidden">
                            <Card.Body className="p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <h4 className="fw-bold text-dark">New Password</h4>
                                    <p className="text-muted small">Please create a strong password for your account.</p>
                                </div>

                                {message && <Alert variant="success">{message}</Alert>}
                                {error && <Alert variant="danger">{error}</Alert>}

                                {!message && (
                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3" controlId="password">
                                            <Form.Label className="fw-semibold text-secondary small text-uppercase">New Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={8}
                                                className="form-control-lg bg-light border-0"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4" controlId="confirmPassword">
                                            <Form.Label className="fw-semibold text-secondary small text-uppercase">Confirm Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="form-control-lg bg-light border-0"
                                            />
                                        </Form.Group>

                                        <div className="d-grid mb-4">
                                            <Button variant="primary" size="lg" type="submit" disabled={loading || !token} className="fw-bold shadow-sm">
                                                {loading ? 'Resetting...' : 'Reset Password'}
                                            </Button>
                                        </div>

                                        <div className="text-center">
                                            <Link to="/login" className="text-decoration-none fw-semibold text-primary">
                                                <i className="bi bi-arrow-left me-1"></i> Back to Login
                                            </Link>
                                        </div>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ResetPasswordPage;

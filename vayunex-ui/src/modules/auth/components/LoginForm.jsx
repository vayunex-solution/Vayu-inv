// src/modules/auth/components/LoginForm.jsx
import { useState } from 'react';
import { Form, Button, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ onSubmit, loading, error }) => {
    const [email, setEmail] = useState('admin@gmail.com');
    const [password, setPassword] = useState('admin@1234');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, password });
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && (
                <Alert variant="danger" className="py-2 small mb-3">
                    {error}
                </Alert>
            )}

            <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-secondary">Email Address</Form.Label>
                <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                        <User size={18} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                        type="email"
                        className="border-start-0 ps-0"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-secondary">Password</Form.Label>
                <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0">
                        <Lock size={18} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        className="border-start-0 ps-0 border-end-0"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <InputGroup.Text
                        className="bg-white border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </InputGroup.Text>
                </InputGroup>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <Form.Check
                    type="checkbox"
                    id="remember-me"
                    label={<span className="small text-secondary">Remember me</span>}
                />
                <a href="#" className="small text-decoration-none fw-bold text-success">
                    Forgot password?
                </a>
            </div>

            <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 mb-3 bg-gradient border-0"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Spinner size="sm" className="me-2" /> Signing In...
                    </>
                ) : 'Sign In'}
            </Button>
        </Form>
    );
};

export default LoginForm;

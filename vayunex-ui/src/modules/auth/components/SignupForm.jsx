// src/modules/auth/components/SignupForm.jsx
import { useState } from 'react';
import { Form, Button, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const SignupForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      
      {/* Name Field */}
      <Form.Group className="mb-3">
        <Form.Label>Full Name</Form.Label>
        <InputGroup>
          <InputGroup.Text className="bg-white">
            <User size={18} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!validationErrors.name}
            disabled={loading}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.name}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      {/* Email Field */}
      <Form.Group className="mb-3">
        <Form.Label>Email Address</Form.Label>
        <InputGroup>
          <InputGroup.Text className="bg-white">
            <Mail size={18} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!validationErrors.email}
            disabled={loading}
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.email}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      {/* Password Field */}
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <InputGroup>
          <InputGroup.Text className="bg-white">
            <Lock size={18} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!validationErrors.password}
            disabled={loading}
          />
          <InputGroup.Text
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer' }}
            className="bg-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </InputGroup.Text>
          <Form.Control.Feedback type="invalid">
            {validationErrors.password}
          </Form.Control.Feedback>
        </InputGroup>
        <Form.Text className="text-muted">
          Must be at least 6 characters
        </Form.Text>
      </Form.Group>

      {/* Confirm Password Field */}
      <Form.Group className="mb-4">
        <Form.Label>Confirm Password</Form.Label>
        <InputGroup>
          <InputGroup.Text className="bg-white">
            <Lock size={18} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            isInvalid={!!validationErrors.confirmPassword}
            disabled={loading}
          />
          <InputGroup.Text
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ cursor: 'pointer' }}
            className="bg-white"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </InputGroup.Text>
          <Form.Control.Feedback type="invalid">
            {validationErrors.confirmPassword}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      {/* Submit Button */}
      <Button
        variant="primary"
        type="submit"
        className="w-100 py-2 fw-bold"
        disabled={loading}
      >
        {loading ? <Spinner animation="border" size="sm" /> : 'Create Account'}
      </Button>
    </Form>
  );
};

export default SignupForm;

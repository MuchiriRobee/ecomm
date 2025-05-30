import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing token');
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/confirm`, {
          params: { token },
        });
        setStatus('success');
        setEmail(response.data.email);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Invalid or expired token');
      }
    };

    validateToken();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrors({});

    // Client-side validation
    const newErrors = {};
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*]/.test(password)) {
      newErrors.password = 'Password must contain at least one special character';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus('error');
      return;
    }

    try {
      const token = searchParams.get('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/set-password`, {
        token,
        password,
      });
      setStatus('success');
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to set password');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
          Set Your Password
        </Typography>

        {status === 'loading' && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {status === 'success' && !message && (
          <form onSubmit={handleSubmit}>
            <Typography variant="body1" gutterBottom>
              Setting password for <strong>{email}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              size="small"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              margin="normal"
              size="small"
            />
            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ px: 4, py: 1 }}
                disabled={status === 'loading'}
              >
                Set Password
              </Button>
            </Box>
          </form>
        )}

        {status === 'success' && message && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Redirecting to login...
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default SetPassword;
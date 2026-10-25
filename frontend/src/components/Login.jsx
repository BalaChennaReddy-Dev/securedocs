import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Store the ID badge and role securely in the browser
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);

      // Route based on access level
      if (res.data.role === 'Admin') {
        navigate('/audit'); // Admins go to the system logs
      } else {
        navigate('/dashboard'); // Owners and Viewers go to the vault
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h2>SecureDocs Access</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Email address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#000', color: '#fff', cursor: 'pointer' }}>
          Authenticate
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      
      {/* ADD THIS NEW PARAGRAPH */}
      <p style={{ marginTop: '20px' }}>
        Don't have an account? <Link to="/register" style={{ color: '#007bff' }}>Register here</Link>
      </p>
    </div>
  );
}
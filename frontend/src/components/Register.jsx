import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // We automatically assign the 'Owner' role so they have full upload/sharing rights
      await api.post('/auth/register', { email, password, role: 'Owner' });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', fontFamily: 'system-ui', textAlign: 'center' }}>
      <h1>Join SecureDocs</h1>
      <p style={{ color: '#666' }}>Create a secure vault account</p>
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
          minLength="6"
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
          Create Account
        </button>
      </form>
      
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/" style={{ color: '#007bff' }}>Login here</Link>
      </p>
    </div>
  );
}
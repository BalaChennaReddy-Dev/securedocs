import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [view, setView] = useState('logs'); 
  
  // NEW: State for creating users
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'Owner' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit/system');
      setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
    } catch (err) {
      setError('Failed to fetch audit logs.');   
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to fetch users.');
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // NEW: Function to handle creating a user via the register route
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', newUser);
      alert('User created successfully!');
      setIsCreating(false);
      setNewUser({ email: '', password: '', role: 'Owner' });
      fetchUsers(); // Refresh the list automatically
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/'); 
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' }}>
      
      {/* Header section with Logout Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Dashboard</h1>
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setView('logs')}
          style={{ padding: '10px 20px', cursor: 'pointer', background: view === 'logs' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          System Audit Logs
        </button>
        <button 
          onClick={() => setView('users')}
          style={{ padding: '10px 20px', cursor: 'pointer', background: view === 'users' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Manage Users ({users.length})
        </button>
      </div>
      
      {view === 'users' && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          
          {/* NEW: Create User Header & Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>Total Registered Users: {users.length}</h2>
            <button 
              onClick={() => setIsCreating(!isCreating)}
              style={{ padding: '8px 16px', background: isCreating ? '#6c757d' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isCreating ? 'Cancel' : '+ Create New User'}
            </button>
          </div>

          {/* NEW: Create User Form */}
          {isCreating && (
            <form onSubmit={handleCreateUser} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required 
                style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required 
                style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <select 
                value={newUser.role} 
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="Owner">Owner</option>
                <option value="Admin">Admin</option>
              </select>
              <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Create
              </button>
            </form>
          )}

          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Role</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Joined</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{u.email}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <span style={{ background: u.role === 'Admin' ? '#dc3545' : '#28a745', color: '#fff', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {u.role !== 'Admin' && (
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'logs' && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
           <h2>Immutable Action Ledger</h2>
           <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Action</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>User</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Document</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log._id || index}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {log.actorId?.email || 'Deleted User'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {log.documentId?.originalName || (typeof log.documentId === 'string' ? log.documentId : 'N/A')}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
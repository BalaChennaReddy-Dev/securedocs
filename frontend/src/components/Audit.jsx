import { useState, useEffect } from 'react';
import api from '../api';

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [view, setView] = useState('logs'); 

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit/system');
      // Look inside res.data.logs instead of just res.data
      setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
    } catch (err) {
      setError('Failed to fetch audit logs.');   
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      // Safeguard: Ensure we always set an array
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

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Admin Dashboard</h1>
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
          <h2>Total Registered Users: {users.length}</h2>
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
                    {/* Safeguard: Check if createdAt exists before formatting */}
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
                  
                  {/* Changed from userId to actorId */}
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {log.actorId?.email || 'Deleted User'}
                  </td>
                  
                  {/* Changed from title to originalName */}
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {log.documentId?.originalName || (typeof log.documentId === 'string' ? log.documentId : 'N/A')}
                  </td>
                  
                  {/* Changed from timestamp to createdAt */}
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
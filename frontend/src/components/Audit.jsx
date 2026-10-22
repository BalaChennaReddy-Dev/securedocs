import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit/system');
        setLogs(res.data.logs);
      } catch (err) {
        console.error('Failed to fetch audit logs');
      }
    };
    fetchLogs();
  }, []);

  // Format the MongoDB timestamp into a readable local date/time
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Helper to color-code the action badges for quick scanning
  const getBadgeStyle = (action) => {
    if (action === 'UNAUTHORIZED_ATTEMPT') return { bg: '#f8d7da', text: '#721c24' };
    if (action === 'GRANT_ACCESS' || action === 'DOWNLOAD') return { bg: '#d4edda', text: '#155724' };
    if (action === 'REVOKE_ACCESS') return { bg: '#fff3cd', text: '#856404' };
    return { bg: '#e2e3e5', text: '#383d41' };
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>SecureDocs System Audit</h1>
        <button onClick={logout} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>

      <p style={{ color: '#666', marginBottom: '30px' }}>
        Immutable ledger of all system activity. Records cannot be altered or deleted.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Timestamp</th>
            <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Actor</th>
            <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Action</th>
            <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Document</th>
            <th style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}>Details</th>
          </tr>
        </thead>
        <tbody style={{ background: '#fff' }}>
          {logs.map((log) => {
            const badge = getBadgeStyle(log.action);
            return (
              <tr key={log._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px', fontSize: '14px' }}>{formatDate(log.createdAt)}</td>
                <td style={{ padding: '15px', fontSize: '14px' }}>
                  <strong>{log.actorId?.email || 'System'}</strong><br/>
                  <span style={{ color: '#888', fontSize: '12px' }}>{log.actorId?.role || ''}</span>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    background: badge.bg, color: badge.text
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '15px', fontSize: '14px' }}>{log.documentId?.originalName || 'N/A'}</td>
                <td style={{ padding: '15px', fontSize: '14px' }}>{log.details}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
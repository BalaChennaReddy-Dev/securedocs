import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [file, setFile] = useState(null);
  
  // CENTRALIZED PERMISSION STATE
  const [selectedDocId, setSelectedDocId] = useState('');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 5; 

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const docRes = await api.get('/documents');
      setOwnedDocs(docRes.data.ownedDocs);
      setSharedDocs(docRes.data.sharedDocs);

      const userRes = await api.get('/users');
      setUsersList(userRes.data);
    } catch (err) {
      console.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'General');

    try {
      await api.post('/documents/upload', formData);
      setFile(null);
      fetchData();
      alert('File secured in the vault!');
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handlePermission = async (targetEmail, action) => {
    if (!selectedDocId) return alert('Please select a document first!');
    
    try {
      const endpoint = action === 'grant' ? '/permissions/grant' : '/permissions/revoke';
      await api.post(endpoint, { documentId: selectedDocId, targetUserEmail: targetEmail, accessLevel: 'Read' });
      alert(`Access ${action}ed successfully for ${targetEmail}!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Permission change failed');
    }
  };

  const handleDownload = async (docId, originalName) => {
    try {
      const res = await api.get(`/documents/download/${docId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Access denied or file missing');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- FILTERING LOGIC ---
  const filteredDocs = ownedDocs.filter(d => 
    d.originalName.toLowerCase().includes(docSearchQuery.toLowerCase())
  );

  const filteredUsers = usersList.filter(u => 
    u.email !== localStorage.getItem('email') && 
    u.role !== 'Admin' &&  // EXCLUDE ADMINS
    u.role !== 'Owner' &&  // EXCLUDE OWNERS
    (u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
     u.role.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE, 
    currentPage * USERS_PER_PAGE
  );

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>SecureDocs Dashboard</h1>
        <button onClick={logout} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
      
      {/* 1. UPLOAD SECTION */}
      {localStorage.getItem('role') !== 'Viewer' && (
        <div style={{ background: '#f8f9fa', padding: '20px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ marginTop: 0 }}>Upload Secure File</h3>
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px' }}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required style={{ flex: 1 }}/>
            <button type="submit" style={{ padding: '8px 16px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Upload to Vault</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px' }}>
        
        {/* LEFT COLUMN: THE VAULT (Files) */}
        <div style={{ flex: 1 }}>
          <h3>My Vault</h3>
          {ownedDocs.length === 0 && <p style={{ color: '#666' }}>No files uploaded yet.</p>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {ownedDocs.map(doc => (
              <li key={doc._id} style={{ border: '1px solid #dee2e6', padding: '15px', marginBottom: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ wordBreak: 'break-all', marginRight: '10px' }}>{doc.originalName}</strong>
                <button onClick={() => handleDownload(doc._id, doc.originalName)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Download</button>
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: '40px' }}>Shared With Me</h3>
          {sharedDocs.length === 0 && <p style={{ color: '#666' }}>No files shared with you.</p>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sharedDocs.map(doc => (
              <li key={doc._id} style={{ border: '1px solid #dee2e6', padding: '15px', marginBottom: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ wordBreak: 'break-all' }}>{doc.originalName}</strong>
                <button onClick={() => handleDownload(doc._id, doc.originalName)} style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Secure Download</button>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT COLUMN: ACCESS CONTROL CENTER */}
        {localStorage.getItem('role') !== 'Viewer' && (
          <div style={{ flex: 1, background: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', alignSelf: 'flex-start' }}>
            <h3 style={{ marginTop: 0, color: '#d9534f', borderBottom: '2px solid #f9f9f9', paddingBottom: '10px' }}>Access Control Center</h3>
            
            {/* Step A: Auto-Suggest Document Search */}
            <div style={{ marginBottom: '25px', position: 'relative' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>1. Find Document</label>
              <input 
                type="text" 
                placeholder="Start typing a document name..." 
                value={docSearchQuery}
                onChange={(e) => {
                  setDocSearchQuery(e.target.value);
                  setIsDocDropdownOpen(true);
                  if (e.target.value === '') setSelectedDocId(''); 
                }}
                onFocus={() => setIsDocDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDocDropdownOpen(false), 200)} 
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', outline: selectedDocId ? '2px solid #28a745' : 'none' }}
              />
              
              {/* Floating Dropdown Menu */}
              {isDocDropdownOpen && filteredDocs.length > 0 && (
                <ul style={{ 
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: '#fff', border: '1px solid #ccc', borderRadius: '4px', 
                  maxHeight: '200px', overflowY: 'auto', listStyle: 'none', padding: 0, margin: '5px 0 0 0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {filteredDocs.map(d => (
                    <li 
                      key={d._id}
                      onMouseDown={() => {
                        setSelectedDocId(d._id);
                        setDocSearchQuery(d.originalName); 
                        setIsDocDropdownOpen(false);
                      }}
                      style={{ 
                        padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee',
                        background: selectedDocId === d._id ? '#e9ecef' : '#fff'
                      }}
                    >
                      {d.originalName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Step B: Select User & Apply Action */}
            <div style={{ opacity: selectedDocId ? 1 : 0.5, transition: 'opacity 0.2s' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>2. Manage Directory Access</label>
              <input 
                type="text" 
                placeholder="Search users by email or role..." 
                value={userSearchQuery}
                onChange={(e) => {
                  setUserSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={!selectedDocId}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
              />

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {paginatedUsers.map(u => (
                  <li key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{u.email}</span>
                      <span style={{ fontSize: '12px', color: '#888' }}>{u.role}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handlePermission(u.email, 'grant')}
                        disabled={!selectedDocId}
                        style={{ background: selectedDocId ? '#d4edda' : '#eee', border: '1px solid', borderColor: selectedDocId ? '#c3e6cb' : '#ccc', color: selectedDocId ? '#155724' : '#999', padding: '4px 8px', cursor: selectedDocId ? 'pointer' : 'not-allowed', borderRadius: '4px' }}
                      >
                        Grant
                      </button>
                      <button 
                        onClick={() => handlePermission(u.email, 'revoke')}
                        disabled={!selectedDocId}
                        style={{ background: selectedDocId ? '#f8d7da' : '#eee', border: '1px solid', borderColor: selectedDocId ? '#f5c6cb' : '#ccc', color: selectedDocId ? '#721c24' : '#999', padding: '4px 8px', cursor: selectedDocId ? 'pointer' : 'not-allowed', borderRadius: '4px' }}
                      >
                        Revoke
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', fontSize: '12px', color: '#666' }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ cursor: 'pointer' }}>Prev</button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ cursor: 'pointer' }}>Next</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
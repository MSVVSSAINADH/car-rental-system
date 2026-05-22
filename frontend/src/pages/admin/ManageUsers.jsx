import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/admin/users')
            .then(res => setUsers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div className="dashboard-header">
                <div>
                    <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, margin: 0 }}>Manage Users</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>All registered users on the platform</p>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                    {users.length} total users
                </span>
            </div>

            <div style={{ marginBottom: '1.5rem', maxWidth: 360 }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="🔍 Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Profile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, idx) => (
                                <tr key={u.id}>
                                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: '50%',
                                                background: u.profileImage ? 'transparent' : '#4f46e5',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 700, fontSize: '1rem', overflow: 'hidden',
                                                flexShrink: 0
                                            }}>
                                                {u.profileImage
                                                    ? <img src={u.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : u.name?.charAt(0).toUpperCase()
                                                }
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-success'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        {u.profileImage
                                            ? <span className="badge badge-success">✓ Uploaded</span>
                                            : <span className="badge badge-muted">No photo</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Login(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ==========================================
  // CRITICAL AUTO-CLEAR STALE STORAGE CACHE FIX
  // ==========================================
  useEffect(() => {
    // Jab bhi user login layout frame par land karega, purana state context automatic wipeout ho jayega
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5006/api/auth/login', {
        email: email,
        password: password
      });

      const data = response.data;
      const token = data.token || data.Token || data.accessToken;
      
      const userObj = (data.user || data.User) ? (data.user || data.User) : {
        id: data.id || data.Id,
        username: data.username || data.Username || data.name,
        role: data.role || data.Role || 'User'
      };

      if (token && userObj.username) {
          const finalData = { 
            token: token, 
            user: {
                id: userObj.id || userObj.Id,
                username: userObj.username || userObj.Username,
                role: userObj.role || userObj.Role
            } 
          };
          if(props.onLoginSuccess) {
              props.onLoginSuccess(finalData); 
          }
      } else {
          alert("Login successful, but could not read User/Token info.");
      }
    } catch (error) {
      alert("Login failed: " + (error.response?.data || "Invalid Credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* LEFT SIDE: Neon Aurora Mesh Gradient & Live Cards */}
      <div style={bannerSideStyle}>
        <div style={neonGlow1} />
        <div style={neonGlow2} />
        <div style={bannerContent}>
          <div style={logoWrapper}>
            <span style={logoIcon}>⚡</span>
            <span style={logoText}>TaskPro <span style={badgeMini}>PRO</span></span>
          </div>
          <h1 style={bannerHeading}>The ultimate command center for your next sprint.</h1>
          <p style={bannerSubtext}>
            Bring speed, clarity, and beautiful metrics to your project lifecycle. Track bugs, manage deployments, and hit deadlines like a pro.
          </p>
          
          {/* Aesthetic UI Preview Built on Code */}
          <div style={floatingPreviewCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 'bold' }}>Sprint #14 Progress</span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>87% Done</span>
            </div>
            <div style={progressBarBg}>
              <div style={progressBarFill} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <div style={miniTag}>📋 12 Tasks</div>
              <div style={miniTag}>🟢 0 Bugs</div>
              <div style={miniTag}>🚀 Release Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Gorgeous Crisp Matte-Slate Form */}
      <div style={formSideStyle}>
        <div style={loginCardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <h2 style={formTitleStyle}>Welcome Back</h2>
            <p style={formSubtitleStyle}>Please sign in to access your secure dashboard.</p>
          </div>
          
          <form onSubmit={handleLogin} style={formStyle}>
            <div style={inputGroup}>
              <label style={labelStyle}>Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={inputStyle}
                className="neon-input"
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={inputStyle}
                className="neon-input"
              />
            </div>

            <button type="submit" disabled={loading} style={buttonStyle} className="neon-btn">
              {loading ? "Decrypting Token..." : "Authenticate Workspace"}
            </button>
          </form>

          <div style={footerTextStyle}>
            Don't have an account? <Link to="/signup" style={linkStyle}>Create one now</Link>
          </div>
        </div>
      </div>

      {/* CSS Effects Engine */}
      <style>{`
        .neon-input {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .neon-input:focus {
          border-color: #6366f1 !important;
          background-color: #090d16 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important;
        }
        .neon-btn {
          transition: all 0.2s ease !important;
        }
        .neon-btn:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #059669 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(99, 102, 241, 0.2) !important;
        }
        .neon-btn:active {
          transform: translateY(0);
        }
        @keyframes float-effect {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

// ==========================================
// UPGRADED SaaS SAPPHIRE DARK SPEC TOKENS
// ==========================================
const containerStyle = { display: 'flex', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, backgroundColor: '#090d16', zIndex: 9999, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' };
const bannerSideStyle = { flex: '1.2', backgroundColor: '#090a0f', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: '#fff', overflow: 'hidden', borderRight: '1px solid rgba(255, 255, 255, 0.03)' };
const neonGlow1 = { position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: '-10%', left: '-10%' };
const neonGlow2 = { position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', bottom: '-20%', right: '-10%' };
const bannerContent = { position: 'relative', zIndex: 2, maxWidth: '480px', textAlign: 'left' };
const logoWrapper = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' };
const logoIcon = { fontSize: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', padding: '8px 12px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(99,102,241,0.25)' };
const logoText = { fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' };
const badgeMini = { fontSize: '10px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '5px', color: '#10b981', fontWeight: 'bold', border: '1px solid rgba(16,185,129,0.2)' };
const bannerHeading = { fontSize: '40px', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-1.5px', marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const bannerSubtext = { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px', fontWeight: '400' };
const floatingPreviewCard = { background: 'rgba(255, 255, 255, 0.01)', borderRadius: '16px', padding: '25px', border: '1px solid rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(20px)', animation: 'float-effect 5s infinite ease-in-out', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' };
const progressBarBg = { width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '10px', overflow: 'hidden' };
const progressBarFill = { width: '87%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: '10px' };
const miniTag = { fontSize: '11px', background: 'rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)', color: '#94a3b8', fontWeight: '500' };

const formSideStyle = { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backgroundColor: '#090d16' };
const loginCardStyle = { width: '100%', maxWidth: '420px', padding: '45px 40px', backgroundColor: '#0f172a', borderRadius: '20px', boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' };
const formTitleStyle = { color: '#f8fafc', margin: '0', fontWeight: '800', fontSize: '28px', letterSpacing: '-0.8px' };
const formSubtitleStyle = { color: '#64748b', fontSize: '14px', marginTop: '8px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#475569', marginLeft: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '15px', outline: 'none', backgroundColor: '#090d16', boxSizing: 'border-box', width: '100%', color: '#f8fafc' };
const buttonStyle = { padding: '15px', background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', boxShadow: '0 6px 18px rgba(99, 102, 241, 0.15)' };
const footerTextStyle = { textAlign: 'center', marginTop: '25px', fontSize: '13px', color: '#64748b' };
const linkStyle = { color: '#6366f1', fontWeight: '600', textDecoration: 'none', marginLeft: '4px' };

export default Login;
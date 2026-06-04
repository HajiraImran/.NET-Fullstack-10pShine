import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'User' 
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // ==========================================
    // PASSWORD COMPLEXITY VALIDATION
    // ==========================================
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    // Regular Expression for at least one special character
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(formData.password)) {
      alert("Password must contain at least one special character (e.g., @, $, !, %, *, ?, &).");
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5006/api/auth/register', formData);
      alert("Registration Successful! Please login.");
      navigate('/login');
    } catch (err) {
      alert("Error: " + (err.response?.data || "Registration fail ho gayi"));
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
          <h1 style={bannerHeading}>Deploy faster. Code cleaner. Track easier.</h1>
          <p style={bannerSubtext}>
            Join thousands of teams building high-quality platforms with zero pipeline friction. Setting up takes less than 60 seconds.
          </p>
          
          {/* Aesthetic UI Preview Built on Code */}
          <div style={floatingPreviewCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 'bold' }}>Active Deployments</span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>Healthy</span>
            </div>
            <div style={progressBarBg}>
              <div style={progressBarFill} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <div style={miniTag}>🔒 SonarQube Pass</div>
              <div style={miniTag}>⚡ C# Engine</div>
              <div style={miniTag}>⚛️ React JS</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Gorgeous Crisp Matte-Slate Dark Form */}
      <div style={formSideStyle}>
        <div style={signupCardStyle}>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={formTitleStyle}>Get Started Free</h2>
            <div style={neonBadgeNote}>
              ⚡ Policy Node: Account automatically initialized with 'User' privileges.
            </div>
          </div>
          
          <form onSubmit={handleSignup} style={formStyle}>
            <div style={inputGroup}>
              <label style={labelStyle}>Choose Username</label>
              <input 
                type="text" 
                placeholder="e.g. tech_ninja" 
                style={inputStyle}
                className="neon-input"
                onChange={e => setFormData({...formData, username: e.target.value})} 
                required 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Work Email</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                style={inputStyle}
                className="neon-input"
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Secure Password</label>
              <input 
                type="password" 
                placeholder="Min 8 chars with special sign" 
                style={inputStyle}
                className="neon-input"
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
            
            <button type="submit" disabled={loading} style={buttonStyle} className="neon-btn">
              {loading ? "Configuring Environment..." : "Create Free Account"}
            </button>
          </form>

          <div style={footerTextStyle}>
            Already have an account? <Link to="/login" style={linkStyle}>Sign In</Link>
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
const progressBarFill = { width: '100%', height: '100%', background: 'linear-gradient(90deg, #10b981, #00cec9)', borderRadius: '10px' };
const miniTag = { fontSize: '11px', background: 'rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.03)', color: '#94a3b8', fontWeight: '500' };

const formSideStyle = { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backgroundColor: '#090d16' };
const signupCardStyle = { width: '100%', maxWidth: '420px', padding: '45px 40px', backgroundColor: '#0f172a', borderRadius: '20px', boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.04)' };
const formTitleStyle = { color: '#f8fafc', margin: '0', fontWeight: '800', fontSize: '28px', letterSpacing: '-0.8px' };
const neonBadgeNote = { fontSize: '11px', color: '#6366f1', fontWeight: '600', marginTop: '10px', background: 'rgba(99, 102, 241, 0.06)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', border: '1px solid rgba(99, 102, 241, 0.1)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#475569', marginLeft: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle = { padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '15px', outline: 'none', backgroundColor: '#090d16', boxSizing: 'border-box', width: '100%', color: '#f8fafc' };
const buttonStyle = { padding: '15px', background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', boxShadow: '0 6px 18px rgba(99, 102, 241, 0.15)' };
const footerTextStyle = { textAlign: 'center', marginTop: '25px', fontSize: '13px', color: '#64748b' };
const linkStyle = { color: '#6366f1', fontWeight: '600', textDecoration: 'none', marginLeft: '4px' };

export default Signup;
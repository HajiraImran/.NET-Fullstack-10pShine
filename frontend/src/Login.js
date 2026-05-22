import React, { useState } from 'react';
import axios from 'axios';

function Login(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend request
      const response = await axios.post('http://localhost:5006/api/auth/login', {
        email: email,
        password: password
      });

      // Debugging: Console mein check karein ke backend se kya aa raha hai
      console.log("FULL DATA FROM BACKEND:", response.data);

      const data = response.data;

      // --- THE ULTIMATE MAPPING ---
      // 1. Token nikalne ka tareeqa (checks: token, Token, accessToken)
      const token = data.token || data.Token || data.accessToken;
      
      // 2. User info nikalne ka tareeqa:
      // Agar 'user' object mojud hai to wo use karein, warna direct data se fields uthayein
      const userObj = (data.user || data.User) ? (data.user || data.User) : {
        id: data.id || data.Id,
        username: data.username || data.Username || data.name,
        role: data.role || data.Role || 'User'
      };

      // Validation check
      if (token && userObj.username) {
          const finalData = { 
            token: token, 
            user: {
                id: userObj.id || userObj.Id,
                username: userObj.username || userObj.Username,
                role: userObj.role || userObj.Role
            } 
          };
          
          alert(`Welcome back, ${finalData.user.username}!`);
          
          if(props.onLoginSuccess) {
              // App.js ko formatted data bhej rahe hain
              props.onLoginSuccess(finalData); 
          }
      } else {
          console.error("Mapping Failed. Data received:", data);
          alert("Login successful, but could not read User/Token info. Check Console.");
      }

    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.response?.data || "Invalid Credentials or Server Error";
      alert("Login failed: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginCardStyle}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#2d3436', margin: '0' }}>Member Login</h2>
        <p style={{ color: '#636e72', fontSize: '13px', marginTop: '5px' }}>
            Enter your credentials to access TaskPro
        </p>
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
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// --- Professional UI Styles ---
const loginCardStyle = {
  padding: '40px',
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
  border: '1px solid #f1f2f6',
  width: '100%'
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '18px' };

const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };

const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#4a5568', marginLeft: '2px' };

const inputStyle = {
  padding: '12px 15px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: '#f8fafc'
};

const buttonStyle = {
  padding: '14px',
  backgroundColor: '#6c5ce7',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '10px',
  transition: 'all 0.2s'
};

export default Login;
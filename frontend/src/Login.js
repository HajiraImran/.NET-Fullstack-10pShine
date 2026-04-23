import React, { useState } from 'react';
import axios from 'axios';

function Login(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5006/api/auth/login', {
        email: email,
        password: password
      });
      alert("Login Successful!");
      if(props.onLoginSuccess) {
          props.onLoginSuccess(); 
      }
    } catch (error) {
      alert("Login fail: " + (error.response?.data || "Error"));
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>Login (Requirement #1)</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br/><br/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><br/><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
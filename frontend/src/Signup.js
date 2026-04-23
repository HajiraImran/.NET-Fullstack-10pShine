import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'User' });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5006/api/auth/register', formData);
      alert("Registration Successful!");
    } catch (err) {
      alert("Error: " + err.response?.data);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>Create Account (Requirement #1)</h2>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} required /><br/><br/>
        <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required /><br/><br/>
        <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required /><br/><br/>
        
        <label>Select Role: </label>
        <select onChange={e => setFormData({...formData, role: e.target.value})}>
          <option value="User">Regular User</option>
          <option value="Admin">Admin</option>
        </select><br/><br/>
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Signup;
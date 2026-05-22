import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
  // FIXED: Role ko default "User" rakha hai aur dropdown remove kar diya hai
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'User' 
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Backend ko data bhejte waqt role hamesha "User" hi jayega
      await axios.post('http://localhost:5006/api/auth/register', formData);
      alert("Registration Successful!.");
    } catch (err) {
      alert("Error: " + (err.response?.data || "Registration fail ho gayi"));
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', maxWidth: '400px' }}>
      <h2>Create Account</h2>
      <p style={{ fontSize: '12px', color: '#666' }}>Professional Note: All new accounts are registered as Regular Users.</p>
      
      <form onSubmit={handleSignup}>
        <input 
          type="text" 
          placeholder="Username" 
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          onChange={e => setFormData({...formData, username: e.target.value})} 
          required 
        /><br/>

        <input 
          type="email" 
          placeholder="Email" 
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
        /><br/>

        <input 
          type="password" 
          placeholder="Password" 
          style={{ width: '100%', marginBottom: '20px', padding: '8px' }}
          onChange={e => setFormData({...formData, password: e.target.value})} 
          required 
        /><br/>
        
        {/* Dropdown yahan se remove kar diya gaya hai mentor ki requirement ke mutabiq */}
        
        <button type="submit" style={{ cursor: 'pointer', padding: '10px 20px' }}>
          Register
        </button>
      </form>
    </div>
  );
}

export default Signup;
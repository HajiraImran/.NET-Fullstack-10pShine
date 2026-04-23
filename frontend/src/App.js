import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import TaskList from './TaskList';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Task Manager</h1>
      {!isLoggedIn ? (
        <>
          <Signup />
          <hr />
          <Login onLoginSuccess={() => setIsLoggedIn(true)} />
        </>
      ) : (
        <TaskList />
      )}
    </div>
  );
}

export default App;
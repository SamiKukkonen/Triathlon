import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css'; 
import backgroundVideo from './assets/TRIATHLON.mp4'; 

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Add the class to the body element when the component mounts
    document.body.classList.add('login-body');

    // Remove the class from the body element when the component unmounts
    return () => {
      document.body.classList.remove('login-body');
    };
  }, []); // Empty dependency array to run only once

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Send login credentials to backend for authentication
      const response = await axios.post('http://localhost:3000/check-login', {
        username,
        password
      });

      // Check if login was successful
      if (response.data.loggedIn) {
        // Call the onLoginSuccess callback passed from the parent component
        onLoginSuccess();
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <video autoPlay loop muted className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="content">
        <h1 className="login-title"> Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="button-container">
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}  

export default Login;

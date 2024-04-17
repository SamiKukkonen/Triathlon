import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './Login.css';
import backgroundVideo from './assets/TRIATHLON (1).mp4';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
const responseMessage = (response) => {
  console.log(response);
  onLoginSuccess()
};
const errorMessage = (error) => {
  console.log(error);
};

  useEffect(() => {
    document.body.classList.add('login-body');

    return () => {
      document.body.classList.remove('login-body');
    };
  }, []);


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/check-login', {
        username,
        password,
      });

      if (response.data.loggedIn) {
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
          <h1 className="login-title">Login</h1>
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
              <div className="google-login-container">
                <GoogleLogin 
                onSuccess={responseMessage}
                onError={errorMessage} 
                shape="circle" // Make the button a circle
                type="icon"
                />
              </div>
            </form>
        </div>
      </div>
  );
};

export default Login;

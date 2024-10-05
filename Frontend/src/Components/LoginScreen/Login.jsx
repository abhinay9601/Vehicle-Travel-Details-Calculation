import React, { useState } from 'react';
import './Login.css';
import Logo from '../../assets/logo.png'
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invalidPassword, setInvalidPassword] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.post(`${process.env.REACT_APP_HOSTNAME}/api/v1/user`, { email: username, password: password }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.data.error === 'Invalid password' && response.data.status === 400) {
      setInvalidPassword(true);
    } else if (response.status === 200) {
      localStorage.setItem('Authorization Details', JSON.stringify({ _id: response.data._id, email: response.data.email }));
      window.location.href = '/triplist';
    }
  };

  const handlePassword = (event) => {
    setInvalidPassword(false);
    setPassword(event.target.value);
  }

  return (
    <div className="login">
      <div className='login-container my-3 mx-3'>
        <img src={Logo} />
        <form onSubmit={handleSubmit}>
          <div className='email-pwd'>
            <div className='email-pwd-label'>
              <Form.Label >Email</Form.Label>
              <Form.Control
                type="text"
                placeholder='Example@email.com'
                value={username} onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className='d-flex flex-column gap-5'>
              <Form.Label htmlFor="inputPassword5">Password</Form.Label>
              <Form.Control
                type="password"
                id="inputPassword5"
                placeholder='At least 8 characters'
                aria-describedby="passwordHelpBlock"
                value={password} onChange={handlePassword}
              />
              {invalidPassword ? <p style={{ color: 'red' }}>Invalid Password</p> : ''}
            </div>
            <div className='display-login'>
              <Button onClick={handleSubmit} style={{ backgroundColor: '#162D3A', width: "14.5rem" }}>Sign in</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
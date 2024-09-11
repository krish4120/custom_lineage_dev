// src/Login.tsx

import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Simple validation
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    // Reset error if validation passes
    setError(null);

    // Handle login logic here
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          style={{ width: '100%', padding: '0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

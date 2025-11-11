import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await signup({ email, password, full_name: fullName });
      navigate('/login');
    } catch (err) {
      setError('Unable to create account');
    }
  };

  return (
    <div className="auth-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

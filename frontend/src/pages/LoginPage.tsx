import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface TokenResponse {
  access_token: string;
}

interface UserResponse {
  id: number;
  email: string;
  full_name?: string;
}

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const body = new URLSearchParams();
      body.append('username', email);
      body.append('password', password);
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }
      const token = (await response.json()) as TokenResponse;
      const userResponse = await fetch('http://localhost:8000/auth/me', {
        headers: { Authorization: `Bearer ${token.access_token}` }
      });
      const user = (await userResponse.json()) as UserResponse;
      login(token.access_token, user);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="auth-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
      <p>
        ¿No tienes cuenta? <Link to="/signup">Regístrate</Link>
      </p>
    </div>
  );
}

export default LoginPage;

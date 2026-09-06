import { useState, type FormEvent } from 'react';
import { login, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { setSession } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username.trim(), password);
      setSession({ token: res.token, role: res.role, rut: res.rut });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.statusCode === 401
            ? 'Usuario o contrasena incorrectos.'
            : err.message || 'No se pudo iniciar sesion.',
        );
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Iniciar sesion</h1>
      <p className="footer-note" style={{ margin: '0 0 20px' }}>
        Ingresa con tus credenciales para consultar el score de riesgo.
      </p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contrasena</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { login, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function LoginPage() {
  const { setSession } = useAuth();
  const { t } = useLanguage();
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
          err.statusCode === 401 ? t.login.errors.invalidCredentials : err.message || t.login.errors.generic,
        );
      } else {
        setError(t.login.errors.network);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>{t.login.title}</h1>
      <p className="footer-note" style={{ margin: '0 0 20px' }}>
        {t.login.subtitle}
      </p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="username">{t.login.usernameLabel}</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">{t.login.passwordLabel}</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? t.login.submitting : t.login.submit}
        </button>
      </form>
    </div>
  );
}

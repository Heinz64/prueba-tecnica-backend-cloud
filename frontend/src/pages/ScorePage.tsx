import { useState, type FormEvent } from 'react';
import { fetchScore, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface ScoreResult {
  rut: string;
  score: number;
  fecha: string;
}

function scoreBand(score: number): { label: string; className: 'low' | 'mid' | 'high' } {
  if (score < 40) return { label: 'Riesgo alto', className: 'low' };
  if (score < 70) return { label: 'Riesgo medio', className: 'mid' };
  return { label: 'Riesgo bajo', className: 'high' };
}

export function ScorePage() {
  const { session } = useAuth();
  const isUser = session?.role === 'user';
  const [rut, setRut] = useState(isUser ? (session?.rut ?? '') : '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetchScore(rut.trim(), session.token);
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 403) {
          setError('No tienes autorizacion para consultar el score de ese RUT.');
        } else if (err.statusCode === 401) {
          setError('Tu sesion expiro o no es valida. Vuelve a iniciar sesion.');
        } else if (err.statusCode === 400) {
          setError('El RUT ingresado no tiene un formato valido.');
        } else {
          setError(err.message || 'No se pudo consultar el score.');
        }
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card wide">
      <h1>Consulta de score</h1>
      <p className="footer-note" style={{ margin: '0 0 20px' }}>
        {isUser
          ? 'Consulta el score de riesgo asociado a tu RUT.'
          : 'Como administrador puedes consultar el score de cualquier RUT.'}
      </p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="rut">RUT</label>
          <input
            id="rut"
            name="rut"
            type="text"
            placeholder="12.345.678-5"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            readOnly={isUser}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !rut.trim()}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <div className="result-header">
            <span>RUT consultado</span>
            <strong>{result.rut}</strong>
          </div>

          <div className="score-row">
            <span className="score-value">{result.score}</span>
            <span className={`score-tag ${scoreBand(result.score).className}`}>
              {scoreBand(result.score).label}
            </span>
          </div>

          <div className="gauge-track">
            <div
              className={`gauge-fill ${scoreBand(result.score).className}`}
              style={{ width: `${result.score}%` }}
            />
          </div>

          <p className="footer-note" style={{ marginTop: 12 }}>
            Fecha de consulta: {new Date(result.fecha).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { fetchScore, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ScoreResult {
  rut: string;
  score: number;
  fecha: string;
}

type RiskBand = 'low' | 'mid' | 'high';

function scoreBand(score: number): RiskBand {
  if (score < 40) return 'low';
  if (score < 70) return 'mid';
  return 'high';
}

export function ScorePage() {
  const { session } = useAuth();
  const { t, language } = useLanguage();
  const isUser = session?.role === 'user';
  const [rut, setRut] = useState(isUser ? (session?.rut ?? '') : '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  // "low" (score bajo) = riesgo alto, y viceversa: la etiqueta describe el
  // riesgo, la clase CSS describe la magnitud del score.
  const riskLabel: Record<RiskBand, string> = {
    low: t.score.riskHigh,
    mid: t.score.riskMedium,
    high: t.score.riskLow,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetchScore(rut.trim(), session.token);
      setResult(res);
    } catch (err) {
      setResult(null);
      if (err instanceof ApiError) {
        if (err.statusCode === 403) {
          setError(t.score.errors.forbidden);
        } else if (err.statusCode === 401) {
          setError(t.score.errors.unauthorized);
        } else if (err.statusCode === 400) {
          setError(t.score.errors.badFormat);
        } else {
          setError(err.message || t.score.errors.generic);
        }
      } else {
        setError(t.score.errors.network);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card wide">
      <h1>{t.score.title}</h1>
      <p className="footer-note" style={{ margin: '0 0 20px' }}>
        {isUser ? t.score.subtitleUser : t.score.subtitleAdmin}
      </p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="rut">{t.score.rutLabel}</label>
          <input
            id="rut"
            name="rut"
            type="text"
            placeholder={t.score.rutPlaceholder}
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            readOnly={isUser}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !rut.trim()}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? t.score.submitting : t.score.submit}
        </button>
      </form>

      {loading && (
        <div className="skeleton" aria-hidden="true">
          <div className="skeleton-line short" />
          <div className="skeleton-line tall" />
          <div className="skeleton-line bar" />
        </div>
      )}

      {!loading && result && (
        <div className="result-card">
          <div className="result-header">
            <span>{t.score.resultRutLabel}</span>
            <strong>{result.rut}</strong>
          </div>

          <div className="score-row">
            <span className="score-value">{result.score}</span>
            <span className={`score-tag ${scoreBand(result.score)}`}>{riskLabel[scoreBand(result.score)]}</span>
          </div>

          <div className="gauge-track">
            <div className={`gauge-fill ${scoreBand(result.score)}`} style={{ width: `${result.score}%` }} />
          </div>

          <p className="footer-note" style={{ marginTop: 12 }}>
            {t.score.dateLabel} {new Date(result.fecha).toLocaleString(language === 'en' ? 'en-US' : 'es-CL')}
          </p>
        </div>
      )}
    </div>
  );
}

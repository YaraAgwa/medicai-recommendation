import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { translateSpecialty } from '../utils/specialties';

const URGENCY_STYLE = {
  routine: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Routine' },
  soon: { bg: '#fef3c7', color: '#b45309', label: 'See a doctor soon' },
  emergency: { bg: '#fef2f2', color: 'var(--danger)', label: 'Emergency — seek care now' },
};

export default function SymptomChecker() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api('/ai/symptom-check', {
        method: 'POST',
        body: JSON.stringify({ symptoms }),
      });
      setResult(data);
    } catch (err) {
      setError(t(`errors.${err.message}`, { defaultValue: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const urgency = result && (URGENCY_STYLE[result.urgency] || URGENCY_STYLE.routine);

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">
          🤖 {t('ai.title', { defaultValue: 'AI Symptom Checker' })}
        </h1>
        <p className="page-subtitle">
          {t('ai.subtitle', { defaultValue: 'Describe how you feel and get help finding the right specialist.' })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>{t('ai.symptomsLabel', { defaultValue: 'Your symptoms' })}</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t('ai.placeholder', { defaultValue: 'e.g. I have chest tightness and shortness of breath when climbing stairs...' })}
            required
            style={{ minHeight: 120 }}
          />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? t('ai.checking', { defaultValue: 'Thinking…' })
            : t('ai.check', { defaultValue: 'Get suggestion' })}
        </button>
      </form>

      {result && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <span
            className="badge"
            style={{ background: urgency.bg, color: urgency.color, marginBottom: '1rem' }}
          >
            {t(`ai.urgency_${result.urgency}`, { defaultValue: urgency.label })}
          </span>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>
            {t('ai.seeA', { defaultValue: 'Suggested specialist' })}
          </h2>
          <Link to={`/doctors?specialty=${encodeURIComponent(result.specialty)}`} className="btn btn-doctor btn-sm">
            {translateSpecialty(t, result.specialty)} →
          </Link>

          {result.also_consider?.length > 0 && (
            <p style={{ marginTop: '0.9rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {t('ai.alsoConsider', { defaultValue: 'You could also consider:' })}{' '}
              {result.also_consider.map((s, i) => (
                <span key={s}>
                  {i > 0 && ', '}
                  <Link to={`/doctors?specialty=${encodeURIComponent(s)}`}>{translateSpecialty(t, s)}</Link>
                </span>
              ))}
            </p>
          )}

          <p style={{ marginTop: '1.1rem', lineHeight: 1.75 }}>{result.advice}</p>
        </div>
      )}

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
        ⚠️ {t('ai.disclaimer', { defaultValue: 'This AI tool gives general guidance only. It is not a medical diagnosis. In an emergency, call your local emergency number.' })}
      </p>
    </div>
  );
}

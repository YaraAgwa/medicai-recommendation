import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, translateSpecialty } from '../utils/specialties';

export default function AskQuestion() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!loading && (!user || user.role !== 'patient')) {
    return <Navigate to="/login/patient" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const question = await api('/questions', {
        method: 'POST',
        body: JSON.stringify({ title, body, category }),
      });
      navigate(`/questions/${question.id}`);
    } catch (err) {
      setError(t(`errors.${err.message}`, { defaultValue: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading container">{t('common.loading')}</div>;

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">{t('questions.askTitle')}</h1>
        <p className="page-subtitle">{t('questions.askSub')}</p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('questions.questionTitle')}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('questions.questionTitlePlaceholder')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('questions.category')}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{translateSpecialty(t, c)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('questions.details')}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('questions.detailsPlaceholder')}
              required
              style={{ minHeight: 160 }}
            />
          </div>
          <button type="submit" className="btn btn-patient" disabled={submitting}>
            {submitting ? t('questions.posting') : t('questions.postQuestion')}
          </button>
        </form>
      </div>
    </div>
  );
}

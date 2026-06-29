import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { CATEGORIES, translateSpecialty } from '../utils/specialties';
import './Questions.css';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    const query = params.toString() ? `?${params}` : '';

    setLoading(true);
    api(`/questions${query}`)
      .then(setQuestions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, i18n.language]);

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('questions.title')}</h1>
        <p className="page-subtitle">{t('questions.subtitle')}</p>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder={t('questions.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{t('questions.allCategories')}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{translateSpecialty(t, c)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">{t('questions.loading')}</div>
      ) : questions.length === 0 ? (
        <div className="empty-state">{t('questions.empty')}</div>
      ) : (
        <div className="question-list">
          {questions.map((q) => (
            <Link key={q.id} to={`/questions/${q.id}`} className="question-card card card-hover">
              <div className="question-meta">
                <span className="badge badge-category">{translateSpecialty(t, q.category)}</span>
                <span className="answer-count">{t('questions.answers', { count: q.answer_count })}</span>
              </div>
              <h3>{q.title}</h3>
              <p className="question-preview">{q.body.slice(0, 150)}{q.body.length > 150 ? '...' : ''}</p>
              <div className="question-footer">
                <span>{t('questions.askedBy', { name: q.patient_name })}</span>
                <span>{new Date(q.created_at).toLocaleDateString(locale)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

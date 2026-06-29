import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { translateSpecialty } from '../utils/specialties';
import './QuestionDetail.css';

export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { t, i18n } = useTranslation();

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  const loadQuestion = () => {
    api(`/questions/${id}`)
      .then(setQuestion)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    loadQuestion();
  }, [id, i18n.language]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!user) {
      setError(t('questions.loginRequired'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api(`/questions/${id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ body: answer }),
      });
      setAnswer('');
      loadQuestion();
    } catch (err) {
      setError(t(`errors.${err.message}`, { defaultValue: err.message }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading container">{t('common.loading')}</div>;
  if (!question) return <div className="empty-state container">{t('questions.questionNotFound')}</div>;

  return (
    <div className="container question-detail">
      <Link to="/questions" className="back-link">{t('questions.backToQuestions')}</Link>

      <article className="card question-main">
        <div className="question-meta">
          <span className="badge badge-category">{translateSpecialty(t, question.category)}</span>
          <span className="date">{new Date(question.created_at).toLocaleString(locale)}</span>
        </div>
        <h1>{question.title}</h1>
        <p className="question-body">{question.body}</p>
        <div className="asked-by">
          {t('questions.askedBy', { name: question.patient_name })}
        </div>
      </article>

      <section className="answers-section">
        <h2>{t('questions.answers', { count: question.answers?.length || 0 })}</h2>

        {question.answers?.map((a) => (
          <div
            key={a.id}
            className={`card answer-card ${a.author_role === 'doctor' ? 'answer-card-doctor' : 'answer-card-patient'}`}
          >
            <div className="answer-header">
              <div>
                <strong>{a.author_name}</strong>
                <span className={`badge badge-${a.author_role}`}>{t(`roles.${a.author_role}`)}</span>
                {a.doctor_specialty && (
                  <span className="specialty-label">{translateSpecialty(t, a.doctor_specialty)}</span>
                )}
              </div>
              <span className="date">{new Date(a.created_at).toLocaleString(locale)}</span>
            </div>
            <p className="answer-body">{a.body}</p>
          </div>
        ))}

        {user ? (
          <form className="card answer-form" onSubmit={handleSubmitAnswer}>
            <h3>{t('questions.yourAnswer')}</h3>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={user.role === 'doctor'
                  ? t('questions.doctorAnswerPlaceholder')
                  : t('questions.patientAnswerPlaceholder')}
                required
              />
            </div>
            <button type="submit" className={`btn btn-${user.role}`} disabled={submitting}>
              {submitting ? t('questions.posting') : t('questions.postAnswer')}
            </button>
          </form>
        ) : (
          <div className="card login-prompt">
            <p>
              <Trans i18nKey="questions.loginToAnswer">
                <Link to="/login/patient">Login as Patient</Link> or{' '}
                <Link to="/login/doctor">Login as Doctor</Link> to answer this question.
              </Trans>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { translateSpecialty } from '../utils/specialties';

const ACTION_ICONS = {
  ask: { icon: '✏️', color: 'var(--patient-light)', textColor: 'var(--patient)' },
  questions: { icon: '💬', color: 'var(--primary-light)', textColor: 'var(--primary-dark)' },
  doctors: { icon: '🩺', color: 'var(--doctor-light)', textColor: 'var(--doctor)' },
  profile: { icon: '👤', color: '#f1f5f9', textColor: 'var(--text-muted)' },
};

function ActionCard({ to, iconKey, title, desc }) {
  const style = ACTION_ICONS[iconKey];
  return (
    <Link to={to} className="card card-hover action-card">
      <div
        className="action-card-icon"
        style={{ background: style.color, color: style.textColor }}
      >
        {style.icon}
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const { t, i18n } = useTranslation();

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  useEffect(() => {
    if (user) {
      api('/questions').then(setQuestions).catch(console.error);
    }
  }, [user, i18n.language]);

  if (!loading && !user) return <Navigate to="/" replace />;
  if (loading) return <div className="loading container">{t('common.loading')}</div>;

  const myQuestions = user.role === 'patient'
    ? questions.filter((q) => q.patient_id === user.id)
    : [];

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('dashboard.welcome', { name: user.name })}</h1>
        <p className="page-subtitle">
          <span className={`badge badge-${user.role}`}>{t(`roles.${user.role}`)}</span>
          {user.role === 'doctor' && user.profile?.specialty && (
            <span style={{ marginInlineStart: '0.5rem' }}>
              {translateSpecialty(t, user.profile.specialty)}
            </span>
          )}
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {user.role === 'patient' && (
          <ActionCard
            to="/ask"
            iconKey="ask"
            title={t('dashboard.askQuestion')}
            desc={t('dashboard.askQuestionDesc')}
          />
        )}
        <ActionCard
          to="/questions"
          iconKey="questions"
          title={t('dashboard.browseQuestions')}
          desc={user.role === 'doctor' ? t('dashboard.browseDoctorDesc') : t('dashboard.browsePatientDesc')}
        />
        <ActionCard
          to="/doctors"
          iconKey="doctors"
          title={t('dashboard.findDoctors')}
          desc={t('dashboard.findDoctorsDesc')}
        />
        <ActionCard
          to="/profile"
          iconKey="profile"
          title={t('dashboard.editProfile')}
          desc={t('dashboard.editProfileDesc')}
        />
      </div>

      {user.role === 'patient' && (
        <section>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: 700 }}>
            {t('dashboard.myQuestions', { count: myQuestions.length })}
          </h2>
          {myQuestions.length === 0 ? (
            <div className="empty-state">{t('dashboard.noMyQuestions')}</div>
          ) : (
            <div className="question-list">
              {myQuestions.map((q) => (
                <Link key={q.id} to={`/questions/${q.id}`} className="question-card card card-hover">
                  <span className="badge badge-category">{translateSpecialty(t, q.category)}</span>
                  <h3 style={{ margin: '0.65rem 0 0.35rem' }}>{q.title}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {t('dashboard.answersCount', { count: q.answer_count })} · {new Date(q.created_at).toLocaleDateString(locale)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {user.role === 'doctor' && (
        <section>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: 700 }}>
            {t('dashboard.unanswered')}
          </h2>
          {questions.filter((q) => q.answer_count === 0).length === 0 ? (
            <div className="empty-state">{t('dashboard.allAnswered')}</div>
          ) : (
            <div className="question-list">
              {questions.filter((q) => q.answer_count === 0).slice(0, 5).map((q) => (
                <Link key={q.id} to={`/questions/${q.id}`} className="question-card card card-hover">
                  <span className="badge badge-category">{translateSpecialty(t, q.category)}</span>
                  <h3 style={{ margin: '0.65rem 0 0.35rem' }}>{q.title}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {t('dashboard.byPatient', { name: q.patient_name })} · {new Date(q.created_at).toLocaleDateString(locale)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

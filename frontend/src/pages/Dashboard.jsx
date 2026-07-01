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

function StatCard({ icon, n, label }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
      <div style={{ fontSize: '1.6rem' }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>{n}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const { t, i18n } = useTranslation();

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  useEffect(() => {
    if (user) {
      api('/questions').then(setQuestions).catch(console.error);
    }
  }, [user, i18n.language]);

  useEffect(() => {
    api('/stats').then(setStats).catch(console.error);
  }, []);

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

      {stats && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: 700 }}>
            {t('dashboard.statsTitle', { defaultValue: 'Platform at a glance' })}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <StatCard icon="🩺" n={stats.doctors} label={t('dashboard.statDoctors', { defaultValue: 'Doctors' })} />
            <StatCard icon="🧑" n={stats.patients} label={t('dashboard.statPatients', { defaultValue: 'Patients' })} />
            <StatCard icon="💬" n={stats.questions} label={t('dashboard.statQuestions', { defaultValue: 'Questions' })} />
            <StatCard icon="✅" n={stats.answers} label={t('dashboard.statAnswers', { defaultValue: 'Answers' })} />
          </div>

          {stats.questionsByCategory.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                {t('dashboard.byCategory', { defaultValue: 'Questions by specialty' })}
              </h3>
              {stats.questionsByCategory.map((c) => {
                const max = stats.questionsByCategory[0].count || 1;
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={c.category} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                      <span>{translateSpecialty(t, c.category)}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{c.count}</span>
                    </div>
                    <div style={{ background: 'var(--bg-subtle)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--doctor))' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

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

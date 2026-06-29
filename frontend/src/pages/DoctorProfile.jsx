import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { translateSpecialty } from '../utils/specialties';
import './Doctors.css';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  useEffect(() => {
    api(`/doctors/${id}`)
      .then(setDoctor)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, i18n.language]);

  if (loading) return <div className="loading container">{t('common.loading')}</div>;
  if (!doctor) return <div className="empty-state container">{t('doctors.notFound')}</div>;

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <Link to="/doctors" className="back-link">{t('doctors.backToDoctors')}</Link>

      <div className="card doctor-profile-header">
        <div className="doctor-avatar">{doctor.name.charAt(0)}</div>
        <h1 className="page-title">{doctor.name}</h1>
        <span className="badge badge-doctor">{translateSpecialty(t, doctor.specialty)}</span>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{doctor.hospital}</p>
        <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>
          {t('doctors.yearsOfExperience', { count: doctor.experience_years })}
        </p>
        {doctor.bio && (
          <p style={{ marginTop: '1.25rem', lineHeight: 1.75, color: 'var(--text-muted)', maxWidth: 520, marginInline: 'auto' }}>
            {doctor.bio}
          </p>
        )}
      </div>

      {doctor.recentAnswers?.length > 0 && (
        <section>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem', fontWeight: 700 }}>
            {t('doctors.recentAnswers')}
          </h2>
          {doctor.recentAnswers.map((a) => (
            <div key={a.id} className="card recent-answer-card">
              <Link to={`/questions/${a.question_id}`}>
                {t('doctors.reQuestion', { title: a.question_title })}
              </Link>
              <p className="recent-answer-preview">
                {a.body.slice(0, 200)}{a.body.length > 200 ? '...' : ''}
              </p>
              <span className="date">{new Date(a.created_at).toLocaleDateString(locale)}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

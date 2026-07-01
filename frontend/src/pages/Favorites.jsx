import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { translateSpecialty } from '../utils/specialties';
import './Doctors.css';

export default function Favorites() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (user) {
      api('/favorites').then(setDoctors).catch(console.error).finally(() => setBusy(false));
    }
  }, [user]);

  if (!loading && (!user || user.role !== 'patient')) return <Navigate to="/" replace />;
  if (loading || busy) return <div className="loading container">{t('common.loading')}</div>;

  const remove = async (e, docId) => {
    e.preventDefault();
    e.stopPropagation();
    setDoctors((docs) => docs.filter((d) => d.id !== docId));
    try {
      await api(`/favorites/${docId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('favorites.title', { defaultValue: 'My Favorite Doctors' })}</h1>
      </div>

      {doctors.length === 0 ? (
        <div className="empty-state">
          {t('favorites.none', { defaultValue: 'No favorite doctors yet. Tap the 🤍 on a doctor to save them.' })}
        </div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doc) => (
            <Link key={doc.id} to={`/doctors/${doc.id}`} className="doctor-card card card-hover" style={{ position: 'relative' }}>
              <button
                type="button"
                className="fav-btn"
                onClick={(e) => remove(e, doc.id)}
                aria-label={t('favorites.remove', { defaultValue: 'Remove favorite' })}
              >
                ❤️
              </button>
              <div className="doctor-avatar">{doc.name.charAt(0)}</div>
              <h3>{doc.name}</h3>
              <span className="badge badge-doctor">{translateSpecialty(t, doc.specialty)}</span>
              <p className="doctor-hospital">{doc.hospital}</p>
              <p className="doctor-bio">{doc.bio?.slice(0, 100)}{doc.bio?.length > 100 ? '...' : ''}</p>
              <div className="doctor-stats">
                <span>📅 {t('doctors.yrsExperience', { count: doc.experience_years })}</span>
                <span>💬 {t('doctors.answersGiven', { count: doc.answers_given })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

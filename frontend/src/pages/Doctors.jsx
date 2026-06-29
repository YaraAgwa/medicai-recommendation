import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { translateSpecialty } from '../utils/specialties';
import './Doctors.css';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchParams] = useSearchParams();
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    api('/doctors/specialties').then(setSpecialties).catch(console.error);
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get('specialty') || '';
    setSpecialty(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const query = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
    api(`/doctors${query}`)
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialty, i18n.language]);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('doctors.title')}</h1>
        <p className="page-subtitle">{t('doctors.subtitle')}</p>
      </div>

      <div className="filters">
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          <option value="">{t('doctors.allSpecialties')}</option>
          {specialties.map((s) => (
            <option key={s} value={s}>{translateSpecialty(t, s)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">{t('doctors.loading')}</div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">{t('doctors.empty')}</div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doc) => (
            <Link key={doc.id} to={`/doctors/${doc.id}`} className="doctor-card card card-hover">
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

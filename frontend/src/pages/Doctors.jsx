import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { translateSpecialty } from '../utils/specialties';
import Avatar from '../components/Avatar';
import './Doctors.css';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchParams] = useSearchParams();
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    api('/doctors/specialties').then(setSpecialties).catch(console.error);
  }, []);

  // Load which doctors this patient already favorited (to fill in the hearts).
  useEffect(() => {
    if (user?.role === 'patient') {
      api('/favorites/ids').then((ids) => setFavoriteIds(new Set(ids))).catch(console.error);
    }
  }, [user]);

  const toggleFavorite = async (e, docId) => {
    e.preventDefault();  // don't follow the card's link
    e.stopPropagation();
    const isFav = favoriteIds.has(docId);
    // Update the screen immediately, then tell the server.
    const next = new Set(favoriteIds);
    isFav ? next.delete(docId) : next.add(docId);
    setFavoriteIds(next);
    try {
      if (isFav) {
        await api(`/favorites/${docId}`, { method: 'DELETE' });
      } else {
        await api('/favorites', { method: 'POST', body: JSON.stringify({ doctor_id: docId }) });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fromUrl = searchParams.get('specialty') || '';
    setSpecialty(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (specialty) params.set('specialty', specialty);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const query = params.toString() ? `?${params}` : '';
    api(`/doctors${query}`)
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialty, debouncedSearch, i18n.language]);

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{t('doctors.title')}</h1>
        <p className="page-subtitle">{t('doctors.subtitle')}</p>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder={t('doctors.searchPlaceholder', { defaultValue: 'Search doctors by name, specialty, hospital…' })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            <Link key={doc.id} to={`/doctors/${doc.id}`} className="doctor-card card card-hover" style={{ position: 'relative' }}>
              {user?.role === 'patient' && (
                <button
                  type="button"
                  className="fav-btn"
                  onClick={(e) => toggleFavorite(e, doc.id)}
                  aria-label={t('favorites.toggle', { defaultValue: 'Toggle favorite' })}
                >
                  {favoriteIds.has(doc.id) ? '❤️' : '🤍'}
                </button>
              )}
              <Avatar src={doc.avatar} name={doc.name} />
              <h3>{doc.name}</h3>
              <span className="badge badge-doctor">{translateSpecialty(t, doc.specialty)}</span>
              <p className="doctor-hospital">{doc.hospital}</p>
              <p className="doctor-bio">{doc.bio?.slice(0, 100)}{doc.bio?.length > 100 ? '...' : ''}</p>
              <div className="doctor-stats">
                <span>📅 {t('doctors.yrsExperience', { count: doc.experience_years })}</span>
                <span>💬 {t('doctors.answersGiven', { count: doc.answers_given })}</span>
                {doc.rating_count > 0 && <span>⭐ {doc.rating_avg.toFixed(1)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

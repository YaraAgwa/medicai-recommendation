import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading, refreshProfile } = useAuth();
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.profile) {
      setForm({ name: user.name, ...user.profile });
    }
  }, [user]);

  if (!loading && !user) return <Navigate to="/" replace />;
  if (loading) return <div className="loading container">{t('common.loading')}</div>;

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (user.role === 'doctor' && payload.experience_years) {
        payload.experience_years = parseInt(payload.experience_years);
      }
      if (user.role === 'patient' && payload.age) {
        payload.age = parseInt(payload.age);
      }
      await api('/profile/me', { method: 'PUT', body: JSON.stringify(payload) });
      await refreshProfile();
      setMessage(t('profile.updated'));
    } catch (err) {
      setError(t(`errors.${err.message}`, { defaultValue: err.message }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="page-header">
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="page-subtitle">
          <span className={`badge badge-${user.role}`}>{t(`roles.${user.role}`)}</span>
          {' '}{user.email}
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.fullName')}</label>
            <input value={form.name || ''} onChange={update('name')} required />
          </div>

          {user.role === 'patient' ? (
            <>
              <div className="grid-2">
                <div className="form-group">
                  <label>{t('auth.age')}</label>
                  <input type="number" value={form.age || ''} onChange={update('age')} />
                </div>
                <div className="form-group">
                  <label>{t('auth.gender')}</label>
                  <select value={form.gender || ''} onChange={update('gender')}>
                    <option value="">{t('auth.select')}</option>
                    <option value="Male">{t('auth.male')}</option>
                    <option value="Female">{t('auth.female')}</option>
                    <option value="Other">{t('auth.other')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('auth.phone')}</label>
                <input value={form.phone || ''} onChange={update('phone')} />
              </div>
              <div className="form-group">
                <label>{t('profile.medicalHistory')}</label>
                <textarea value={form.medical_history || ''} onChange={update('medical_history')} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>{t('auth.specialty')}</label>
                <input value={form.specialty || ''} onChange={update('specialty')} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>{t('auth.licenseNumber')}</label>
                  <input value={form.license_number || ''} onChange={update('license_number')} />
                </div>
                <div className="form-group">
                  <label>{t('profile.experienceYears')}</label>
                  <input type="number" value={form.experience_years || ''} onChange={update('experience_years')} />
                </div>
              </div>
              <div className="form-group">
                <label>{t('profile.hospital')}</label>
                <input value={form.hospital || ''} onChange={update('hospital')} />
              </div>
              <div className="form-group">
                <label>{t('auth.bio')}</label>
                <textarea value={form.bio || ''} onChange={update('bio')} />
              </div>
            </>
          )}

          <button type="submit" className={`btn btn-${user.role}`} disabled={saving}>
            {saving ? t('profile.saving') : t('profile.saveProfile')}
          </button>
        </form>
      </div>
    </div>
  );
}

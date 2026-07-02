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
      setForm({ name: user.name, avatar: user.avatar || null, ...user.profile });
    }
  }, [user]);

  // Shrink the chosen image in the browser to a small avatar, then turn it into
  // a base64 text string we can save in the database (no cloud storage needed).
  const resizeToDataUrl = (file, max = 256) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError(t('profile.notAnImage', { defaultValue: 'Please choose an image file.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t('profile.imageTooBig', { defaultValue: 'Image is too big (max 5MB).' }));
      return;
    }
    try {
      const dataUrl = await resizeToDataUrl(file);
      setForm((f) => ({ ...f, avatar: dataUrl }));
    } catch {
      setError(t('profile.imageError', { defaultValue: 'Could not read that image.' }));
    }
  };

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
          <div className="form-group" style={{ textAlign: 'center' }}>
            {form.avatar ? (
              <img
                src={form.avatar}
                alt=""
                style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block' }}
              />
            ) : (
              <div className="doctor-avatar" style={{ margin: '0 auto' }}>
                {(form.name || user.name || '?').charAt(0)}
              </div>
            )}
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                {t('profile.uploadPhoto', { defaultValue: 'Upload photo' })}
                <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              </label>
              {form.avatar && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setForm((f) => ({ ...f, avatar: null }))}
                >
                  {t('profile.removePhoto', { defaultValue: 'Remove' })}
                </button>
              )}
            </div>
          </div>

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
